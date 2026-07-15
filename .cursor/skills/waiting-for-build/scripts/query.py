#!/usr/bin/env python3
"""
Fetch the "Waiting on build" MTV tickets from the active sprint on board 11806,
find their merge commits in the local git repo, and check which are included in
one or more build tip commits.

Usage:
  python query.py [--sprint SPRINT_ID] [--build-version X.Y.Z] [build_hash1] ...
  python query.py --help

  Build hashes are optional. When omitted, the script prints the ticket/commit
  table without build-inclusion status.

  --sprint SPRINT_ID
      Sprint ID to use instead of querying the Agile API. Required on Red Hat's
      Jira instance, where the Agile API is blocked by SSO. Get the ID via the
      Jira MCP: jira_get_sprints_from_board(board_id="11806", state="active").

  --build-version X.Y.Z
      Version of the build being checked (e.g. "2.12.2" from "IIB 2.12.2-6").
      When supplied, `in_build` also requires the ticket's fixVersion to match
      the build's major.minor stream (e.g. stream "2.12" matches fixVersions
      "2.12.1", "2.12.2"; does NOT match "5.0.0"). This prevents backport merge
      commits from falsely marking a mainline-targeted ticket as "in build".

Output (JSON to stdout):
  {
    "sprint":        { "id": ..., "name": ..., "end": ... },
    "build_tips":    ["8e059c6", "cfc05ae"],
    "build_version": "2.12.2",   // null if not supplied
    "build_stream":  "2.12",     // null if not supplied
    "issues": [
      {
        "key":                "MTV-5388",
        "status":             "MODIFIED",
        "priority":           "Major",
        "summary":            "...",
        "fixVersions":        ["2.12.2"],
        "commit":             "22da1d1",   # null if not found
        "pr":                 2427,        # null if not found
        "merge_date":         "2026-05-20",# null if not found
        "version_match":      true,        # null if no --build-version supplied
        "fix_version_missing": false,      # true if --build-version supplied but ticket has no fixVersion
        "in_build":           false        # null if no build tips supplied
      },
      ...
    ]
  }

Requires:
  pip install requests

Reads credentials from environment variables (or .mcp.json fallback):
  JIRA_URL          https://redhat.atlassian.net
  JIRA_USERNAME     <your Atlassian account email>
  JIRA_API_TOKEN    ATATT3x...
"""

import argparse
import json
import os
import re
import subprocess
import urllib.parse
from base64 import b64encode
from typing import Optional

import requests

# ── Configuration ────────────────────────────────────────────────────────────

BOARD_ID         = 11806
QUICK_FILTER     = "project = \"Migration Toolkit for Virtualization\""
WAITING_STATUSES = ["MODIFIED", "Dev Complete"]

_here    = os.path.abspath(__file__)                         # .../scripts/query.py
REPO_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(_here)))))

# ── CLI ───────────────────────────────────────────────────────────────────────

def parse_args() -> argparse.Namespace:
    """Parse CLI flags: --sprint, --build-version, and positional build tip hashes."""
    parser = argparse.ArgumentParser(
        description="Query Jira + git for 'Waiting on build' MTV tickets and check build inclusion.",
    )
    parser.add_argument(
        "--sprint", type=int, default=None, metavar="SPRINT_ID",
        help="Sprint ID to use instead of the Agile API (required on Red Hat Jira, "
             "where the Agile API is SSO-blocked).",
    )
    parser.add_argument(
        "--build-version", dest="build_version", default=None, metavar="X.Y.Z",
        help='Build version, e.g. "2.12.2". When supplied, in_build also requires '
             "the ticket's fixVersion to match the build's major.minor stream.",
    )
    parser.add_argument(
        "build_tips", nargs="*", metavar="HASH",
        help="Build tip commit hashes. Omit to skip build-inclusion analysis.",
    )
    return parser.parse_args()


# ── Credentials ───────────────────────────────────────────────────────────────

def _load_mcp_creds() -> tuple[str, str, str]:
    """Return (url, username, token) from .mcp.json, or empty strings on failure."""
    mcp_path = os.path.join(REPO_DIR, ".mcp.json")
    try:
        with open(mcp_path) as f:
            mcp = json.load(f)
        env = mcp.get("mcpServers", {}).get("jira-mcp", {}).get("env", {})
        return (
            env.get("JIRA_URL", ""),
            env.get("JIRA_USERNAME", ""),
            env.get("JIRA_API_TOKEN", ""),
        )
    except Exception:
        return ("", "", "")


