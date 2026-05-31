#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────────────────────────────────
# Hook: dev-helper-state (onNewConversation)
#
# Injects active ticket context into new Cursor sessions so the agent
# immediately knows what work is in progress and what's waiting.
#
# Output: JSON with "additional_context" key displayed to the agent.
# ──────────────────────────────────────────────────────────────────────────────

HOOKS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_DIR="$(cd "$HOOKS_DIR/../skills/dev-helper/state" 2>/dev/null && pwd)" || exit 0
RECONCILE="$HOOKS_DIR/../skills/dev-helper/scripts/reconcile.sh"

msg=""

# ── Reconciliation (detect external changes like merged PRs) ─────────────────
# The reconcile script checks GitHub for PR merge status and updates state files.

reconcile_output=""
if [[ -x "$RECONCILE" ]]; then
  reconcile_output=$("$RECONCILE" 2>/dev/null) || reconcile_output=""
  if [[ -n "$reconcile_output" && "$reconcile_output" != *"in sync"* ]]; then
    msg+="${reconcile_output}\n\n"
  fi
fi

# ── Active tickets ───────────────────────────────────────────────────────────
# Reads each state/*.json file and builds a summary of in-progress work.

active_tickets=""
waiting_tickets=""
active_count=0
waiting_count=0

if [[ -d "$STATE_DIR" ]] && [[ -n "$(ls -A "$STATE_DIR" 2>/dev/null)" ]]; then
  for f in "$STATE_DIR"/*/state.json; do
    [[ -f "$f" ]] || continue
    phase=$(jq -r '.phase' "$f")
    [[ "$phase" == "done" ]] && continue

    ticket=$(jq -r '.ticket' "$f")
    type=$(jq -r '.type' "$f")
    branch=$(jq -r '.branch // "not set"' "$f")
    pr=$(jq -r '.prUrl // "none"' "$f")
    is_waiting=$(jq -r '.waiting.active // false' "$f")
    wait_reason=$(jq -r '.waiting.reason // ""' "$f")

    active_tickets+="- **${ticket}** (${type}) — phase: ${phase}, branch: ${branch}"
    if [[ "$pr" != "none" && "$pr" != "null" ]]; then
      active_tickets+=", PR: ${pr}"
    fi
    if [[ "$is_waiting" == "true" ]]; then
      active_tickets+=", **WAITING**: ${wait_reason}"
      waiting_tickets+="- ${ticket}: ${wait_reason}\n"
      waiting_count=$((waiting_count + 1))
    fi
    active_tickets+="\n"
    active_count=$((active_count + 1))
  done
fi

if [[ $active_count -gt 0 ]]; then
  msg+="ACTIVE DEV-HELPER TICKETS (${active_count}):\n\n${active_tickets}\n"
fi

# ── Waiting tickets summary ──────────────────────────────────────────────────

if [[ $waiting_count -gt 0 ]]; then
  msg+="WAITING TICKETS (${waiting_count}):\n${waiting_tickets}\n"
fi

# ── Output ───────────────────────────────────────────────────────────────────
# If there's nothing to report, exit silently (no context injected).

if [[ -z "$msg" ]]; then
  exit 0
fi

msg+="To resume work on a ticket, say 'work on MTV-XXXX'. "
msg+="To start a new ticket, name a specific ticket key (e.g. 'work on MTV-1234'). "
msg+="The dev-helper skill will read the state file and resume from the current phase."

agent_message=$(echo -e "$msg")
jq -n --arg msg "$agent_message" '{"additional_context": $msg}'
