#!/usr/bin/env python3
"""
Find the latest MTV build post in the #mtv-builds Slack channel and extract
the forklift-console-plugin commit hashes.

Uses `slackdump` (https://github.com/rusq/slackdump) to read the channel
history — no Slack app token required, works with existing desktop-app session.

Usage:
  python fetch-build.py [--channel CHANNEL_ID] [--all] [--days N]

Output (JSON to stdout):
  {
    "build_label": "IIB 2.12.0-44 | 02.06.2026 19:04 UTC",
    "ts": "1780427056.785919",
    "console_plugin_commits": ["8e059c6", "cfc05ae"],
    "mtv_console_plugin_container": "8e059c6f48a7715179038e9bd12151c88c5f9bf1"
  }

Pass the first commit from console_plugin_commits (or mtv_console_plugin_container)
to query.py as the build tip hash.

─── Setup (one-time) ─────────────────────────────────────────────────────────

1. Install slackdump:
     brew install slackdump

2. Get credentials from the Slack desktop app DevTools console:
     Object.values(JSON.parse(localStorage["localConfig_v2"]).teams)
       .map(t => ({name: t.name, token: t.token}))[0]
   Copy the token for the "Red Hat" workspace.

3. Run once to authenticate:
     slackdump workspace new -no-encryption -token <xoxc-token> -cookie <xoxd-cookie> redhat
     slackdump workspace select redhat

4. Store credentials in .mcp.json (mcpServers.slack.env):
     SLACK_TOKEN       xoxc-... (Red Hat workspace)
     SLACK_COOKIE      xoxd-... (d= cookie from Slack desktop)
     SLACK_CHANNEL_ID  C09DS44AQ65 (mtv-builds channel ID)
     SLACKDUMP_WORKSPACE  redhat (name used in step 3)
"""

import argparse
import datetime
import json
import os
import re
import shutil
import sqlite3
import subprocess
import sys
import tempfile
import threading
from pathlib import Path

# ── Constants ─────────────────────────────────────────────────────────────────

_here       = Path(__file__).resolve()
REPO_DIR    = _here.parents[4]

DEFAULT_CHANNEL_ID = "C09DS44AQ65"
DEFAULT_WORKSPACE  = "redhat"
DEFAULT_DAYS       = 30

IIB_TITLE_RE    = re.compile(r'IIB\s+[\d.]+[-\w]*\s*\|', re.IGNORECASE)
CONTAINER_RE    = re.compile(r'mtv-console-plugin-container:\s*([0-9a-f]{40})', re.IGNORECASE)
COMMIT_SHORT_RE = re.compile(r'\b([0-9a-f]{7,40})\b')


# ── Config from .mcp.json ─────────────────────────────────────────────────────

def _load_mcp_env() -> dict:
    """Return the Slack env block from .mcp.json, or an empty dict on failure."""
    mcp_path = REPO_DIR / ".mcp.json"
    try:
        mcp = json.loads(mcp_path.read_text())
        return mcp.get("mcpServers", {}).get("slack", {}).get("env", {})
    except Exception:
        return {}


# ── slackdump helpers ──────────────────────────────────────────────────────────

def _slackdump_bin() -> str:
    """Return the path to the slackdump binary, or exit with an error if not found."""
    sd = shutil.which("slackdump")
    if not sd:
        print("ERROR: slackdump not found. Install with: brew install slackdump", file=sys.stderr)
        sys.exit(1)
    return sd


def _ensure_workspace(workspace: str, token: str, cookie: str) -> None:
    """Authenticate slackdump workspace if not already set up."""
    sd = _slackdump_bin()

    result = subprocess.run([sd, "workspace", "list"], capture_output=True, text=True)
    if workspace in result.stdout:
        # Select it as active
        subprocess.run([sd, "workspace", "select", workspace],
                       capture_output=True, text=True)
        return

    if not token:
        print(
            "ERROR: slackdump workspace not configured and no SLACK_TOKEN provided.\n\n"
            "Run once to set up:\n"
            "  slackdump workspace new -no-encryption -token <xoxc-...> -cookie <xoxd-...> redhat\n\n"
            "Or add to .mcp.json → mcpServers.slack.env:\n"
            "  SLACK_TOKEN=xoxc-...\n"
            "  SLACK_COOKIE=xoxd-...\n"
            "  SLACK_CHANNEL_ID=C09DS44AQ65\n"
            "  SLACKDUMP_WORKSPACE=redhat",
            file=sys.stderr,
        )
        sys.exit(1)

    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False) as tmp:
        tmp.write(cookie)
        cookie_file = Path(tmp.name)
    try:
        r = subprocess.run(
            [sd, "workspace", "new", "-no-encryption",
             "-token", token, "-cookie", str(cookie_file), workspace],
            capture_output=True, text=True,
        )
        if r.returncode != 0:
            print("ERROR: slackdump workspace new failed:", r.stderr, file=sys.stderr)
            sys.exit(1)
    finally:
        cookie_file.unlink(missing_ok=True)

    subprocess.run([sd, "workspace", "select", workspace], capture_output=True)


