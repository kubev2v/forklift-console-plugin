#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/_config.sh"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_CLI="$SCRIPT_DIR/state-cli.sh"
JIRA_TRANSITION="$SCRIPT_DIR/jira-transition.sh"
JIRA_TRACK="$SCRIPT_DIR/jira-track.sh"

usage() {
  cat <<'USAGE'
Usage: send-pr.sh <TICKET_KEY> --title "Resolves: MTV-XXXX | desc" --body-file <path>

Atomic PR creation script. Handles all Phase 10 steps in one command:
  1. Verify branch matches state
  2. Push to origin
  3. Create PR with enforced title format
  4. Update state file
  5. Transition Jira (Bug->POST, Story->In Progress + parent Epic check, Epic/Feature Request->skip)
  6. Set Jira PR link + Ready flag
  7. Advance to monitor-pr phase
  8. Mark waiting as pr-review-pending

Options:
  --title     PR title (required, must start with "Resolves: MTV-")
  --body-file Path to a file containing the PR body markdown
  --draft     Create as draft PR
USAGE
  exit 1
}

TICKET=""
TITLE=""
BODY_FILE=""
DRAFT_FLAG=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --title) TITLE="$2"; shift 2 ;;
    --body-file) BODY_FILE="$2"; shift 2 ;;
    --draft) DRAFT_FLAG="--draft"; shift ;;
    --help|-h) usage ;;
    MTV-*|PR-*) TICKET="$1"; shift ;;
    *) echo "Unknown argument: $1"; usage ;;
  esac
done

[[ -n "$TICKET" ]] || { echo "ERROR: TICKET_KEY required (e.g. MTV-5388)" >&2; usage; }
[[ -n "$TITLE" ]] || { echo "ERROR: --title required" >&2; usage; }
[[ -n "$BODY_FILE" && -f "$BODY_FILE" ]] || { echo "ERROR: --body-file required and must exist" >&2; usage; }

# Validate title format
if [[ ! "$TITLE" =~ ^Resolves:\ ${JIRA_PROJECT_KEY}- ]]; then
  echo "WARNING: Title should start with 'Resolves: ${JIRA_PROJECT_KEY}-XXXX |'"
fi

echo "=== send-pr.sh: Atomic PR creation for ${TICKET} ==="

# Step 1: Verify branch
expected_branch=$("$STATE_CLI" field "$TICKET" '.branch')
current_branch=$(git branch --show-current)

if [[ "$current_branch" != "$expected_branch" ]]; then
  echo "ERROR: On branch '$current_branch' but state expects '$expected_branch'" >&2
  exit 1
fi
echo "[1/8] Branch verified: $current_branch"

# Step 2: Push to origin
git push -u origin "$current_branch" 2>&1
echo "[2/8] Pushed to origin/$current_branch"

# Step 3: Create PR
LABEL_FLAGS=""
if [[ -n "${PR_LABELS:-}" ]]; then
  IFS=',' read -ra LABEL_ARRAY <<< "$PR_LABELS"
  for label in "${LABEL_ARRAY[@]}"; do
    LABEL_FLAGS+=" --label $label"
  done
fi

pr_url=$(gh pr create \
  --repo "$GH_REPO" \
  --head "$GH_USER:$current_branch" \
  --title "$TITLE" \
  --body-file "$BODY_FILE" \
  $DRAFT_FLAG $LABEL_FLAGS < /dev/null 2>&1)

if [[ -z "$pr_url" || ! "$pr_url" =~ github.com ]]; then
  echo "ERROR: Failed to create PR. Output: $pr_url"
  exit 1
fi

pr_number=$(echo "$pr_url" | grep -o '[0-9]*$')
echo "[3/8] PR created: $pr_url (#$pr_number)"

# Step 4: Update state
"$STATE_CLI" set "$TICKET" \
  ".prUrl = \"${pr_url}\" | .prNumber = ${pr_number} | .pr.createdAt = (now | todate)"
echo "[4/8] State updated with PR info"

# Step 5: Transition Jira (type-aware)
# Ticket type status model:
#   Bug:            ASSIGNED (Phase 1) -> POST (here) -> MODIFIED (Phase 12)
#   Story:          New -> In Progress (here) -> Done (Phase 12)
#   Epic:           New -> In Progress (auto when child Story posts PR, handled here)
#   Feature Request: no auto-transitions
ticket_type=$("$STATE_CLI" field "$TICKET" '.type')
if [[ "$ticket_type" == "Epic" || "$ticket_type" == "Feature Request" || "$ticket_type" == "Feature" ]]; then
  echo "[5/8] ${ticket_type}: skipping Jira transition (managed separately)"
elif [[ "$ticket_type" == "Bug" ]]; then
  # Bug: ASSIGNED -> POST (PR posted)
  "$JIRA_TRANSITION" "$TICKET" "POST" 2>/dev/null && echo "[5/8] Jira -> POST" || echo "[5/8] Jira POST transition failed (may need manual)"
elif [[ "$ticket_type" == "Story" ]]; then
  # Story: New -> In Progress (posting PR is the trigger for In Progress)
  "$JIRA_TRANSITION" "$TICKET" "In Progress" 2>/dev/null && echo "[5/8] Jira -> In Progress" || echo "[5/8] Jira In Progress transition failed (may need manual)"
  # Also transition parent Epic from New -> In Progress if applicable
  source ~/.jira-creds 2>/dev/null || true
  PARENT_EPIC=$(curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
    "${JIRA_BASE_URL}/rest/api/2/issue/${TICKET}?fields=parent" \
    2>/dev/null | jq -r '.fields.parent.key // empty' 2>/dev/null || echo "")
  if [[ -n "$PARENT_EPIC" ]]; then
    EPIC_STATUS=$(curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
      "${JIRA_BASE_URL}/rest/api/2/issue/${PARENT_EPIC}?fields=status" \
      2>/dev/null | jq -r '.fields.status.name' 2>/dev/null || echo "")
    if [[ "$EPIC_STATUS" == "New" ]]; then
      "$JIRA_TRANSITION" "$PARENT_EPIC" "In Progress" 2>/dev/null || true
      echo "  Parent Epic ${PARENT_EPIC}: New -> In Progress"
    else
      echo "  Parent Epic ${PARENT_EPIC}: already at ${EPIC_STATUS:-unknown} — skipping"
    fi
  fi
else
  # Other types (Task, etc.): legacy path In Progress -> POST
  "$JIRA_TRANSITION" "$TICKET" "In Progress" 2>/dev/null || true
  "$JIRA_TRANSITION" "$TICKET" "POST" 2>/dev/null && echo "[5/8] Jira -> POST" || echo "[5/8] Jira transition failed (may need manual)"
fi

# Step 6: Set Jira PR link + Ready flag
"$JIRA_TRACK" set-pr-link "$TICKET" "$pr_url" 2>/dev/null || echo "  (PR link field not available)"
"$JIRA_TRACK" set-ready "$TICKET" 2>/dev/null || echo "  (Ready field not available)"
echo "[6/8] Jira PR link + Ready flag set"

# Step 7: Advance to monitor-pr
"$STATE_CLI" phase "$TICKET" monitor-pr
echo "[7/8] Phase -> monitor-pr"

# Step 8: Mark waiting
"$STATE_CLI" wait "$TICKET" pr-review-pending
echo "[8/8] Marked waiting: pr-review-pending"

echo ""
echo "=== Done! PR: $pr_url ==="
echo "Use reconcile.sh on next session start to detect merge, or resume monitoring manually."
