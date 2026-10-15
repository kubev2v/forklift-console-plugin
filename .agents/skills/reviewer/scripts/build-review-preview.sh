#!/usr/bin/env bash
# Build human-readable preview of review.json (not posted to GitHub).
# Usage: build-review-preview.sh <PR_NUMBER>
set -euo pipefail

PR="${1:?Usage: build-review-preview.sh <PR_NUMBER>}"
OUT_DIR="/tmp/pr-review-${PR}"
REVIEW="${OUT_DIR}/review.json"
PREVIEW="${OUT_DIR}/preview.md"
MANIFEST="${OUT_DIR}/rules-manifest.json"
LESSONS="${OUT_DIR}/lessons-context.md"

if [[ ! -f "$REVIEW" ]]; then
  echo "FAIL: ${REVIEW} not found" >&2
  exit 1
fi

repo=$(cat "${OUT_DIR}/repo-slug.txt" 2>/dev/null || true)
commit=$(cat "${OUT_DIR}/commit-sha.txt" 2>/dev/null || true)
pr_url=$(cat "${OUT_DIR}/pr-url.txt" 2>/dev/null || true)

event=$(jq -r '.event' "$REVIEW")
body=$(jq -r '.body' "$REVIEW")
comment_count=$(jq '.comments | length' "$REVIEW")

{
  echo "# PR #${PR} — review preview (draft, not posted)"
  echo ""
  echo "## Context loaded (you only — not in GitHub review)"
  echo ""
  if [[ -f "$MANIFEST" ]]; then
    echo "### Shared"
    jq -r '.shared[]?' "$MANIFEST" | sed 's/^/- /'
    echo ""
    for p in Developer QE UX Architect Security "Forklift expert"; do
      echo "### ${p}"
      jq -r --arg p "$p" '.by_perspective[$p][]?' "$MANIFEST" | sed 's/^/- /'
      echo ""
    done
  else
    echo "(run select-rules-for-pr.sh to generate rules-manifest.json)"
    echo ""
  fi

  if [[ -f "$LESSONS" ]]; then
    echo "## Lessons consulted (you only)"
    echo ""
    cat "$LESSONS"
    echo ""
  fi

  echo "## GitHub draft"
  echo ""
  echo "**Review event:** \`${event}\`"
  echo ""
  echo "### Main review comment (posted once on the PR)"
  echo ""
  echo '```text'
  echo "$body"
  echo '```'
  echo ""

  echo "### Inline comments (one GitHub review comment per row)"
  echo ""
  if [[ "$comment_count" -eq 0 ]]; then
    echo "_(none)_"
  else
    echo "| Path | Line | GitHub | Comment | Side |"
    echo "|------|------|--------|---------|------|"
    for i in $(seq 0 $((comment_count - 1))); do
      path=$(jq -r ".comments[$i].path" "$REVIEW")
      line=$(jq -r ".comments[$i].line" "$REVIEW")
      side=$(jq -r ".comments[$i].side // \"RIGHT\"" "$REVIEW")
      cbody=$(jq -r ".comments[$i].body" "$REVIEW")
      cbody_escaped=${cbody//|/\\|}
      link=""
      if [[ -n "$repo" && -n "$commit" ]]; then
        link="https://github.com/${repo}/blob/${commit}/${path}#L${line}"
      elif [[ -n "$pr_url" ]]; then
        link="${pr_url}/files#R${line}"
      fi
      echo "| \`${path}\` | ${line} | [open](${link}) | ${cbody_escaped} | ${side} |"
    done
  fi
  echo ""
} > "$PREVIEW"

cat "$PREVIEW"
echo ""
echo "Preview written to ${PREVIEW}"
