#!/usr/bin/env bash
set -euo pipefail

# MTV "QA Contact" (QE contact) — Pedro Abreu (pabreu@redhat.com)
readonly DEFAULT_QE_CONTACT_ACCOUNT_ID='712020:6a961f6e-07c1-4cc3-ac97-e454f504b2d2'

SUMMARY="${1:?Usage: create-bug.sh SUMMARY DESCRIPTION PRIORITY_ID [ASSIGNEE_ID] [LABELS] [SEVERITY_ID]}"
DESCRIPTION="${2:?Missing DESCRIPTION}"
PRIORITY_ID="${3:?Missing PRIORITY_ID}"
ASSIGNEE_ID="${4:-${JIRA_ASSIGNEE_ACCOUNT_ID:-}}"
LABELS="${5:-user-interface}"
SEVERITY_ID="${6:-}"

source ~/.jira-creds

QE_CONTACT_ACCOUNT_ID="${JIRA_QE_CONTACT_ACCOUNT_ID:-$DEFAULT_QE_CONTACT_ACCOUNT_ID}"

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
QE_TMPFILE=$(mktemp)
trap 'rm -f "$TMPFILE" "$QE_TMPFILE"' EXIT

printf '%s\n' "$PAYLOAD" > "$TMPFILE"

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

QE_PAYLOAD=$(jq -n --arg accountId "$QE_CONTACT_ACCOUNT_ID" \
  '{fields: {customfield_10470: {accountId: $accountId}}}')

QE_HTTP_CODE=$(curl -s -o "$QE_TMPFILE" -w "%{http_code}" \
  -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
  -X PUT -H "Content-Type: application/json" \
  -d "$QE_PAYLOAD" \
  "${JIRA_BASE_URL}/rest/api/2/issue/${KEY}")

if [[ "$QE_HTTP_CODE" != "204" && "$QE_HTTP_CODE" != "200" ]]; then
  echo "ERROR: Created ${KEY} but failed to set QA Contact (HTTP ${QE_HTTP_CODE})" >&2
  if [[ -s "$QE_TMPFILE" ]]; then
    jq . "$QE_TMPFILE" >&2
  fi
  exit 1
fi

echo "$KEY"