def get_auth_config() -> tuple[str, dict]:
    """Return (jira_base_url, auth_headers) using env vars with .mcp.json fallback."""
    _url, _user, _token = _load_mcp_creds()
    url      = os.getenv("JIRA_URL")       or _url
    username = os.getenv("JIRA_USERNAME")  or _user
    token    = os.getenv("JIRA_API_TOKEN") or _token
    if not (url and username and token):
        raise RuntimeError(
            "Jira credentials missing. Set JIRA_URL, JIRA_USERNAME, JIRA_API_TOKEN "
            "or populate .mcp.json with those values."
        )
    encoded = b64encode(f"{username}:{token}".encode()).decode()
    return url, {"Authorization": f"Basic {encoded}", "Accept": "application/json"}


# ── Jira queries ──────────────────────────────────────────────────────────────

def jira_search(jql: str, fields: str, headers: dict, base: str, max_results: int = 100) -> list[dict]:
    """Run a JQL search, paginating via nextPageToken until all issues are collected.

    Uses the current Jira Cloud search endpoint (POST /rest/api/3/search/jql).
    Falls back to the legacy GET /rest/api/3/search endpoint (single page, no
    pagination-token support) if the new endpoint 404s on this instance.
    """
    all_issues: list[dict] = []
    next_page_token: Optional[str] = None
    while True:
        payload: dict = {"jql": jql, "fields": fields.split(","), "maxResults": max_results}
        if next_page_token:
            payload["nextPageToken"] = next_page_token
        r = requests.post(
            f"{base}/rest/api/3/search/jql",
            headers={**headers, "Content-Type": "application/json"},
            json=payload, timeout=20)
        if r.status_code == 404:
            encoded = urllib.parse.quote(jql)
            r2 = requests.get(
                f"{base}/rest/api/3/search?jql={encoded}&fields={fields}&maxResults={max_results}",
                headers=headers, timeout=20)
            r2.raise_for_status()
            return r2.json().get("issues", [])
        r.raise_for_status()
        data = r.json()
        page = data.get("issues", [])
        all_issues.extend(page)
        next_page_token = data.get("nextPageToken")
        if not next_page_token or not page:
            break
    return all_issues


def get_active_sprint(board_id: int, headers: dict, base: str) -> dict:
    """Return the first active sprint for the given Agile board.

    Raises RuntimeError with a clear remediation step if the Agile API is
    unavailable (e.g. blocked by SSO on Red Hat's Jira instance) — pass
    --sprint SPRINT_ID to bypass this call entirely.
    """
    r = requests.get(
        f"{base}/rest/agile/1.0/board/{board_id}/sprint?state=active",
        headers=headers, timeout=20)
    if r.ok:
        sprints = r.json().get("values", [])
        if sprints:
            return sprints[0]
    raise RuntimeError(
        f"Could not fetch the active sprint for board {board_id} (HTTP {r.status_code}). "
        "On Red Hat's Jira instance the Agile API is blocked by SSO — pass --sprint "
        'SPRINT_ID instead (get the ID via the Jira MCP: '
        'jira_get_sprints_from_board(board_id="11806", state="active")).'
    )


def get_sprint_by_id(sprint_id: int, headers: dict, base: str) -> dict:
    """Return a sprint dict for an explicitly supplied sprint id (via --sprint).

    Enriches with name/state/endDate via a direct REST lookup when possible, but
    works even if that lookup fails — the id is all that's strictly needed to
    build the JQL query.
    """
    sprint_info: dict = {}
    try:
        r = requests.get(f"{base}/rest/agile/1.0/sprint/{sprint_id}", headers=headers, timeout=20)
        if r.ok:
            sprint_info = r.json()
    except requests.RequestException:
        pass
    return {
        "id":      sprint_id,
        "name":    sprint_info.get("name", f"Sprint {sprint_id}"),
        "state":   sprint_info.get("state", "active"),
        "endDate": sprint_info.get("endDate", ""),
    }


def get_waiting_for_build_issues(sprint_id: int, headers: dict, base: str) -> list[dict]:
    """Return all MTV issues in the 'Waiting on build' column for the given sprint.

    Paginates automatically. Includes the numeric issue id for the dev-status API.
    """
    status_clause = ",".join(f'"{s}"' for s in WAITING_STATUSES)
    jql    = f'({QUICK_FILTER}) AND sprint = {sprint_id} AND status in ({status_clause})'
    fields = "summary,status,assignee,priority,fixVersions"

    raw = jira_search(jql, fields, headers, base, max_results=100)

    result = []
    for issue in raw:
        f = issue.get("fields", {})
        result.append({
            "id":          issue["id"],
            "key":         issue["key"],
            "status":      (f.get("status")   or {}).get("name", "?"),
            "priority":    (f.get("priority") or {}).get("name", "?"),
            "assignee":    (f.get("assignee") or {}).get("displayName", "Unassigned"),
            "summary":     f.get("summary", ""),
            "fixVersions": [v.get("name", "") for v in f.get("fixVersions", [])],
        })
    return result


