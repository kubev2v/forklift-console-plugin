#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/_config.sh"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_DIR="$SCRIPT_DIR/../state"
STATE_CLI="$SCRIPT_DIR/state-cli.sh"
JIRA_TRANSITION="$SCRIPT_DIR/jira-transition.sh"
JIRA_TRACK="$SCRIPT_DIR/jira-track.sh"

changes=0
report=""

add_report() { report="${report}\n- $*"; }

log() { echo "[reconcile] $*"; }

check_pr_merged() {
  local ticket="$1"
  local pr_number="$2"
  local phase="$3"

  [[ "$phase" == "monitor-pr" ]] || return 0
  [[ -n "$pr_number" && "$pr_number" != "null" ]] || return 0

  local merged_at
  merged_at=$(gh pr view "$pr_number" --repo "$GH_REPO" --json mergedAt --jq '.mergedAt' 2>/dev/null) || return 0

  if [[ -n "$merged_at" && "$merged_at" != "null" ]]; then
    local ticket_type
    ticket_type=$("$STATE_CLI" field "$ticket" '.type' 2>/dev/null)

    if [[ "$ticket_type" == "Bug" ]]; then
      "$JIRA_TRANSITION" "$ticket" "In Progress" 2>/dev/null || true
      "$JIRA_TRANSITION" "$ticket" "POST" 2>/dev/null || true
      "$JIRA_TRANSITION" "$ticket" "Modified" 2>/dev/null || true
    elif [[ "$ticket_type" != "Epic" ]]; then
      "$JIRA_TRANSITION" "$ticket" "In Progress" 2>/dev/null || true
      "$JIRA_TRANSITION" "$ticket" "POST" 2>/dev/null || true
      "$JIRA_TRANSITION" "$ticket" "Closed" 2>/dev/null || true
    fi
    "$JIRA_TRACK" set-qa-contact "$ticket" "$QA_CONTACT" 2>/dev/null || true

    "$STATE_CLI" set "$ticket" '.pr.mergedAt = (now | todate) | .pr.ciStatus = "merged" | .waiting = {active: false, reason: null, since: null}' 2>/dev/null
    "$STATE_CLI" phase "$ticket" track-jira-merged 2>/dev/null

    add_report "${ticket}: PR #${pr_number} merged -> Jira auto-transitioned, phase -> track-jira-merged"
    changes=$((changes + 1))
  fi
}

check_jira_status() {
  local ticket="$1"
  local phase="$2"

  [[ "$ticket" =~ ^MTV-[0-9]+$ ]] || return 0
  [[ "$phase" != "done" ]] || return 0

  source ~/.jira-creds 2>/dev/null || return 0

  local jira_status
  jira_status=$(curl -sf -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
    "${JIRA_BASE_URL}/rest/api/2/issue/${ticket}?fields=status" \
    2>/dev/null | jq -r '.fields.status.name // empty') || return 0

  [[ -n "$jira_status" ]] || return 0

  case "$jira_status" in
    Closed|Verified|"Release Pending")
      if [[ "$phase" != "track-jira-merged" && "$phase" != "done" ]]; then
        "$STATE_CLI" phase "$ticket" done 2>/dev/null
        add_report "${ticket}: Jira externally ${jira_status} -> state advanced to done"
        changes=$((changes + 1))
      fi
      ;;
  esac
}

check_stale_waiting() {
  local ticket="$1"
  local waiting_active="$2"
  local waiting_since="$3"

  [[ "$waiting_active" == "true" ]] || return 0
  [[ -n "$waiting_since" && "$waiting_since" != "null" ]] || return 0

  local now_epoch waiting_epoch days_waiting
  now_epoch=$(date +%s)
  waiting_epoch=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$waiting_since" +%s 2>/dev/null) || \
    waiting_epoch=$(date -d "$waiting_since" +%s 2>/dev/null) || return 0

  days_waiting=$(( (now_epoch - waiting_epoch) / 86400 ))

  if [[ "$days_waiting" -ge "$STALE_THRESHOLD_DAYS" ]]; then
    local waiting_reason
    waiting_reason=$("$STATE_CLI" field "$ticket" '.waiting.reason // "unknown"' 2>/dev/null)
    add_report "${ticket}: Waiting ${days_waiting} days (${waiting_reason}) -> flagged for follow-up"
  fi
}

