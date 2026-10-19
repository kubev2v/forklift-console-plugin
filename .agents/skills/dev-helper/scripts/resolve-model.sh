#!/usr/bin/env bash
# Resolve subagent model slug from phase + ticket complexity.
# Usage: resolve-model.sh <phase> <complexity> [--json]
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/_config.sh"

PHASE="${1:?Usage: resolve-model.sh <phase> <complexity> [--json]}"
COMPLEXITY="${2:?Usage: resolve-model.sh <phase> <complexity> [--json]}"
JSON=false
[[ "${3:-}" == "--json" ]] && JSON=true

DEFAULT=$(jq -r '.phases.models.default // "composer-2.5"' "$CONFIG_FILE")
MEDIUM=$(jq -r '.phases.models.medium // "cursor-grok-4.6-high"' "$CONFIG_FILE")
STRONG=$(jq -r '.phases.models.strong // "claude-4.6-opus-max-thinking"' "$CONFIG_FILE")

MECHANICAL='triage investigate jira-track send-pr monitor-pr learn track-jira-merged'
# investigate is creative but triage group uses default for triage half; treat per-phase:
MECHANICAL_ONLY='jira-track send-pr monitor-pr learn track-jira-merged'

model="$DEFAULT"
tier="default"
reason="default tier (Composer)"
needs_approval=false

if [[ " $MECHANICAL_ONLY " == *" $PHASE "* ]]; then
  model="$DEFAULT"
  tier="default"
  reason="mechanical phase"
elif [[ "$COMPLEXITY" == "clear" ]]; then
  model="$DEFAULT"
  tier="default"
  reason="clear complexity"
elif [[ "$COMPLEXITY" == "complicated" ]]; then
  model="$MEDIUM"
  tier="medium"
  reason="complicated complexity (Grok)"
elif [[ "$COMPLEXITY" == "complex" ]]; then
  model="$STRONG"
  tier="strong"
  reason="complex complexity (Opus)"
  needs_approval=true
else
  model="$DEFAULT"
  reason="unknown complexity; fallback to default"
fi

# Opus always requires explicit user approval before dispatch
if [[ "$model" == "$STRONG" ]]; then
  needs_approval=true
fi

if [[ "$JSON" == true ]]; then
  jq -n \
    --arg model "$model" \
    --arg tier "$tier" \
    --arg reason "$reason" \
    --argjson needsApproval "$needs_approval" \
    --arg phase "$PHASE" \
    --arg complexity "$COMPLEXITY" \
    '{phase: $phase, complexity: $complexity, model: $model, tier: $tier,
      reason: $reason, needsApproval: $needsApproval}'
else
  echo "model=$model tier=$tier needsApproval=$needs_approval reason=$reason"
fi
