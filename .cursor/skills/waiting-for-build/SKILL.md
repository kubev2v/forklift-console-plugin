---
name: waiting-for-build
description: >-
  Query the active sprint on the Migrations & Networking Frontend Jira board for all
  MTV tickets in the "Waiting on build" column, find their merge commits in the local
  git repo, and check which are included in a given build (supplied as commit hashes).
  Renders results in an interactive canvas. Use when the user asks about "waiting for
  build", which tickets are in the build, build inclusion check, sprint tickets vs
  build, or wants to know what MTV fixes are waiting for QA.
---

# Waiting-for-Build Skill

## What this does

1. Queries Jira board 11806 (Migrations & Networking Frontend) — active sprint, MTV
   quickfilter, "Waiting on build" column (statuses: `MODIFIED`, `Dev Complete`).
2. Finds each ticket's merge commit in the local git repo (searches `git log --all`
   for the ticket key).
3. Checks whether each commit is an ancestor of the latest build tip hashes (fetched
   automatically from the `#mtv-builds` Slack channel via `fetch-build.py`).
4. **Transitions all `in_build: true` tickets to `ON_QA`** in Jira (transition ID `41`).
5. Renders an interactive canvas (`waiting-for-build.canvas.tsx`) via the canvas skill.

> **Default behaviour:** transition is always performed. If the user explicitly says
> "just check" or "don't transition", skip step 4.

## Step 0 — Get build tip hashes automatically from Slack

Run `fetch-build.py` to pull the latest build's commits from the `#mtv-builds` channel
(from the repository root):

```bash
python3 .cursor/skills/waiting-for-build/scripts/fetch-build.py
```

Output example:
```json
{
  "build_label": "IIB 2.12.0-44 | 02.06.2026 19:04 UTC",
  "build_version": "2.12.0",
  "console_plugin_commits": ["8e059c6", "cfc05ae"],
  "mtv_console_plugin_container": "8e059c6f48a7715179038e9bd12151c88c5f9bf1"
}
```

Pass `build_version` as `--build-version` and `console_plugin_commits` as positional
arguments to `query.py` (Step 1). If `console_plugin_commits` is empty, fall back to
the first 7 chars of `mtv_console_plugin_container` as the build tip.

