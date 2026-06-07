#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/_config.sh"

STATE_DIR="$(cd "$(dirname "$0")/.." && pwd)/state"
mkdir -p "$STATE_DIR"

usage() {
  cat <<'USAGE'
Usage: state-cli.sh <command> [args]

Commands:
  init    <TICKET_KEY> <TYPE> [URL]   Create a new state file
  get     <TICKET_KEY>                Print the full state JSON
  field   <TICKET_KEY> <JQ_PATH>      Print a single field (e.g. '.phase')
  set     <TICKET_KEY> <JQ_EXPR>      Update state with a jq expression
  phase   <TICKET_KEY> <PHASE_NAME>   Set the current phase
  list                                List all tracked tickets
  active                              List tickets not in 'done' phase
  wait    <TICKET_KEY> <REASON>        Mark ticket as waiting
  resume  <TICKET_KEY>                Clear waiting state
  waiting                             List all waiting tickets
  watch   <MTV-XXXX|PR_NUMBER|PR_URL>  Add a PR to monitoring
  unwatch <MTV-XXXX|PR_NUMBER|PR_URL> Remove a PR from monitoring
  babysit [MINUTES]                   Mark tickets for periodic monitoring
  unbabysit                           Clear babysit marker
USAGE
  exit 1
}

state_file() {
  local dir="${STATE_DIR}/${1}"
  mkdir -p "$dir"
  echo "${dir}/state.json"
}

atomic_write() {
  local file="$1"
  local content="$2"
  local tmp
  tmp=$(mktemp "${file}.XXXXXX")
  echo "$content" > "$tmp"
  mv "$tmp" "$file"
}

