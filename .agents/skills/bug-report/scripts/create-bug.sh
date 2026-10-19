#!/usr/bin/env bash
set -euo pipefail

SUMMARY="${1:?Usage: create-bug.sh SUMMARY DESCRIPTION PRIORITY_ID [ASSIGNEE_ID] [LABELS] [SEVERITY_ID]}"
DESCRIPTION="${2:?Missing DESCRIPTION}"
PRIORITY_ID="${3:?Missing PRIORITY_ID}"
ASSIGNEE_ID="${4:-${JIRA_ASSIGNEE_ACCOUNT_ID:-}}"
LABELS="${5:-user-interface}"
SEVERITY_ID="${6:-}"

source ~/.jira-creds

IFS=',' read -ra LABEL_ARRAY <<< "$LABELS"
LABELS_JSON=$(printf '%s\n' "${LABEL_ARRAY[@]}" | jq -R . | jq -s .)

PAYLOAD=$(jq -n \
  --arg summary "$SUMMARY" \
  --arg description "$DESCRIPTION" \
  --arg priorityId "$PRIORITY_ID" \
  --arg assigneeId "$ASSIGNEE_ID" \
  --arg severityId "$SEVERITY_ID" \
  --argjson labels "$LABELS_JSON" \
  '{
    fields: {
      project: {key: "MTV"},
      issuetype: {name: "Bug"},
      summary: $summary,
      description: $description,
      components: [{id: "35732"}],
      labels: $labels,
      priority: {id: $priorityId}
    }
  }
  | if $assigneeId != "" then .fields.assignee = {accountId: $assigneeId} else . end
  | if $severityId != "" then .fields.customfield_10840 = {id: $severityId} else . end')

TMPFILE=$(mktemp)
printf '%s\n' "$PAYLOAD" > "$TMPFILE"
trap 'rm -f "$TMPFILE"' EXIT

RESPONSE=$(curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
  -X POST -H "Content-Type: application/json" \
  -d "@${TMPFILE}" \
  "${JIRA_BASE_URL}/rest/api/2/issue")

KEY=$(echo "$RESPONSE" | jq -r '.key // empty')
if [[ -z "$KEY" ]]; then
  echo "ERROR: Failed to create ticket" >&2
  echo "$RESPONSE" | jq . >&2
  exit 1
fi

echo "$KEY"
