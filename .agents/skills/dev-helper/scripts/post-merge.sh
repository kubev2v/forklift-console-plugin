#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/_config.sh"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_CLI="$SCRIPT_DIR/state-cli.sh"
JIRA_TRACK="$SCRIPT_DIR/jira-track.sh"
JIRA_TRANSITION="$SCRIPT_DIR/jira-transition.sh"

KEY="${1:?Usage: post-merge.sh MTV-XXXX}"

TERMINAL_STATUSES="MODIFIED Done Closed Verified ON_QA"

state=$("$STATE_CLI" get "$KEY")
ticket_type=$(echo "$state" | jq -r '.type')
parent_epic=$(echo "$state" | jq -r '.parentEpic // empty')
pr_url=$(echo "$state" | jq -r '.prUrl // empty')
pr_number=$(echo "$state" | jq -r '.prNumber // empty')

current_jira=$("$JIRA_TRACK" get "$KEY" 2>/dev/null || echo '{}')
current_status=$(echo "$current_jira" | jq -r '.fields.status.name // "Unknown"')

report=""
agent_todos=""

is_terminal() {
  for s in $TERMINAL_STATUSES; do
    [[ "$1" == "$s" ]] && return 0
  done
  return 1
}

if is_terminal "$current_status"; then
  report+="SKIP transition: already at ${current_status}\n"
elif [[ "$ticket_type" == "Bug" ]]; then
  "$JIRA_TRANSITION" "$KEY" "MODIFIED" 2>/dev/null && \
    report+="SET transition: -> MODIFIED\n" || \
    report+="WARN transition to MODIFIED failed (may need manual)\n"
elif [[ "$ticket_type" == "Story" ]]; then
  "$JIRA_TRANSITION" "$KEY" "Done" 2>/dev/null && \
    report+="SET transition: -> Done\n" || \
    report+="WARN transition to Done failed (may need manual)\n"
elif [[ "$ticket_type" == "Epic" || "$ticket_type" == "Feature Request" ]]; then
  report+="SKIP transition: ${ticket_type} managed separately\n"
else
  "$JIRA_TRANSITION" "$KEY" "MODIFIED" 2>/dev/null && \
    report+="SET transition: -> MODIFIED\n" || \
    report+="WARN transition to MODIFIED failed (may need manual)\n"
fi

if [[ -n "$QA_CONTACT" ]]; then
  "$JIRA_TRACK" set-qa-contact "$KEY" "$QA_CONTACT" 2>/dev/null || true
  report+="SET QA contact: ${QA_CONTACT}\n"
fi

# customfield_12320940 = Activity Type
if [[ "$ticket_type" == "Bug" ]]; then
  "$JIRA_TRACK" set-field "$KEY" customfield_12320940 "Quality / Stability / Reliability" 2>/dev/null || true
  report+="SET activity type: Quality / Stability / Reliability\n"
else
  "$JIRA_TRACK" set-field "$KEY" customfield_12320940 "Product / Portfolio Work" 2>/dev/null || true
  report+="SET activity type: Product / Portfolio Work\n"
fi

# customfield_12320847 = Release Note Type
if [[ "$ticket_type" == "Bug" ]]; then
  "$JIRA_TRACK" set-field "$KEY" customfield_12320847 "Bug Fix" 2>/dev/null || true
  report+="SET release note type: Bug Fix\n"
else
  "$JIRA_TRACK" set-field "$KEY" customfield_12320847 "Enhancement" 2>/dev/null || true
  report+="SET release note type: Enhancement\n"
fi

if [[ "$ticket_type" == "Story" && -n "$parent_epic" ]]; then
  children_jql="parent=${parent_epic}+AND+project=${JIRA_PROJECT_KEY}"
  children_response=$(curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
    "${JIRA_BASE_URL}/rest/api/2/search?jql=${children_jql}&fields=status" 2>/dev/null || echo '{"issues":[]}')

  total=$(echo "$children_response" | jq '.total // 0')
  done_count=$(echo "$children_response" | jq '[.issues[] | select(.fields.status.name == "Done" or .fields.status.name == "Closed")] | length')

  if [[ "$total" -gt 0 && "$done_count" -eq "$total" ]]; then
    "$JIRA_TRANSITION" "$parent_epic" "Done" 2>/dev/null && \
      report+="SET parent Epic ${parent_epic}: -> Done (all ${total} children complete)\n" || \
      report+="WARN parent Epic ${parent_epic} transition to Done failed\n"
  else
    report+="SKIP parent Epic ${parent_epic}: ${done_count}/${total} children done\n"
  fi
fi

state_dir="$(dirname "$("$STATE_CLI" field "$KEY" '.ticket' 2>/dev/null || echo "$KEY")" 2>/dev/null)"
summary_dir="${SCRIPT_DIR}/../state/${KEY}"
mkdir -p "$summary_dir"

cat > "${summary_dir}/summary.md" << EOF
# ${KEY} - Post-Merge Summary

| Field | Value |
|-------|-------|
| Ticket | ${KEY} |
| Type | ${ticket_type} |
| PR | ${pr_url:-N/A} (#${pr_number:-N/A}) |
| Final Status | $(echo "$report" | grep -o "-> [A-Za-z]*" | head -1 || echo "unchanged") |
| QA Contact | ${QA_CONTACT:-N/A} |
| Parent Epic | ${parent_epic:-N/A} |

## Actions Taken
$(printf "%b" "$report" | sed 's/^/- /')

## Agent TODO
- [ ] Write release note text for the ticket
- [ ] Verify QA contact is correct
EOF

report+="SET generated summary.md\n"
agent_todos+="- Write release note text for ${KEY}\n"

echo "=== post-merge.sh: ${KEY} ==="
printf "%b" "$report"
echo ""
echo "--- Agent still needs to ---"
printf "%b" "$agent_todos"
echo "=== Done ==="
