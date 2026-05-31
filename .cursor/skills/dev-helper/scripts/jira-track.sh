#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/_config.sh"
source ~/.jira-creds

usage() {
  cat <<'USAGE'
Usage: jira-track.sh <command> <TICKET_KEY> [args]

Commands:
  get             <KEY>                  Get ticket fields as JSON
  set-fix-version <KEY> <VERSION>        Set fix version
  set-component   <KEY> <COMPONENT_ID>   Add component
  set-labels      <KEY> <LABEL,...>       Set labels
  set-field       <KEY> <FIELD_ID> <VAL>  Set a custom field
  set-pr-link     <KEY> <PR_URL>         Set Git Pull Request field
  set-ready       <KEY>                  Set Ready field to True
  set-qa-contact  <KEY> <NAME>           Set QA Contact
  set-story-points <KEY> <POINTS>        Set story points
  set-sprint      <KEY> <SPRINT_ID>     Move ticket to a sprint
  add-comment     <KEY> <BODY>           Add a comment
  get-sprint-info                        Get active sprint info
USAGE
  exit 1
}

jira_get() {
  local key="${1:?Missing KEY}"
  curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
    "${JIRA_BASE_URL}/rest/api/2/issue/${key}" | jq .
}

jira_update() {
  local key="${1:?Missing KEY}"
  local payload="${2:?Missing payload}"
  local tmp
  tmp=$(mktemp)
  echo "$payload" > "$tmp"

  local response
  response=$(curl -s -w "\n%{http_code}" -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
    -X PUT -H "Content-Type: application/json" \
    -d "@${tmp}" \
    "${JIRA_BASE_URL}/rest/api/2/issue/${key}")

  rm -f "$tmp"

  local code
  code=$(echo "$response" | tail -1)
  local body
  body=$(echo "$response" | sed '$d')

  if [[ "$code" != "204" && "$code" != "200" ]]; then
    echo "ERROR: HTTP $code" >&2
    echo "$body" >&2
    return 1
  fi
  echo "OK"
}

cmd_set_fix_version() {
  local key="${1:?Missing KEY}"
  local version="${2:?Missing VERSION}"

  local payload
  payload=$(jq -n --arg v "$version" '{fields: {fixVersions: [{name: $v}]}}')
  jira_update "$key" "$payload"
}

cmd_set_component() {
  local key="${1:?Missing KEY}"
  local comp_id="${2:?Missing COMPONENT_ID}"

  local payload
  payload=$(jq -n --arg id "$comp_id" '{fields: {components: [{id: $id}]}}')
  jira_update "$key" "$payload"
}

cmd_set_labels() {
  local key="${1:?Missing KEY}"
  local labels_csv="${2:?Missing LABELS}"

  IFS=',' read -ra LABEL_ARRAY <<< "$labels_csv"
  local labels_json
  labels_json=$(printf '%s\n' "${LABEL_ARRAY[@]}" | jq -R . | jq -s .)

  local payload
  payload=$(jq -n --argjson labels "$labels_json" '{fields: {labels: $labels}}')
  jira_update "$key" "$payload"
}

cmd_set_pr_link() {
  local key="${1:?Missing KEY}"
  local pr_url="${2:?Missing PR_URL}"

  # customfield_10875 is the "Git Pull Request" text field in Red Hat Jira (MTV project).
  # Accepts comma-separated URLs for multiple PRs.
  local payload
  payload=$(jq -n --arg url "$pr_url" '{fields: {customfield_10875: $url}}')
  jira_update "$key" "$payload"
}

cmd_set_ready() {
  local key="${1:?Missing KEY}"

  # customfield_10484 is the "Ready" field in Red Hat Jira (MTV project); option type.
  local payload='{"fields": {"customfield_10484": {"value": "True"}}}'
  jira_update "$key" "$payload"
}

cmd_set_qa_contact() {
  local key="${1:?Missing KEY}"
  local name="${2:?Missing NAME}"

  local payload
  payload=$(jq -n --arg name "$name" '{fields: {customfield_10470: $name}}')
  jira_update "$key" "$payload"
}

cmd_set_story_points() {
  local key="${1:?Missing KEY}"
  local points="${2:?Missing POINTS}"

  local payload
  payload=$(jq -n --argjson pts "$points" '{fields: {customfield_10028: $pts}}')
  jira_update "$key" "$payload"
}

cmd_add_comment() {
  local key="${1:?Missing KEY}"
  local body="${2:?Missing BODY}"

  local payload
  payload=$(jq -n --arg body "$body" '{body: $body}')
  local tmp
  tmp=$(mktemp)
  echo "$payload" > "$tmp"
  trap 'rm -f "$tmp"' EXIT

  curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
    -X POST -H "Content-Type: application/json" \
    -d "@${tmp}" \
    "${JIRA_BASE_URL}/rest/api/2/issue/${key}/comment" | jq -r '.id // "OK"'
}

cmd_set_sprint() {
  local key="${1:?Missing KEY}"
  local sprint_id="${2:?Missing SPRINT_ID}"

  curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
    -X POST -H "Content-Type: application/json" \
    -d "{\"issues\": [\"${key}\"]}" \
    "${JIRA_BASE_URL}/rest/agile/1.0/sprint/${sprint_id}/issue" \
    | jq -r '.// "OK"'
}

cmd_get_sprint_info() {
  curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
    "${JIRA_BASE_URL}/rest/agile/1.0/board/${JIRA_BOARD_ID}/sprint?state=active,future" \
    | jq '.values[] | {id, name, state, startDate, endDate}'
}

case "${1:-}" in
  get)              shift; jira_get "$@" ;;
  set-fix-version)  shift; cmd_set_fix_version "$@" ;;
  set-component)    shift; cmd_set_component "$@" ;;
  set-labels)       shift; cmd_set_labels "$@" ;;
  set-pr-link)      shift; cmd_set_pr_link "$@" ;;
  set-ready)        shift; cmd_set_ready "$@" ;;
  set-qa-contact)   shift; cmd_set_qa_contact "$@" ;;
  set-story-points) shift; cmd_set_story_points "$@" ;;
  set-sprint)       shift; cmd_set_sprint "$@" ;;
  set-field)        shift; echo "Use jira_update directly for custom fields" ;;
  add-comment)      shift; cmd_add_comment "$@" ;;
  get-sprint-info)  shift; cmd_get_sprint_info ;;
  *)                usage ;;
esac
