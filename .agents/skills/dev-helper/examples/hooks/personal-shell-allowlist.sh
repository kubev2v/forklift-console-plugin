#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────────────────────────────────
# Hook: personal-shell-allowlist (beforeShellExecution)
#
# Approves shell commands automatically except for truly destructive git
# operations. This allows the dev-helper to run autonomously without
# prompting on every shell command.
#
# Input: JSON on stdin with a "command" field.
# Output: JSON with "decision" field ("approve" or "ask").
# ──────────────────────────────────────────────────────────────────────────────

input=$(cat)
cmd=$(echo "$input" | jq -r '.command // ""')

approve() { echo '{"decision": "approve"}'; exit 0; }
ask()     { echo '{"decision": "ask"}'; exit 0; }

# Block destructive git operations (force push without lease, hard reset, clean)
if [[ "$cmd" == *"push"* && "$cmd" != *"--force-with-lease"* ]]; then
  [[ "$cmd" == *"--force"* ]] && ask
  [[ "$cmd" =~ (^|[[:space:]])-f([[:space:]]|$) ]] && ask
fi
[[ "$cmd" == *"reset --hard"* ]] && ask
[[ "$cmd" == *"clean -fd"* ]] && ask

# Approve everything else
approve