def _archive_channel(channel_id: str, days: int) -> Path:
    """Archive recent channel history into a temp SQLite DB and return the path."""
    sd    = _slackdump_bin()
    tmpdir = Path(tempfile.mkdtemp(prefix="fetch-build-"))
    since = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=days)).strftime("%Y-%m-%dT00:00:00")

    proc = subprocess.Popen(
        [sd, "archive", "-no-encryption", "-enterprise",
         "-time-from", since, "-o", str(tmpdir), channel_id],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
        text=True,
    )

    # Run for up to 45 s (rate-limited; usually done in < 20 s for 30-day window)
    def _kill() -> None:
        proc.kill()

    timer = threading.Timer(45, _kill)
    timer.start()
    try:
        proc.wait()
    finally:
        timer.cancel()

    db_path = tmpdir / "slackdump.sqlite"
    if not db_path.exists():
        print(
            "ERROR: slackdump archive produced no database.\n\n"
            "This usually means the Slack session token has expired.\n"
            "Follow the credential refresh procedure in SKILL.md → Step 0.",
            file=sys.stderr,
        )
        sys.exit(1)
    return db_path


# ── Message parsing ────────────────────────────────────────────────────────────

def _parse_block_table_commits(data_json: str) -> list[str]:
    """Extract 7-char SHAs from a block-kit table's SHA column."""
    try:
        data   = json.loads(data_json)
        blocks = data.get("blocks", [])
    except Exception:
        return []

    commits: list[str] = []
    seen: set[str]     = set()

    for block in blocks:
        if block.get("type") != "table":
            continue
        for row in block.get("rows", []):
            # Each row is a list of rich_text cells; SHA is typically the 3rd column
            for cell in row:
                for section in cell.get("elements", []):
                    for el in section.get("elements", []):
                        text = el.get("text", "")
                        for sha in COMMIT_SHORT_RE.findall(text):
                            short = sha[:7]
                            if len(sha) <= 40 and short not in seen:
                                seen.add(short)
                                commits.append(sha)
    return commits


def _extract_build_data(db_path: Path) -> list[dict]:
    """Parse the slackdump SQLite archive and return a list of IIB build records."""
    results: list[dict] = []
    with sqlite3.connect(str(db_path)) as conn:
        cur = conn.cursor()

        # Find all IIB build parent messages, latest first
        cur.execute(
            "SELECT TXT, TS, THREAD_TS FROM MESSAGE "
            "WHERE IS_PARENT = 1 AND TXT LIKE '%IIB %' "
            "ORDER BY TS DESC LIMIT 10"
        )
        parents = [(r[0], r[1], r[2]) for r in cur.fetchall()
                   if IIB_TITLE_RE.search(r[0] or "")]

        for txt, ts, thread_ts in parents:
            title = (txt or "").splitlines()[0].strip()

            # Fetch all thread replies
            cur.execute(
                "SELECT TXT, DATA FROM MESSAGE WHERE THREAD_TS = ? ORDER BY TS",
                (thread_ts,)
            )
            replies = cur.fetchall()

            container_sha   = ""
            plugin_commits: list[str] = []

            for reply_txt, reply_data in replies:
                reply_txt = reply_txt or ""

                # Konflux Bundle message contains the full container SHA
                if not container_sha:
                    m = CONTAINER_RE.search(reply_txt)
                    if m:
                        container_sha = m.group(1)

                # forklift-console-plugin changes message (block-kit table)
                if not plugin_commits and "forklift-console-plugin" in reply_txt:
                    if reply_data:
                        plugin_commits = _parse_block_table_commits(reply_data)

            results.append({
                "build_label":                  title,
                "ts":                           ts,
                "console_plugin_commits":       plugin_commits,
                "mtv_console_plugin_container": container_sha,
            })

    return results


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    """Parse arguments, fetch the latest build from Slack, and print JSON to stdout."""
    env = _load_mcp_env()

    parser = argparse.ArgumentParser(description="Fetch latest MTV build info from Slack")
    parser.add_argument("--channel",   default=env.get("SLACK_CHANNEL_ID", DEFAULT_CHANNEL_ID),
                        help="Slack channel ID (default: mtv-builds)")
    parser.add_argument("--workspace", default=env.get("SLACKDUMP_WORKSPACE", DEFAULT_WORKSPACE),
                        help="slackdump workspace name")
    parser.add_argument("--days",      type=int, default=DEFAULT_DAYS,
                        help="How many days back to scan (default: 30)")
    parser.add_argument("--all",       dest="show_all", action="store_true",
                        help="Print all recent builds, not just the latest")
    args = parser.parse_args()

    token  = os.getenv("SLACK_TOKEN")  or env.get("SLACK_TOKEN",  "")
    cookie = os.getenv("SLACK_COOKIE") or env.get("SLACK_COOKIE", "")

    _ensure_workspace(args.workspace, token, cookie)

    db_path = _archive_channel(args.channel, args.days)
    try:
        builds = _extract_build_data(db_path)
    finally:
        shutil.rmtree(db_path.parent, ignore_errors=True)

    if not builds:
        print(
            "ERROR: No IIB build posts found in the channel archive.\n\n"
            "Possible causes:\n"
            "  1. Slack session expired — refresh SLACK_TOKEN + SLACK_COOKIE in .mcp.json\n"
            "     (see SKILL.md → Step 0 → Credential refresh procedure)\n"
            "  2. Wrong channel — check SLACK_CHANNEL_ID in .mcp.json (should be C09DS44AQ65)\n"
            "  3. No builds posted in the last --days window (default 30)",
            file=sys.stderr,
        )
        sys.exit(1)

    output = builds if args.show_all else builds[0]

    # Warn if the latest build has no commits — likely a partial/stale archive
    latest = builds[0]
    if not latest.get("console_plugin_commits") and not latest.get("mtv_console_plugin_container"):
        print(
            "WARNING: Latest build was found but has no console-plugin commits.\n"
            "The Slack session may be stale — thread replies were not fetched.\n"
            "Try refreshing credentials (see SKILL.md → Step 0 → Credential refresh procedure).",
            file=sys.stderr,
        )

    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
