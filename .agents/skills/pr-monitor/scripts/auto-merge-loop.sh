#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GIT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || GIT_ROOT="."
PR_MONITOR="$GIT_ROOT/.agents/skills/dev-helper/scripts/pr-monitor.sh"
source "$GIT_ROOT/.agents/skills/dev-helper/scripts/_config.sh"

usage() {
  cat <<'USAGE'
Usage: auto-merge-loop.sh <PR_NUMBER> [INTERVAL_SECONDS]

Polls PR status at a fixed interval and submits to the merge queue
when all standalone-mode criteria pass (approved, CI passing, no
conflicts, up to date, no unresolved threads). Learn is skipped.

Arguments:
  PR_NUMBER          Required. The PR number to monitor.
  INTERVAL_SECONDS   Optional. Seconds between checks (default: 600).

Exits 0 on successful merge submission, 1 on unrecoverable error.
USAGE
  exit 1
}

PR="${1:?Missing PR_NUMBER. Run with --help for usage.}"
INTERVAL="${2:-600}"

if [[ "$PR" == "--help" || "$PR" == "-h" ]]; then
  usage
fi

echo "Starting auto-merge loop for PR #${PR} (interval: ${INTERVAL}s)"
echo "Repository: ${GH_REPO}"
echo ""

while true; do
  echo "=== $(date) - Checking PR #${PR} ==="

  OUTPUT=$("$PR_MONITOR" "$PR" 2>&1) || true
  echo "$OUTPUT" | tail -12

  STATE=$(echo "$OUTPUT" | grep "^State:" | awk -F': ' '{print $2}' | awk '{print $1}')

  if [[ "$STATE" == "MERGED" ]]; then
    echo "MERGE_COMPLETE: PR #${PR} is already merged!"
    exit 0
  fi

  APPROVED=$(echo "$OUTPUT" | grep "^Approved:" | awk -F': ' '{print $2}')
  CI=$(echo "$OUTPUT" | grep "^CI Passing:" | awk -F': ' '{print $2}')
  CONFLICTS=$(echo "$OUTPUT" | grep "^Conflicts:" | awk -F': ' '{print $2}')
  REBASE=$(echo "$OUTPUT" | grep "^Needs Rebase:" | awk -F': ' '{print $2}' | awk '{print $1}')
  THREADS=$(echo "$OUTPUT" | grep "^Unresolved Threads:" | awk -F': ' '{print $2}')

  echo "  >> approved=$APPROVED ci=$CI conflicts=$CONFLICTS rebase=$REBASE threads=$THREADS"

  if [[ "$APPROVED" == "true" && "$CI" == "true" && "$CONFLICTS" == "false" && "$REBASE" == "false" && "$THREADS" == "0" ]]; then
    echo ""
    echo "ALL_CRITERIA_MET: Submitting PR #${PR} to merge queue..."
    if gh pr merge "$PR" --repo "$GH_REPO" --squash; then
      echo "MERGE_COMPLETE: PR #${PR} submitted to merge queue!"
      exit 0
    else
      echo "ERROR: gh pr merge failed (exit $?). Will retry next iteration."
    fi
  fi

  echo "  ⏳ Not ready. Sleeping ${INTERVAL}s..."
  echo ""
  sleep "$INTERVAL"
done
