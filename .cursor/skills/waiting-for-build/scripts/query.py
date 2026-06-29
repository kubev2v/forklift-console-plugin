#!/usr/bin/env python3
"""
Fetch the "Waiting on build" MTV tickets from the active sprint on board 11806,
find their merge commits in the local git repo, and check which are included in
one or more build tip commits.

Usage:
  python query.py [build_hash1] [build_hash2] ...

  Build hashes are optional. When omitted, the script prints the ticket/commit
  table without build-inclusion status.

Output (JSON to stdout):
  {
    "sprint": { "id": ..., "name": ..., "end": ... },
    "build_tips": ["8e059c6", "cfc05ae"],
    "issues": [
      {
        "key": "MTV-5388",
        "status": "MODIFIED",
        "priority": "Major",
        "summary": "...",
        "commit": "22da1d1",        # null if not found
        "pr": 2427,                  # null if not found
        "merge_date": "2026-05-20",  # null if not found
        "in_build": false            # null if no build tips supplied
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

import json
import os
import re
import subprocess
import sys
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


def jira_get(path: str, headers: dict, base: str) -> dict:
    """Perform a GET request against the Jira REST API and return the JSON response."""
    r = requests.get(f"{base}{path}", headers=headers, timeout=20)
    r.raise_for_status()
    return r.json()


# ── Jira queries ──────────────────────────────────────────────────────────────

def get_active_sprint(board_id: int, headers: dict, base: str) -> dict:
    """Return the first active sprint for the given Agile board."""
    data = jira_get(f"/rest/agile/1.0/board/{board_id}/sprint?state=active", headers, base)
    sprints = data.get("values", [])
    if not sprints:
        raise RuntimeError(f"No active sprint found on board {board_id}")
    return sprints[0]


def get_waiting_for_build_issues(sprint_id: int, headers: dict, base: str) -> list[dict]:
    """Return all MTV issues in the 'Waiting on build' column for the given sprint.

    Paginates automatically if the result set exceeds the page size.
    Includes the numeric issue id so callers can query the dev-status API.
    """
    status_clause = ",".join(f'"{s}"' for s in WAITING_STATUSES)
    jql           = f'({QUICK_FILTER}) AND status in ({status_clause})'
    encoded_jql   = urllib.parse.quote(jql)
    fields        = "summary,status,assignee,priority,fixVersions"

    page_size = 100
    start_at  = 0
    raw: list[dict] = []
    while True:
        path = (
            f"/rest/agile/1.0/sprint/{sprint_id}/issue"
            f"?jql={encoded_jql}&fields={fields}&maxResults={page_size}&startAt={start_at}"
        )
        data  = jira_get(path, headers, base)
        page  = data.get("issues", [])
        raw.extend(page)
        total    = data.get("total", len(raw))
        start_at += len(page)
        if start_at >= total or not page:
            break

    result = []
    for issue in raw:
        f = issue.get("fields", {})
        result.append({
            "id":          issue["id"],   # numeric id needed for dev-status API
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


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    """Entry point: query Jira + git and print JSON to stdout."""
    build_tips = sys.argv[1:]  # optional positional args

    jira_base, headers = get_auth_config()

    sprint = get_active_sprint(BOARD_ID, headers, jira_base)
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
        # Jira candidates are placed first so they take priority in the preference
        # logic below (in-build → most recent).
        jira_candidates: list[dict] = []
        for pr_num in get_prs_from_jira(issue["id"], headers, jira_base):
            c = find_commit_by_pr(pr_num)
            if c:
                jira_candidates.append(c)

        grep_candidate = find_merge_commit(issue["key"], build_tips or None)

        # Prefer any Jira-linked commit over git-grep results.  When both agree
        # (same PR number), deduplication via the build-preference loop is harmless.
        candidates = jira_candidates + ([grep_candidate] if grep_candidate else [])

        commit_info: Optional[dict] = None
        if candidates:
            if build_tips:
                for c in candidates:
                    if check_in_build(c["commit"], build_tips):
                        commit_info = c
                        break
            if not commit_info:
                commit_info = candidates[0]

        in_build: Optional[bool] = None
        if commit_info and build_tips:
            in_build = check_in_build(commit_info["commit"], build_tips)
        enriched.append({
            "key":         issue["key"],
            "status":      issue["status"],
            "priority":    issue["priority"],
            "assignee":    issue["assignee"],
            "summary":     issue["summary"],
            "fixVersions": issue["fixVersions"],
            "commit":      commit_info["commit"]     if commit_info else None,
            "pr":          commit_info["pr"]         if commit_info else None,
            "merge_date":  commit_info["merge_date"] if commit_info else None,
            "subject":     commit_info["subject"]    if commit_info else None,
            "in_build":    in_build,
        })

    output = {
        "board_id": BOARD_ID,
        "sprint": {
            "id":    sprint["id"],
            "name":  sprint["name"],
            "state": sprint["state"],
            "end":   sprint.get("endDate", "")[:10],
        },
        "build_tips": build_tips,
        "issues":     enriched,
    }
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
