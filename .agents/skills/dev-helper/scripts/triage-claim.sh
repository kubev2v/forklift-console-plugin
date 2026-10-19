#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/_config.sh"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_CLI="$SCRIPT_DIR/state-cli.sh"
JIRA_TRACK="$SCRIPT_DIR/jira-track.sh"
JIRA_TRANSITION="$SCRIPT_DIR/jira-transition.sh"

KEY="${1:?Usage: triage-claim.sh MTV-XXXX}"

# Jira Cloud API v3 — description/comments are Atlassian Document Format (ADF).
response=$(curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
  "${JIRA_BASE_URL}/rest/api/3/issue/${KEY}?expand=renderedFields")

if ! echo "$response" | jq -e '.key' > /dev/null 2>&1; then
  echo "ERROR: Failed to fetch ${KEY} from Jira API v3" >&2
  echo "$response" | jq . 2>/dev/null || echo "$response" >&2
  exit 1
fi

ticket_type=$(echo "$response" | jq -r '.fields.issuetype.name')
summary=$(echo "$response" | jq -r '.fields.summary')
status=$(echo "$response" | jq -r '.fields.status.name')
# Prefer rendered HTML when present; otherwise flatten ADF / string description.
description=$(echo "$response" | jq -r '
  if (.renderedFields.description // null) != null and (.renderedFields.description | type) == "string" then
    .renderedFields.description
  elif (.fields.description | type) == "string" then
    .fields.description // ""
  elif .fields.description == null then
    ""
  else
    [.fields.description | .. | .text? // empty] | join(" ")
  end
')
priority=$(echo "$response" | jq -r '.fields.priority.name // "Normal"')
components=$(echo "$response" | jq '[.fields.components[]? | {id, name}]')
fix_versions=$(echo "$response" | jq '[.fields.fixVersions[]? | .name]')
story_points=$(echo "$response" | jq '.fields.customfield_10028 // null')
# Sprint can be a single object or an array depending on Jira config.
sprint=$(echo "$response" | jq -r '
  .fields.customfield_12310940
  | if . == null then empty
    elif type == "array" then (.[-1].name // empty)
    else (.name // empty)
    end
')
comments=$(echo "$response" | jq '[.fields.comment.comments[]? | {
  author: .author.displayName,
  body: (
    if (.body | type) == "string" then .body
    elif .body == null then ""
    else [.body | .. | .text? // empty] | join(" ")
    end
  ),
  created: .created
}]')
attachments=$(echo "$response" | jq '[.fields.attachment[]? | {filename: .filename, url: .content}]')

if [[ -n "${JIRA_COMPONENT_ID:-}" ]]; then
  "$JIRA_TRACK" set-component "$KEY" "$JIRA_COMPONENT_ID" > /dev/null 2>&1 || true
fi

if [[ "$ticket_type" == "Bug" && "$status" == "New" ]]; then
  "$JIRA_TRANSITION" "$KEY" "ASSIGNED" > /dev/null 2>&1 || true
fi

if ! "$STATE_CLI" get "$KEY" > /dev/null 2>&1; then
  "$STATE_CLI" init "$KEY" "$ticket_type" > /dev/null
fi
"$STATE_CLI" set "$KEY" --arg type "$ticket_type" '.type = $type' > /dev/null

jq -n \
  --arg type "$ticket_type" \
  --arg summary "$summary" \
  --arg status "$status" \
  --arg description "$description" \
  --arg priority "$priority" \
  --argjson components "$components" \
  --argjson fixVersions "$fix_versions" \
  --argjson storyPoints "$story_points" \
  --arg sprint "${sprint:-}" \
  --argjson comments "$comments" \
  --argjson attachments "$attachments" \
  '{
    type: $type,
    summary: $summary,
    status: $status,
    description: $description,
    priority: $priority,
    components: $components,
    fixVersions: $fixVersions,
    storyPoints: $storyPoints,
    sprint: (if $sprint == "" then null else $sprint end),
    comments: $comments,
    attachments: $attachments
  }'