# Finds state file by PR number (scans all state files)
find_state_by_pr() {
  local pr_num="$1"
  [[ -d "$STATE_DIR" ]] || return 1
  for f in "$STATE_DIR"/*/state.json; do
    [[ -f "$f" ]] || continue
    local file_pr
    file_pr=$(jq -r '.prNumber // empty' "$f")
    if [[ "$file_pr" == "$pr_num" ]]; then
      echo "$f"
      return 0
    fi
  done
  return 1
}

# Resolves input to key + pr_number + pr_url + repo.
# Input can be: MTV-XXXX, a PR number, or a full PR URL.
# Sets: RESOLVED_KEY, RESOLVED_PR_NUMBER, RESOLVED_PR_URL, RESOLVED_REPO
resolve_input() {
  local input="$1"
  RESOLVED_KEY="" RESOLVED_PR_NUMBER="" RESOLVED_PR_URL="" RESOLVED_REPO="$GH_REPO"

  if [[ "$input" =~ ^MTV-[0-9]+$ ]]; then
    RESOLVED_KEY="$input"
    local file
    file=$(state_file "$RESOLVED_KEY")
    if [[ -f "$file" ]]; then
      RESOLVED_PR_NUMBER=$(jq -r '.prNumber // empty' "$file")
      RESOLVED_PR_URL=$(jq -r '.prUrl // empty' "$file")
    fi
    if [[ -z "$RESOLVED_PR_NUMBER" ]]; then
      RESOLVED_PR_NUMBER=$(gh pr list --repo "$RESOLVED_REPO" --search "$RESOLVED_KEY" --json number --jq '.[0].number // empty' 2>/dev/null) || true
      [[ -n "$RESOLVED_PR_NUMBER" ]] && RESOLVED_PR_URL="https://github.com/${RESOLVED_REPO}/pull/${RESOLVED_PR_NUMBER}"
    fi
  elif [[ "$input" =~ ^https?:// ]]; then
    RESOLVED_PR_URL="$input"
    RESOLVED_PR_NUMBER=$(echo "$RESOLVED_PR_URL" | grep -o '[0-9]*$')
    RESOLVED_REPO=$(echo "$RESOLVED_PR_URL" | sed 's|https://github.com/||; s|/pull/.*||')
  else
    RESOLVED_PR_NUMBER="$input"
    RESOLVED_PR_URL="https://github.com/${RESOLVED_REPO}/pull/${RESOLVED_PR_NUMBER}"
  fi

  if [[ -n "$RESOLVED_PR_NUMBER" && -z "$RESOLVED_KEY" ]]; then
    local state_match
    state_match=$(find_state_by_pr "$RESOLVED_PR_NUMBER") || true
    if [[ -n "$state_match" ]]; then
      RESOLVED_KEY=$(jq -r '.ticket' "$state_match")
    else
      local pr_data
      pr_data=$(gh pr view "$RESOLVED_PR_NUMBER" --repo "$RESOLVED_REPO" --json title,body --jq '.title + "\n" + .body' 2>/dev/null) || true
      if [[ "$pr_data" =~ (MTV-[0-9]+) ]]; then
        RESOLVED_KEY="${BASH_REMATCH[1]}"
      fi
    fi
  fi
}

cmd_watch() {
  local input="${1:?Missing MTV-XXXX, PR_NUMBER, or PR_URL}"
  resolve_input "$input"

  if [[ -z "$RESOLVED_PR_NUMBER" ]]; then
    echo "ERROR: Could not determine PR number for ${input}" >&2
    exit 1
  fi
  if [[ -z "$RESOLVED_KEY" ]]; then
    echo "ERROR: Could not find MTV-XXXX ticket key for PR #${RESOLVED_PR_NUMBER}" >&2
    exit 1
  fi

  local file
  file=$(state_file "$RESOLVED_KEY")

  if [[ -f "$file" ]]; then
    local updated
    updated=$(jq \
      --arg prUrl "$RESOLVED_PR_URL" \
      --argjson prNum "$RESOLVED_PR_NUMBER" \
      '.phase = "monitor-pr" | .prUrl = $prUrl | .prNumber = $prNum' "$file")
    atomic_write "$file" "$updated"
    echo "Updated ${RESOLVED_KEY}: now monitoring PR #${RESOLVED_PR_NUMBER}"
    return
  fi

  local now
  now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  local json
  json=$(jq -n \
    --arg ticket "$RESOLVED_KEY" \
    --arg url "${JIRA_BASE_URL}/browse/${RESOLVED_KEY}" \
    --arg prUrl "$RESOLVED_PR_URL" \
    --argjson prNum "$RESOLVED_PR_NUMBER" \
    --arg now "$now" \
    '{
      version: 1,
      ticket: $ticket,
      ticketUrl: $url,
      type: "Unknown",
      phase: "monitor-pr",
      branch: null,
      prUrl: $prUrl,
      prNumber: $prNum,
      startedAt: $now,
      investigation: { completedAt: null, findings: null, rootCause: null, affectedFiles: [] },
      design: { planFile: null, approvedAt: null },
      pr: { createdAt: $now, mergedAt: null, ciStatus: null, lastChecked: null },
      history: []
    }')

  atomic_write "$file" "$json"
  echo "Watching ${RESOLVED_KEY}: PR #${RESOLVED_PR_NUMBER}"
}

cmd_unwatch() {
  local input="${1:?Missing MTV-XXXX, PR_NUMBER, or PR_URL}"
  resolve_input "$input"

  local key="${RESOLVED_KEY}"
  if [[ -z "$key" && -n "$RESOLVED_PR_NUMBER" ]]; then
    local state_match
    state_match=$(find_state_by_pr "$RESOLVED_PR_NUMBER") || true
    if [[ -n "$state_match" ]]; then
      key=$(jq -r '.ticket' "$state_match")
    fi
  fi

  if [[ -z "$key" ]]; then
    echo "ERROR: Could not find ticket for ${input}" >&2
    exit 1
  fi

  local file
  file=$(state_file "$key")
  [[ -f "$file" ]] || { echo "No state for $key" >&2; exit 1; }

  local pr
  pr=$(jq -r '.prNumber // "?"' "$file")
  rm -f "$file"
  echo "Removed ${key} (PR #${pr}) from monitoring"
}

cmd_init() {
  local key="${1:?Missing TICKET_KEY}"
  local type="${2:?Missing TYPE (Bug/Story/Task)}"
  local url="${3:-${JIRA_BASE_URL}/browse/${key}}"
  local file
  file=$(state_file "$key")

  if [[ -f "$file" ]]; then
    echo "State file already exists: $file" >&2
    exit 1
  fi

  local now
  now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  local json
  json=$(jq -n \
    --arg ticket "$key" \
    --arg url "$url" \
    --arg type "$type" \
    --arg now "$now" \
    '{
      version: 1,
      ticket: $ticket,
      ticketUrl: $url,
      type: $type,
      phase: "triage",
      branch: null,
      prUrl: null,
      prNumber: null,
      startedAt: $now,
      investigation: { completedAt: null, findings: null, rootCause: null, affectedFiles: [] },
      design: { planFile: null, approvedAt: null },
      pr: { createdAt: null, mergedAt: null, ciStatus: null, lastChecked: null },
      learn: { status: "none", committedAt: null },
      complexity: null,
      workSize: null,
      history: []
    }')

  atomic_write "$file" "$json"
  echo "$key"
}

cmd_get() {
  local key="${1:?Missing TICKET_KEY}"
  local file
  file=$(state_file "$key")
  [[ -f "$file" ]] || { echo "No state for $key" >&2; exit 1; }
  cat "$file"
}

cmd_field() {
  local key="${1:?Missing TICKET_KEY}"
  local path="${2:?Missing JQ_PATH}"
  local file
  file=$(state_file "$key")
  [[ -f "$file" ]] || { echo "No state for $key" >&2; exit 1; }
  jq -r "$path" "$file"
}

cmd_set() {
  local key="${1:?Missing TICKET_KEY}"
  shift
  local file
  file=$(state_file "$key")
  [[ -f "$file" ]] || { echo "No state for $key" >&2; exit 1; }

  local updated
  updated=$(jq "$@" "$file")
  atomic_write "$file" "$updated"
}

validate_transition() {
  local key="$1"
  local target="$2"
  local file
  file=$(state_file "$key")
  local errors=()
  local artifact_dir="${STATE_DIR}/${key}"

  local current_type current_phase learn_status
  current_type=$(jq -r '.type // "null"' "$file")
  current_phase=$(jq -r '.phase' "$file")
  learn_status=$(jq -r '.learn.status // "none"' "$file")

  has_field() { [[ "$(jq -r "$1 // empty" "$file")" != "" ]]; }
  has_artifact() { [[ -f "${artifact_dir}/${1}" ]]; }

  case "$target" in
    investigate)
      has_artifact "triage.md" || errors+=("Missing artifact: triage.md")
      [[ "$current_type" != "null" ]] || errors+=("Missing state field: .type")
      ;;
    ask-more-info|reproduce)
      has_artifact "investigation.md" || errors+=("Missing artifact: investigation.md")
      has_field '.investigation.completedAt' || errors+=("Missing state field: .investigation.completedAt")
      ;;
    jira-track)
      [[ "$current_type" != "null" ]] || errors+=("Missing state field: .type")
      if [[ "$current_type" == "Bug" ]]; then
        has_artifact "reproduction-script.ts" || has_artifact "reproduction.md" || \
          errors+=("Bug tickets require reproduction evidence (reproduction-script.ts or reproduction.md)")
      fi
      ;;
    design)
      has_field '.investigation.completedAt' || errors+=("Missing state field: .investigation.completedAt")
      ;;
    implement|verify|e2e-test|send-pr)
      has_field '.branch' || errors+=("Missing state field: .branch (create a branch first)")
      ;;
    monitor-pr)
      has_field '.prNumber' || errors+=("Missing state field: .prNumber (send a PR first)")
      ;;
    learn)
      has_field '.pr.mergedAt' || errors+=("Missing state field: .pr.mergedAt (PR must be merged first)")
      ;;
    track-jira-merged)
      if [[ "$learn_status" != "learned" && "$learn_status" != "reviewed-skipped" ]]; then
        errors+=("Learn phase not completed: .learn.status is '${learn_status}' (must be 'learned' or 'reviewed-skipped')")
      fi
      ;;
    done)
      [[ "$current_phase" == "track-jira-merged" ]] || errors+=("Can only advance to 'done' from 'track-jira-merged' (current: ${current_phase})")
      ;;
  esac

  if [[ ${#errors[@]} -gt 0 ]]; then
    echo "ERROR: Cannot transition ${key} to '${target}' -- missing prerequisites:" >&2
    for err in "${errors[@]}"; do
      echo "  - ${err}" >&2
    done
    return 1
  fi
  return 0
}

cmd_phase() {
  local force=false
  if [[ "${1:-}" == "--force" ]]; then force=true; shift; fi
  local key="${1:?Missing TICKET_KEY}"
  local phase="${2:?Missing PHASE_NAME}"
  local file
  file=$(state_file "$key")
  [[ -f "$file" ]] || { echo "No state for $key" >&2; exit 1; }

  if [[ "$force" == "false" ]]; then
    validate_transition "$key" "$phase" || exit 1
  fi

  local now
  now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  local prev_phase
  prev_phase=$(jq -r '.phase' "$file")

  local updated
  updated=$(jq \
    --arg phase "$phase" \
    --arg now "$now" \
    '.phase = $phase | .history += [{ phase: $phase, at: $now }]' \
    "$file")
  atomic_write "$file" "$updated"

  append_audit "$key" "$prev_phase" "$phase" "$now"
}

append_audit() {
  local key="$1" from="$2" to="$3" timestamp="$4"
  local audit_dir
  audit_dir="$(dirname "$STATE_DIR")/audit"
  mkdir -p "$audit_dir"
  local audit_file="${audit_dir}/${key}.md"
  local date_short="${timestamp%%T*}"
  local time_short="${timestamp#*T}"
  time_short="${time_short%%:*}:${timestamp#*T}" 
  time_short="${timestamp:11:5}"

  if [[ ! -f "$audit_file" ]]; then
    cat > "$audit_file" << EOF
# ${key} Audit Trail

| Phase | From | Date | Time (UTC) |
|-------|------|------|------------|
EOF
  fi

  echo "| ${to} | ${from} | ${date_short} | ${time_short} |" >> "$audit_file"
}

cmd_list() {
  if [[ ! -d "$STATE_DIR" ]] || [[ -z "$(ls -A "$STATE_DIR" 2>/dev/null)" ]]; then
    echo "No tracked tickets"
    return
  fi
  for f in "$STATE_DIR"/*/state.json; do
    [[ -f "$f" ]] || continue
    jq -r '"\(.ticket)\t\(.phase)\t\(.type)"' "$f"
  done | column -t -s $'\t'
}