check_awaiting_info_comments() {
  local ticket="$1"
  local waiting_active="$2"
  local waiting_since="$3"

  [[ "$waiting_active" == "true" ]] || return 0
  local waiting_reason
  waiting_reason=$("$STATE_CLI" field "$ticket" '.waiting.reason // empty' 2>/dev/null)
  [[ "$waiting_reason" == "awaiting-info" ]] || return 0
  [[ "$ticket" =~ ^[A-Z]+-[0-9]+$ ]] || return 0

  source ~/.jira-creds 2>/dev/null || return 0

  local latest_comment_date
  latest_comment_date=$(curl -sf -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
    "${JIRA_BASE_URL}/rest/api/2/issue/${ticket}/comment?orderBy=-created&maxResults=1" \
    2>/dev/null | jq -r '.comments[0].created // empty') || return 0

  [[ -n "$latest_comment_date" ]] || return 0

  local comment_epoch waiting_epoch_val
  comment_epoch=$(date -j -f "%Y-%m-%dT%H:%M:%S" "${latest_comment_date%%.*}" +%s 2>/dev/null) || \
    comment_epoch=$(date -d "${latest_comment_date%%.*}" +%s 2>/dev/null) || return 0
  waiting_epoch_val=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$waiting_since" +%s 2>/dev/null) || \
    waiting_epoch_val=$(date -d "$waiting_since" +%s 2>/dev/null) || return 0

  if [[ "$comment_epoch" -gt "$waiting_epoch_val" ]]; then
    "$STATE_CLI" resume "$ticket" 2>/dev/null
    "$STATE_CLI" phase "$ticket" investigate 2>/dev/null
    add_report "${ticket}: New Jira comment detected -> auto-resumed, back to investigate"
    changes=$((changes + 1))
  fi
}

check_untracked_pr() {
  local ticket="$1"
  local pr_number="$2"
  local phase="$3"

  [[ "$ticket" =~ ^MTV-[0-9]+$ ]] || return 0
  [[ -z "$pr_number" || "$pr_number" == "null" ]] || return 0
  [[ "$phase" != "done" && "$phase" != "track-jira-merged" && "$phase" != "learn" ]] || return 0

  local pr_json
  pr_json=$(gh pr list --repo "$GH_REPO" --search "$ticket" --state open --json number,url,headRefName --limit 1 2>/dev/null) || return 0

  local found_number
  found_number=$(echo "$pr_json" | jq -r '.[0].number // empty')
  [[ -n "$found_number" ]] || return 0

  "$STATE_CLI" watch "$found_number" 2>/dev/null || return 0
  "$STATE_CLI" wait "$ticket" pr-review-pending 2>/dev/null || true

  add_report "${ticket}: Found untracked PR #${found_number} -> state updated, phase -> monitor-pr"
  changes=$((changes + 1))
}

check_post_merge_phases() {
  local ticket="$1"
  local phase="$2"

  if [[ "$phase" == "track-jira-merged" ]]; then
    add_report "${ticket}: Post-merge Jira tracking pending — agent will run Phase 12 on resume"
  fi
}

reconcile() {
  [[ -d "$STATE_DIR" ]] || { log "No state directory"; exit 0; }

  local count=0
  for f in "$STATE_DIR"/*/state.json; do
    [[ -f "$f" ]] || continue

    local ticket phase pr_number waiting_active waiting_since
    ticket=$(jq -r '.ticket' "$f")
    phase=$(jq -r '.phase' "$f")
    pr_number=$(jq -r '.prNumber // empty' "$f")
    waiting_active=$(jq -r '.waiting.active // false' "$f")
    waiting_since=$(jq -r '.waiting.since // empty' "$f")

    [[ "$phase" != "done" ]] || continue
    count=$((count + 1))

    check_untracked_pr "$ticket" "$pr_number" "$phase"
    check_pr_merged "$ticket" "$pr_number" "$phase"
    check_jira_status "$ticket" "$phase"
    check_stale_waiting "$ticket" "$waiting_active" "$waiting_since"
    check_awaiting_info_comments "$ticket" "$waiting_active" "$waiting_since"
    check_post_merge_phases "$ticket" "$phase"
  done

  if [[ -n "$report" ]]; then
    echo "RECONCILIATION ($(date '+%H:%M')):"
    echo -e "$report"
  else
    echo "RECONCILIATION ($(date '+%H:%M')): All ${count} active tickets in sync."
  fi
}

reconcile
