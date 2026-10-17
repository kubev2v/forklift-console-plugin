#!/usr/bin/env bash
# Merge GitHub review comments from a user into the local review catalog.
# Usage: merge-posted-review.sh <PR_NUMBER> [github_username]
# Prerequisite: gather-context.sh; optional review.json from orchestrator.
set -euo pipefail

PR="${1:?Usage: merge-posted-review.sh <PR_NUMBER> [username]}"
USER="${2:-}"
REPO=$(gh repo view --json nameWithOwner -q '.nameWithOwner')
OUT_DIR="/tmp/pr-review-${PR}"
CATALOG="${OUT_DIR}/merged-findings.md"
POSTED_JSON="${OUT_DIR}/posted-review.json"
LOCAL_REVIEW="${OUT_DIR}/review.json"

mkdir -p "$OUT_DIR"

if [[ -z "$USER" ]]; then
  USER=$(gh api user -q .login 2>/dev/null || true)
fi
if [[ -z "$USER" ]]; then
  echo "FAIL: pass github username as second arg" >&2
  exit 1
fi

gh api "repos/${REPO}/pulls/${PR}/comments" \
  --jq "[.[] | select(.user.login == \"${USER}\") | {
    path,
    line: (.line // .original_line),
    body,
    html_url,
    posted: true
  }]" > "$POSTED_JSON"

{
  echo "# PR #${PR} — merged findings"
  echo ""
  echo "User **@${USER}** posted on GitHub + local orchestrator draft (if present)."
  echo ""
  echo "## Posted on GitHub (@${USER})"
  echo ""
  echo "| Path | Line | Comment | Link |"
  echo "|------|------|---------|------|"
} > "$CATALOG"

jq -r '.[] | "| `\(.path)` | \(.line // "—") | \(.body | gsub("\n"; " ") | .[0:120]) | [open](\(.html_url)) |"' \
  "$POSTED_JSON" >> "$CATALOG" 2>/dev/null || echo "| — | — | (no comments) | — |" >> "$CATALOG"

if [[ -f "$LOCAL_REVIEW" ]]; then
  {
    echo ""
    echo "## Orchestrator draft (not posted unless you ran post-review.sh)"
    echo ""
    echo "**Event:** $(jq -r '.event' "$LOCAL_REVIEW")"
    echo ""
    echo "### Main body"
    echo ""
    echo '```text'
    jq -r '.body' "$LOCAL_REVIEW"
    echo '```'
    echo ""
    echo "### Inline (draft)"
    echo ""
    echo "| Path | Line | Comment |"
    echo "|------|------|---------|"
  } >> "$CATALOG"
  count=$(jq '.comments | length' "$LOCAL_REVIEW")
  for i in $(seq 0 $((count - 1))); do
    path=$(jq -r ".comments[$i].path" "$LOCAL_REVIEW")
    line=$(jq -r ".comments[$i].line" "$LOCAL_REVIEW")
    body=$(jq -r ".comments[$i].body" "$LOCAL_REVIEW" | head -c 120)
    echo "| \`${path}\` | ${line} | ${body} |" >> "$CATALOG"
  done
fi

echo ""
echo "Posted comments: $(jq 'length' "$POSTED_JSON")"
echo "Catalog: ${CATALOG}"
echo "Posted JSON: ${POSTED_JSON}"