cmd_active() {
  if [[ ! -d "$STATE_DIR" ]] || [[ -z "$(ls -A "$STATE_DIR" 2>/dev/null)" ]]; then
    echo "No tracked tickets"
    return
  fi
  for f in "$STATE_DIR"/*/state.json; do
    [[ -f "$f" ]] || continue
    local phase
    phase=$(jq -r '.phase' "$f")
    if [[ "$phase" != "done" ]]; then
      jq -r '"\(.ticket)\t\(.phase)\t\(.type)"' "$f"
    fi
  done | column -t -s $'\t'
}

cmd_wait() {
  local key="${1:?Missing TICKET_KEY}"
  local reason="${2:?Missing REASON (awaiting-info|pr-ci-pending|pr-review-pending|pr-merge-pending|rebase-conflicts)}"
  local file
  file=$(state_file "$key")
  [[ -f "$file" ]] || { echo "No state for $key" >&2; exit 1; }

  local now
  now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  local updated
  updated=$(jq \
    --arg reason "$reason" \
    --arg now "$now" \
    '.waiting = { active: true, reason: $reason, since: $now }' \
    "$file")
  atomic_write "$file" "$updated"
  echo "$key is now waiting ($reason)"
}

cmd_resume() {
  local key="${1:?Missing TICKET_KEY}"
  local file
  file=$(state_file "$key")
  [[ -f "$file" ]] || { echo "No state for $key" >&2; exit 1; }

  local updated
  updated=$(jq '.waiting = { active: false, reason: null, since: null }' "$file")
  atomic_write "$file" "$updated"
  echo "$key resumed"
}

cmd_waiting() {
  if [[ ! -d "$STATE_DIR" ]] || [[ -z "$(ls -A "$STATE_DIR" 2>/dev/null)" ]]; then
    echo "No tracked tickets"
    return
  fi
  local found=false
  for f in "$STATE_DIR"/*/state.json; do
    [[ -f "$f" ]] || continue
    local is_waiting
    is_waiting=$(jq -r '.waiting.active // false' "$f")
    if [[ "$is_waiting" == "true" ]]; then
      jq -r '"\(.ticket)\t\(.phase)\t\(.waiting.reason)\t\(.waiting.since)"' "$f"
      found=true
    fi
  done

  if [[ "$found" == "false" ]]; then
    echo "No waiting tickets"
  fi | column -t -s $'\t'
}

cmd_babysit() {
  local minutes="${1:-30}"
  echo "$minutes" > "${STATE_DIR}/babysit.active"
  echo "Babysit mode ON (poll every ${minutes} minutes)"
}

cmd_unbabysit() {
  rm -f "${STATE_DIR}/babysit.active"
  echo "Babysit mode OFF"
}

case "${1:-}" in
  init)       shift; cmd_init "$@" ;;
  get)        shift; cmd_get "$@" ;;
  field)      shift; cmd_field "$@" ;;
  set)        shift; cmd_set "$@" ;;
  phase)      shift; cmd_phase "$@" ;;
  list)       shift; cmd_list ;;
  active)     shift; cmd_active ;;
  wait)       shift; cmd_wait "$@" ;;
  resume)     shift; cmd_resume "$@" ;;
  waiting)    shift; cmd_waiting ;;
  watch)      shift; cmd_watch "$@" ;;
  unwatch)    shift; cmd_unwatch "$@" ;;
  babysit)    shift; cmd_babysit "$@" ;;
  unbabysit)  shift; cmd_unbabysit ;;
  *)          usage ;;
esac