def get_prs_from_jira(issue_id: str, headers: dict, base: str) -> list[int]:
    """Return merged GitHub PR numbers linked to the issue via Jira's dev-status API.

    Falls back to an empty list on any error (permission denied, no links, etc.).
    """
    try:
        r = requests.get(
            f"{base}/rest/dev-status/1.0/issue/detail",
            headers=headers,
            params={"issueId": issue_id, "applicationType": "GitHub", "dataType": "pullrequest"},
            timeout=20,
        )
        if not r.ok:
            return []
        prs = []
        for detail in r.json().get("detail", []):
            for pr in detail.get("pullRequests", []):
                if pr.get("status") == "MERGED":
                    pr_id = pr.get("id", "")          # e.g. "#2427"
                    m = re.search(r'(\d+)', pr_id)
                    if m:
                        prs.append(int(m.group(1)))
        return prs
    except Exception:
        return []


def find_commit_by_pr(pr_number: int) -> Optional[dict]:
    """Search git log for a merge commit that references a GitHub PR number.

    Looks for the pattern (#<number>) that GitHub adds to merge commit subjects.
    """
    try:
        out = _git([
            "log", "--all", f"--grep=(#{pr_number})",
            "--format=%H %ad %s", "--date=short",
        ])
        for line in out.splitlines():
            if f"(#{pr_number})" in line:
                return _parse_commit_line(line)
        return None
    except subprocess.CalledProcessError:
        return None


# ── Git queries ───────────────────────────────────────────────────────────────

def _git(args: list[str]) -> str:
    """Run a git command in REPO_DIR and return stdout as a stripped string."""
    return subprocess.check_output(
        ["git", *args], cwd=REPO_DIR, stderr=subprocess.DEVNULL, text=True
    ).strip()


def _parse_commit_line(line: str) -> Optional[dict]:
    """Parse a single 'git log --format=%H %ad %s' line into a commit dict, or None."""
    parts = line.split(" ", 2)
    if len(parts) < 3:
        return None
    full_hash, date, subject = parts[0], parts[1], parts[2]
    pr_match = re.search(r'\(#(\d+)\)', subject)
    return {
        "commit":     full_hash[:7],
        "merge_date": date,
        "pr":         int(pr_match.group(1)) if pr_match else None,
        "subject":    subject,
    }


def find_merge_commit(ticket_key: str, build_tips: Optional[list[str]] = None) -> Optional[dict]:
    """Return the merge commit info for a Jira ticket key, or None.

    Uses a whole-word grep so MTV-5 does not accidentally match MTV-50 or MTV-500.
    Checks both the commit subject and body for the ticket key, so commits that
    place the reference only in the body (e.g. "Resolves: MTV-XXXX" on its own
    line) are not silently dropped by the subject-only post-filter.
    When build_tips are provided, prefers the most recent commit that is an
    ancestor of any build tip — avoiding false negatives when a ticket has
    multiple commits (e.g., original merge plus a follow-up fix or cherry-pick).
    Falls back to the first whole-word match if none are build-reachable.
    """
    try:
        out = _git([
            "log", "--all", f"--grep={ticket_key}", "-i",
            "--format=%H %ad %s", "--date=short",
        ])
        if not out:
            return None
        pattern = re.compile(rf'\b{re.escape(ticket_key)}\b', re.IGNORECASE)
        candidates = []
        for line in out.splitlines():
            if pattern.search(line):
                # Key is present in the subject line — fast path.
                c = _parse_commit_line(line)
                if c:
                    candidates.append(c)
                continue
            # Key may be only in the commit body (e.g. "Resolves: MTV-XXXX" on
            # its own line). git's --grep found it there; verify with the full body.
            parts = line.split(" ", 2)
            if not parts:
                continue
            try:
                body = _git(["log", "-1", "--format=%B", parts[0]])
                if pattern.search(body):
                    c = _parse_commit_line(line)
                    if c:
                        candidates.append(c)
            except subprocess.CalledProcessError:
                pass

        if not candidates:
            return None

        # Prefer the most recent commit reachable from the build when tips are known.
        if build_tips:
            for candidate in candidates:
                if check_in_build(candidate["commit"], build_tips):
                    return candidate

        return candidates[0]
    except subprocess.CalledProcessError:
        return None


def is_ancestor(commit: str, build_tip: str) -> bool:
    """Return True if `commit` is an ancestor of (or equal to) `build_tip`."""
    try:
        subprocess.check_call(
            ["git", "merge-base", "--is-ancestor", commit, build_tip],
            cwd=REPO_DIR, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        )
        return True
    except subprocess.CalledProcessError:
        return False


def check_in_build(commit: str, build_tips: list[str]) -> bool:
    """Return True if `commit` is reachable from any of the build tip commits."""
    return any(is_ancestor(commit, tip) for tip in build_tips)


# ── Version stream helpers ─────────────────────────────────────────────────────

