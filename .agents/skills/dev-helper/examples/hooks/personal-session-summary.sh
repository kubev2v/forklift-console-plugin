#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────────────────────────────────
# Hook: personal-session-summary (onExitConversation)
#
# Appends a session summary to a daily log file when a Cursor conversation ends.
# Tracks which tickets were active and their status at session close.
#
# Output: JSON with "additional_context" key (informational).
# ──────────────────────────────────────────────────────────────────────────────

HOOKS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_DIR="$(cd "$HOOKS_DIR/../skills/dev-helper/state" 2>/dev/null && pwd)" || exit 0
SUMMARY_DIR="$HOOKS_DIR/../skills/dev-helper/summaries"

mkdir -p "$SUMMARY_DIR"

timestamp=$(date '+%Y-%m-%d %H:%M')
date_stamp=$(date '+%Y-%m-%d')
summary_file="$SUMMARY_DIR/${date_stamp}.md"

# ── Gather active ticket info ────────────────────────────────────────────────

active_tickets=""
active_count=0

if [[ -d "$STATE_DIR" ]] && [[ -n "$(ls -A "$STATE_DIR" 2>/dev/null)" ]]; then
  for f in "$STATE_DIR"/*/state.json; do
    [[ -f "$f" ]] || continue
    ticket=$(jq -r '.ticket' "$f")
    phase=$(jq -r '.phase' "$f")
    pr_url=$(jq -r '.prUrl // empty' "$f")
    pr_number=$(jq -r '.prNumber // empty' "$f")
    is_waiting=$(jq -r '.waiting.active // false' "$f")
    wait_reason=$(jq -r '.waiting.reason // ""' "$f")

    [[ "$phase" == "done" ]] && continue

    status_desc="phase: ${phase}"
    if [[ "$is_waiting" == "true" ]]; then
      status_desc+=" (waiting: ${wait_reason})"
    fi
    if [[ -n "$pr_number" ]]; then
      status_desc+=", PR #${pr_number}"
    fi

    active_tickets+="- ${ticket}: ${status_desc}\n"
    active_count=$((active_count + 1))
  done
fi

# ── Write summary ────────────────────────────────────────────────────────────

{
  echo ""
  echo "## Session Summary (${timestamp})"
  echo ""
  if [[ -n "$active_tickets" ]]; then
    echo "**Active tickets (${active_count}):**"
    echo -e "$active_tickets"
  else
    echo "No active tickets."
  fi
  echo ""
  echo "---"
} >> "$summary_file"

jq -n --arg msg "Session summary written to ${summary_file}" '{"additional_context": $msg}'
