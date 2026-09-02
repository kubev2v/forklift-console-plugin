#!/usr/bin/env bash
# Validate MTV Jira ticket metadata required for pull requests.
# Can be used locally or by GitHub Actions.

set -euo pipefail

readonly JIRA_BASE="${JIRA_BASE:-https://redhat.atlassian.net}"
readonly MTV_PATTERN='MTV-[0-9]+'
readonly JIRA_FIELDS='fixVersions,customfield_10020,customfield_10028'

TICKET_KEY=""
PR_TITLE=""
PR_BODY=""
COMMITS_JSON=""
VERBOSE=false
OUTPUT_FILE=""

log_verbose() {
  if [[ "$VERBOSE" == true ]]; then
    echo "$1"
  fi
}

log_error() {
  echo "$1" >&2
}

write_output() {
  local line="$1"

  if [[ -n "$OUTPUT_FILE" ]]; then
    echo "$line" >> "$OUTPUT_FILE"
  else
    echo "$line"
  fi
}

show_help() {
  cat <<'EOF'
Usage:
  validate-jira-ticket.sh --ticket MTV-1234
  validate-jira-ticket.sh --pr-title TITLE --pr-body BODY [--commits-json FILE]

Options:
  --ticket KEY           Validate a specific MTV ticket key
  --pr-title TITLE       PR title to search for MTV-XXXX
  --pr-body BODY         PR description to search for MTV-XXXX
  --commits-json FILE    GitHub commits JSON array (pull request commits API)
  --output-file FILE     Write key=value results for GitHub Actions
  --verbose, -v          Enable verbose output
  --help, -h             Show this help message

Environment:
  JIRA_EMAIL             Jira account email (required for validation)
  JIRA_API_TOKEN         Jira API token (required for validation)

Examples:
  source ~/.jira-creds && ./scripts/validate-jira-ticket.sh --ticket MTV-6264
  ./scripts/validate-jira-ticket.sh --pr-title "MTV-6264 | Example" --pr-body ""
EOF
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --ticket)
        TICKET_KEY="$2"
        shift 2
        ;;
      --pr-title)
        PR_TITLE="$2"
        shift 2
        ;;
      --pr-body)
        PR_BODY="$2"
        shift 2
        ;;
      --commits-json)
        COMMITS_JSON="$2"
        shift 2
        ;;
      --output-file)
        OUTPUT_FILE="$2"
        shift 2
        ;;
      --verbose|-v)
        VERBOSE=true
        shift
        ;;
      --help|-h)
        show_help
        exit 0
        ;;
      *)
        log_error "Unknown option: $1"
        show_help >&2
        exit 1
        ;;
    esac
  done
}

collect_keys_from_text() {
  local text="$1"
  if [[ -n "$text" ]]; then
    grep -oE "$MTV_PATTERN" <<< "$text" || true
  fi
}

extract_ticket_key() {
  local key

  key="$(collect_keys_from_text "$PR_TITLE" | head -1)"
  if [[ -n "$key" ]]; then echo "$key"; return; fi

  if [[ -n "$COMMITS_JSON" && -f "$COMMITS_JSON" ]]; then
    local commit_text
    commit_text="$(jq -r '.[].commit.message' "$COMMITS_JSON")"
    key="$(collect_keys_from_text "$commit_text" | head -1)"
    if [[ -n "$key" ]]; then echo "$key"; return; fi
  fi

  key="$(collect_keys_from_text "$PR_BODY" | head -1)"
  if [[ -n "$key" ]]; then echo "$key"; return; fi
}

jira_auth_header() {
  if [[ -z "${JIRA_EMAIL:-}" || -z "${JIRA_API_TOKEN:-}" ]]; then
    log_error "JIRA_EMAIL and JIRA_API_TOKEN must be set"
    exit 1
  fi

  if [[ "$JIRA_BASE" != https://* ]]; then
    log_error "JIRA_BASE must use https:// (got: ${JIRA_BASE})"
    exit 1
  fi

  echo "Authorization: Basic $(printf '%s' "${JIRA_EMAIL}:${JIRA_API_TOKEN}" | base64 | tr -d '\n')"
}

fetch_ticket() {
  local auth_header
  auth_header="$(jira_auth_header)" || exit 1

  curl -sSf \
    --connect-timeout 10 \
    --max-time 30 \
    -H "$auth_header" \
    -H "Content-Type: application/json" \
    "${JIRA_BASE}/rest/api/3/issue/${TICKET_KEY}?fields=${JIRA_FIELDS}"
}

validate_ticket_data() {
  local ticket_data="$1"
  local missing=()
  local fix_versions
  local sprint_names
  local story_points

  fix_versions="$(echo "$ticket_data" | jq -r '[.fields.fixVersions[]?.name] | join(", ")')"
  sprint_names="$(echo "$ticket_data" | jq -r '[.fields.customfield_10020[]?.name] | join(", ")')"
  story_points="$(echo "$ticket_data" | jq -r '.fields.customfield_10028 // empty')"

  if [[ -z "$fix_versions" ]]; then
    missing+=("fix version")
  fi

  if [[ -z "$sprint_names" ]]; then
    missing+=("sprint")
  fi

  if [[ -z "$story_points" ]]; then
    missing+=("story points")
  fi

  write_output "ticket_key=${TICKET_KEY}"
  write_output "fix_versions=${fix_versions}"
  write_output "sprint_names=${sprint_names}"
  write_output "story_points=${story_points}"

  if [[ ${#missing[@]} -eq 0 ]]; then
    write_output "status=passed"
    return 0
  fi

  write_output "status=failed"
  write_output "missing=$(IFS=','; echo "${missing[*]}")"
  return 1
}

main() {
  parse_args "$@"

  if [[ -n "$OUTPUT_FILE" ]]; then
    : > "$OUTPUT_FILE"
  fi

  if [[ -z "$TICKET_KEY" ]]; then
    TICKET_KEY="$(extract_ticket_key)"
  fi

  if [[ -z "$TICKET_KEY" ]]; then
    log_verbose "No MTV ticket found - skipping validation"
    write_output "status=skipped"
    exit 0
  fi

  log_verbose "Validating $TICKET_KEY"

  local ticket_data
  ticket_data="$(fetch_ticket)"

  if validate_ticket_data "$ticket_data"; then
    log_verbose "Jira validation passed for $TICKET_KEY"
    exit 0
  fi

  log_error "Jira validation failed for $TICKET_KEY"
  exit 1
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  main "$@"
fi