**How it works:** Uses `slackdump` to archive channel `C09DS44AQ65` (#mtv-builds),
then queries the SQLite database for the latest IIB build thread.

**Credentials** are stored in `.mcp.json → mcpServers.slack.env`:
- `SLACK_TOKEN` — `xoxc-...` (Red Hat workspace, from Slack desktop app `localStorage`)
- `SLACK_COOKIE` — `xoxd-...` (d= cookie from Slack desktop app)
- `SLACK_CHANNEL_ID` — `C09DS44AQ65` (#mtv-builds)
- `SLACKDUMP_WORKSPACE` — `redhat`

**If `fetch-build.py` returns an error or empty commits**, the Slack session token
has expired (they rotate every few hours). Follow this recovery procedure:

> **Agent instruction:** If `fetch-build.py` fails with any auth/empty-result error,
> tell the user their Slack credentials have expired and walk them through the steps
> below to get fresh ones. Do NOT skip this — without valid credentials the script
> cannot fetch build data.

### Credential refresh procedure

**Step 1 — Get a fresh `xoxc-` token**

Ask the user to open the **Slack desktop app**, then open DevTools (`Cmd+Option+I`)
and run in the **Console** tab:

```javascript
Object.values(JSON.parse(localStorage["localConfig_v2"]).teams)
  .find(t => t.name === "Red Hat")?.token
```

Copy the full `xoxc-3016...` value.

**Step 2 — Get a fresh `d` cookie**

In the **same DevTools session**, go to **Application → Storage → Cookies →
`https://app.slack.com`**, click the row named **`d`**, and copy the full value
from the **Cookie Value panel at the bottom** (starts with `xoxd-`).

**Step 3 — Update `.mcp.json`**

Replace both values in `.mcp.json → mcpServers.slack.env`:
- `SLACK_TOKEN` ← new `xoxc-...` value
- `SLACK_COOKIE` ← new `xoxd-...` value

**Step 4 — Re-register with slackdump**

```bash
slackdump workspace new -no-encryption \
  -token "<new xoxc token>" \
  -cookie "<new xoxd cookie>" \
  redhat
slackdump workspace select redhat
```

**Step 5 — Re-run `fetch-build.py`**

```bash
python3 .cursor/skills/waiting-for-build/scripts/fetch-build.py
```

**Dependencies:** `brew install slackdump` (already installed).

---

## Step 1 — Run the query script

```bash
python3 .cursor/skills/waiting-for-build/scripts/query.py \
  [--sprint SPRINT_ID] [--build-version X.Y.Z] [hash1] [hash2] ...
```

- Pass **one or more build tip commit hashes** as positional arguments.
  Omit them to get the ticket/commit table without build-inclusion analysis.
- The script reads Jira credentials from `.mcp.json` automatically (no extra setup).
- Output is JSON printed to stdout.

**`--sprint SPRINT_ID` flag (required on Red Hat Jira):** The Agile API (`/rest/agile/1.0/`) is
blocked by SSO on Red Hat's Jira instance. Pass the active sprint ID directly to bypass it.
Get the sprint ID via the Jira MCP: `jira_get_sprints_from_board(board_id="11806", state="active")`.

**`--build-version X.Y.Z` flag (strongly recommended):** Version of the build being tested,
taken from `build_version` in `fetch-build.py` output (e.g. `"2.12.2"` from label
`"IIB 2.12.2-6 | ..."`). When supplied the script computes the major.minor **stream**
(e.g. `"2.12"`) and requires each ticket's `fixVersion` to match that stream before
setting `in_build: true`. This prevents a backport merge commit landing in a 2.12.x
build from falsely marking a `fixVersion: 5.0.0` mainline ticket as "in build".

**Example:**
```bash
python3 .cursor/skills/waiting-for-build/scripts/query.py \
  --sprint 67465 --build-version 2.12.0 8e059c6 cfc05ae
```

If `requests` is missing: `pip3 install requests`

> **API note:** The script uses `POST /rest/api/3/search/jql` (the current Jira Cloud search API).
> The old `GET /rest/api/3/search` endpoint returns 410 Gone on updated instances.

## Step 2 — Interpret the JSON output

The output shape:
```json
{
  "sprint":        { "id": 66444, "name": "...", "end": "2026-06-04" },
  "build_tips":    ["8e059c6", "cfc05ae"],
  "build_version": "2.12.0",
  "build_stream":  "2.12",
  "issues": [
    {
      "key":           "MTV-5388",
      "status":        "MODIFIED",
      "priority":      "Major",
      "summary":       "...",
      "fixVersions":   ["2.12.0"],
      "commit":        "22da1d1",   // null if no commit found in git log
      "pr":            2427,        // null if PR # not in commit subject
      "merge_date":    "2026-05-20",
      "version_match": true,        // null if no --build-version supplied
      "in_build":      false        // null if no build tips supplied
    }
  ]
}
```

Key fields:
- `in_build: true`       → commit is in the build AND fixVersion targets the same stream → ready to verify; transition to ON_QA
- `in_build: false`      → either merged after build cut, OR fixVersion targets a different stream (wrong build)
- `version_match: false` → ticket targets a different version stream (e.g. `5.0.0` vs a `2.12` build); do NOT transition
- `version_match: null`  → `--build-version` was not supplied; version check skipped
- `commit: null`         → no merge commit found; ticket may be missing `Resolves:` line

## Step 2b — Transition in-build tickets to ON_QA

For every issue where `in_build: true` (which already implies `version_match: true`
when `--build-version` was supplied), call the Jira transitions API:

```bash
# Read credentials from .mcp.json first:
JIRA_USERNAME=$(python3 -c "import json; d=json.load(open('.mcp.json')); print(d['mcpServers']['jira-mcp']['env']['JIRA_USERNAME'])")
JIRA_API_TOKEN=$(python3 -c "import json; d=json.load(open('.mcp.json')); print(d['mcpServers']['jira-mcp']['env']['JIRA_API_TOKEN'])")

curl -s -X POST \
  -u "$JIRA_USERNAME:$JIRA_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"transition": {"id": "41"}}' \
  "https://redhat.atlassian.net/rest/api/3/issue/<KEY>/transitions"
# 204 = success
```

Or via Python (using credentials from `.mcp.json`):

```python
import json, requests
from base64 import b64encode
from pathlib import Path

env = json.loads(Path(".mcp.json").read_text())["mcpServers"]["jira-mcp"]["env"]
creds = b64encode(f"{env['JIRA_USERNAME']}:{env['JIRA_API_TOKEN']}".encode()).decode()
requests.post(
    f"https://redhat.atlassian.net/rest/api/3/issue/{key}/transitions",
    headers={"Authorization": f"Basic {creds}", "Content-Type": "application/json"},
    json={"transition": {"id": "41"}},
)
```

**Transition IDs for MTV project:**

| ID | Status |
|----|--------|
| 11 | New |
| 21 | ASSIGNED |
| 31 | POST |
| 41 | **ON_QA** ← use this |
| 61 | Verified |
| 71 | Release Pending |
| 81 | Closed |

Skip this step only if the user explicitly says "just check" or "don't transition".

## Step 3 — Render the canvas

Read the canvas skill (`~/.cursor/skills-cursor/canvas/SKILL.md`) and produce a
`.canvas.tsx` at the standard path. Include:

- **Summary stats**: total tickets, in-build count, not-in-build count, major priority count
- **Callout** naming which tickets are in the build vs waiting for the next build
- **Filterable table**: build status (In build / Missing), priority, key, summary, PR link + date, commit hash
- **Row tones**: `success` for in-build, `warning` for Major-not-in-build, `danger` for Blocker/Critical

Reuse the canvas named `waiting-for-build.canvas.tsx` in this workspace's Cursor canvases
directory if it already exists (update in place). The canvas skill determines the correct
path for the current workspace automatically.

## Board & filter constants

| Setting | Value |
|---------|-------|
| Board ID | `11806` |
| Board name | Migrations & Networking Frontend |
| Project | Migration Toolkit for Virtualization (MTV) |
| QuickFilter ID | `91499` (name: "MTV") |
| QuickFilter JQL | `project = "Migration Toolkit for Virtualization"` |
| "Waiting on build" statuses | `MODIFIED` (ID 10284), `Dev Complete` (ID 10155) |
| Sprint endpoint | `GET /rest/agile/1.0/board/11806/sprint?state=active` |
| Issues endpoint | `GET /rest/agile/1.0/sprint/{id}/issue?jql=...` |

## Credentials

The script reads from `.mcp.json` → `mcpServers.jira-mcp.env`:
- `JIRA_URL` — `https://redhat.atlassian.net`
- `JIRA_USERNAME` — your Atlassian account email
- `JIRA_API_TOKEN` — Atlassian Cloud API token

## Commit-search heuristic

The script uses a three-stage search for each ticket's merge commit:

**Stage 1 — git grep (subject + body):** Runs `git log --all --grep=<KEY> -i`,
post-filters to **whole-word matches** (`\b` boundary) so `MTV-5` cannot match
`MTV-50` or `MTV-500`. Checks both the subject line and the full commit body, so
commits with `Resolves: MTV-XXXX` only in the body are correctly found.

**Stage 2 — Jira dev-status API (fallback):** If git grep finds nothing, queries
`/rest/dev-status/1.0/issue/detail` for GitHub PRs directly linked to the ticket
in Jira. For each MERGED PR returned, searches git log for `(#<number>)` to find
the merge commit. This catches PRs whose commit messages contain no ticket key at all.

Most commits follow `Resolves: MTV-XXXX | title (#PR)` or `MTV-XXXX | title (#PR)`.
If a ticket still has no match after both stages, `commit` is `null` — investigate
manually with:

```bash
git log --all --oneline | grep -i "keyword from summary"
```

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `ModuleNotFoundError: requests` | `pip3 install requests` |
| `Jira credentials missing` | Check `.mcp.json` has `JIRA_USERNAME` + `JIRA_API_TOKEN` |
| `No active sprint` | Sprint may have just ended; query `/sprint?state=closed` to see last sprint |
| `commit: null` for a ticket | Ticket key not in any commit message; search git log manually |
| Wrong ticket count | Board filter or sprint may have changed; re-run script to refresh |
| `slackdump not found` | `brew install slackdump` |
| `fetch-build.py` returns empty commits | Credentials expired — get fresh `SLACK_TOKEN` + `SLACK_COOKIE` from Slack desktop app DevTools |
| fetch-build.py takes >60 s | Rate-limited by Slack; reduce `--days` (e.g. `--days 7`) |