def parse_stream(version: str) -> str:
    """Return the 'major.minor' stream from a version string.

    Examples:
        "2.12.2"  → "2.12"
        "5.0.0"   → "5.0"
        "2.12"    → "2.12"
    """
    parts = version.split(".")
    if len(parts) >= 2:
        return f"{parts[0]}.{parts[1]}"
    return version


def version_matches_stream(fix_versions: list[str], build_stream: str) -> bool:
    """Return True if any fixVersion has the same major.minor as build_stream.

    A ticket targeting "5.0.0" does NOT match a "2.12" z-stream build.
    A ticket targeting "2.12.2" or "2.12.1" DOES match a "2.12" build.
    When fix_versions is empty the result is False (unknown → no match); callers
    should check for the empty-list case separately if they need to distinguish
    "no fixVersion set" from "fixVersion targets a different stream".
    """
    return any(parse_stream(fv) == build_stream for fv in fix_versions)


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    """Entry point: query Jira + git and print JSON to stdout."""
    args = parse_args()
    build_stream: Optional[str] = parse_stream(args.build_version) if args.build_version else None
    build_tips = args.build_tips

    jira_base, headers = get_auth_config()

    sprint = (
        get_sprint_by_id(args.sprint, headers, jira_base)
        if args.sprint is not None
        else get_active_sprint(BOARD_ID, headers, jira_base)
    )
    issues = get_waiting_for_build_issues(sprint["id"], headers, jira_base)

    enriched = []
    for issue in issues:
        # Collect candidates from two independent sources and merge them.
        #
        # Source A — Jira dev-status API: PRs that a developer explicitly linked to
        # the ticket in Jira's development panel. This is the authoritative signal;
        # it works even when the commit message contains no ticket key.
        #
        # Source B — git grep: commits whose message (subject or body) mentions the
        # ticket key. Covers the common "Resolves: MTV-XXXX" convention but can
        # produce false positives when unrelated commits reference the key in passing.
        #
        # Both sources are always queried; Jira candidates are placed first so they
        # take priority in the preference logic below (in-build → most recent).
        jira_candidates: list[dict] = []
        for pr_num in get_prs_from_jira(issue["id"], headers, jira_base):
            c = find_commit_by_pr(pr_num)
            if c:
                jira_candidates.append(c)

        grep_candidate = find_merge_commit(issue["key"], build_tips or None)

        candidates = jira_candidates + ([grep_candidate] if grep_candidate else [])

        commit_info: Optional[dict] = None
        commit_in_build = False
        if candidates:
            if build_tips:
                for c in candidates:
                    if check_in_build(c["commit"], build_tips):
                        commit_info = c
                        commit_in_build = True
                        break
            if not commit_info:
                commit_info = candidates[0]
                # None of the candidates were reachable from a build tip (or no
                # build_tips were supplied) — commit_in_build stays False.

        # Version-stream check: does any fixVersion target the build's stream?
        # Null when no --build-version was supplied (can't evaluate). Tracked
        # separately from "no fixVersion set at all", which is ambiguous rather
        # than a genuine stream mismatch — surfaced via fix_version_missing so
        # it isn't silently indistinguishable from a real wrong-stream ticket.
        version_match: Optional[bool] = None
        fix_version_missing = False
        if build_stream is not None:
            if not issue["fixVersions"]:
                fix_version_missing = True
                version_match = False
            else:
                version_match = version_matches_stream(issue["fixVersions"], build_stream)

        # in_build requires the commit to be a git ancestor of the build tip
        # AND (when known) the ticket's fixVersion to target the same stream.
        # A 5.0.0 ticket found via a backport commit must NOT be marked in_build
        # against a 2.12.x build.
        in_build: Optional[bool] = None
        if commit_info and build_tips:
            in_build = commit_in_build and version_match if version_match is not None else commit_in_build

        enriched.append({
            "key":                 issue["key"],
            "status":              issue["status"],
            "priority":            issue["priority"],
            "assignee":            issue["assignee"],
            "summary":             issue["summary"],
            "fixVersions":         issue["fixVersions"],
            "commit":              commit_info["commit"]     if commit_info else None,
            "pr":                  commit_info["pr"]         if commit_info else None,
            "merge_date":          commit_info["merge_date"] if commit_info else None,
            "subject":             commit_info["subject"]    if commit_info else None,
            "version_match":       version_match,
            "fix_version_missing": fix_version_missing,
            "in_build":            in_build,
        })

    output = {
        "board_id":      BOARD_ID,
        "sprint": {
            "id":    sprint["id"],
            "name":  sprint["name"],
            "state": sprint["state"],
            "end":   sprint.get("endDate", "")[:10],
        },
        "build_tips":    build_tips,
        "build_version": args.build_version,
        "build_stream":  build_stream,
        "issues":        enriched,
    }
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
