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
  JIRA_USERNAME     pabreu@redhat.com
  JIRA_API_TOKEN    ATATT3x...
"""

import json
import os
import re
import subprocess
import sys
from base64 import b64encode
from typing import Optional
import requests

# ── Configuration ────────────────────────────────────────────────────────────

BOARD_ID       = 11806
QUICK_FILTER   = "project = \"Migration Toolkit for Virtualization\""
# "Waiting on build" column status IDs on board 11806
WAITING_STATUSES = ["MODIFIED", "Dev Complete"]

_here    = os.path.abspath(__file__)                         # .../scripts/query.py
REPO_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(_here)))))

# ── Credentials ───────────────────────────────────────────────────────────────

def _load_mcp_creds() -> tuple[str, str, str]:
    """Fall back to reading .mcp.json when env vars are absent."""
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


def get_auth_header() -> dict:
    url      = os.getenv("JIRA_URL")      or _load_mcp_creds()[0]
    username = os.getenv("JIRA_USERNAME") or _load_mcp_creds()[1]
    token    = os.getenv("JIRA_API_TOKEN") or _load_mcp_creds()[2]
    if not (url and username and token):
        raise RuntimeError(
            "Jira credentials missing. Set JIRA_URL, JIRA_USERNAME, JIRA_API_TOKEN "
            "or populate .mcp.json with those values."
        )
    encoded = b64encode(f"{username}:{token}".encode()).decode()
    return {"Authorization": f"Basic {encoded}", "Accept": "application/json"}


def jira_get(path: str, headers: dict, base: str = "https://redhat.atlassian.net") -> dict:
    r = requests.get(f"{base}{path}", headers=headers, timeout=20)
    r.raise_for_status()
    return r.json()


# ── Jira queries ──────────────────────────────────────────────────────────────

def get_active_sprint(board_id: int, headers: dict) -> dict:
    data = jira_get(f"/rest/agile/1.0/board/{board_id}/sprint?state=active", headers)
    sprints = data.get("values", [])
    if not sprints:
        raise RuntimeError(f"No active sprint found on board {board_id}")
    return sprints[0]


def get_waiting_for_build_issues(sprint_id: int, headers: dict) -> list[dict]:
    status_clause = ",".join(f'"{s}"' for s in WAITING_STATUSES)
    jql = (
        f'({QUICK_FILTER}) AND status in ({status_clause})'
    )
    import urllib.parse
    encoded_jql = urllib.parse.quote(jql)
    fields = "summary,status,assignee,priority,fixVersions"
    path = (
        f"/rest/agile/1.0/sprint/{sprint_id}/issue"
        f"?jql={encoded_jql}&fields={fields}&maxResults=100"
    )
    data = jira_get(path, headers)
    issues = data.get("issues", [])
    result = []
    for issue in issues:
        f = issue.get("fields", {})
        result.append({
            "key":      issue["key"],
            "status":   (f.get("status") or {}).get("name", "?"),
            "priority": (f.get("priority") or {}).get("name", "?"),
            "assignee": (f.get("assignee") or {}).get("displayName", "Unassigned"),
            "summary":  f.get("summary", ""),
            "fixVersions": [v.get("name", "") for v in f.get("fixVersions", [])],
        })
    return result


# ── Git queries ───────────────────────────────────────────────────────────────

def _git(args: list[str]) -> str:
    return subprocess.check_output(
        ["git"] + args, cwd=REPO_DIR, stderr=subprocess.DEVNULL, text=True
    ).strip()


def find_merge_commit(ticket_key: str) -> Optional[dict]:
    """Return the merge commit info for a Jira ticket key, or None."""
    try:
        # Search by ticket key in commit message (case-insensitive)
        out = _git(["log", "--oneline", "--all", f"--grep={ticket_key}", "-i", "--format=%H %ad %s", "--date=short"])
        if not out:
            return None
        # Take the first (most recent) match
        first_line = out.splitlines()[0]
        parts = first_line.split(" ", 2)
        if len(parts) < 3:
            return None
        full_hash, date, subject = parts[0], parts[1], parts[2]
        short_hash = full_hash[:7]
        # Extract PR number from subject like "(#2442)"
        pr_match = re.search(r'\(#(\d+)\)', subject)
        pr = int(pr_match.group(1)) if pr_match else None
        return {"commit": short_hash, "merge_date": date, "pr": pr, "subject": subject}
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

def main():
    build_tips = sys.argv[1:]  # optional positional args

    headers = get_auth_header()

    sprint = get_active_sprint(BOARD_ID, headers)
    issues = get_waiting_for_build_issues(sprint["id"], headers)

    enriched = []
    for issue in issues:
        commit_info = find_merge_commit(issue["key"])
        in_build: Optional[bool] = None
        if commit_info and build_tips:
            in_build = check_in_build(commit_info["commit"], build_tips)
        enriched.append({
            "key":        issue["key"],
            "status":     issue["status"],
            "priority":   issue["priority"],
            "assignee":   issue["assignee"],
            "summary":    issue["summary"],
            "fixVersions": issue["fixVersions"],
            "commit":     commit_info["commit"] if commit_info else None,
            "pr":         commit_info["pr"] if commit_info else None,
            "merge_date": commit_info["merge_date"] if commit_info else None,
            "subject":    commit_info["subject"] if commit_info else None,
            "in_build":   in_build,
        })

    output = {
        "board_id":   BOARD_ID,
        "sprint":     {
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
