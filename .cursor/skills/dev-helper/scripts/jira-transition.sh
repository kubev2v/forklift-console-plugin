#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/_config.sh"
source ~/.jira-creds

usage() {
  cat <<'USAGE'
Usage: jira-transition.sh <TICKET_KEY> <TARGET_STATUS>
       jira-transition.sh discover <TICKET_KEY>

Transitions a Jira ticket to the target status.
Use 'discover' to list available transitions for a ticket.

Common statuses: New, Assigned, In Progress, POST, Modified, Closed
USAGE
  exit 1
}

discover_transitions() {
  local key="${1:?Missing KEY}"
  curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
    "${JIRA_BASE_URL}/rest/api/2/issue/${key}/transitions" \
    | jq '.transitions[] | {id, name: .name, to: .to.name}'
}

do_transition() {
  local key="${1:?Missing KEY}"
  local target="${2:?Missing TARGET_STATUS}"

  local transitions
  transitions=$(curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
    "${JIRA_BASE_URL}/rest/api/2/issue/${key}/transitions")

  local transition_id
  transition_id=$(echo "$transitions" | jq -r \
    --arg target "$target" \
    '.transitions[] | select(.to.name == $target or .name == $target) | .id' \
    | head -1)

  if [[ -z "$transition_id" ]]; then
    echo "ERROR: No transition to '$target' available from current status." >&2
    echo "Available transitions:" >&2
    echo "$transitions" | jq '.transitions[] | "\(.name) -> \(.to.name)"' >&2
    exit 1
  fi

  local payload
  payload=$(jq -n --arg id "$transition_id" '{transition: {id: $id}}')
  local tmp
  tmp=$(mktemp)
  echo "$payload" > "$tmp"

  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" \
    -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
    -X POST -H "Content-Type: application/json" \
    -d "@${tmp}" \
    "${JIRA_BASE_URL}/rest/api/2/issue/${key}/transitions")

  rm -f "$tmp"

  if [[ "$code" == "204" ]]; then
    echo "Transitioned ${key} to ${target}"
  else
    echo "ERROR: Transition failed (HTTP ${code})" >&2
    exit 1
  fi
}

case "${1:-}" in
  discover) shift; discover_transitions "$@" ;;
  "")       usage ;;
  *)
    KEY="${1:?Missing KEY}"
    TARGET="${2:?Missing TARGET_STATUS}"
    do_transition "$KEY" "$TARGET"
    ;;
esac
