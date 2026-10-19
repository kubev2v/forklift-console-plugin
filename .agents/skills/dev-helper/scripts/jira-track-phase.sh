#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/_config.sh"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_CLI="$SCRIPT_DIR/state-cli.sh"
JIRA_TRACK="$SCRIPT_DIR/jira-track.sh"
SPRINT_LOOKUP="$SCRIPT_DIR/sprint-lookup.sh"

POINTS_MAP_SMALL=2
POINTS_MAP_MEDIUM=5
POINTS_MAP_LARGE=8

KEY=""
OVERRIDE_POINTS=""
OVERRIDE_SPRINT=""
OVERRIDE_FIX_VERSION=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --points) OVERRIDE_POINTS="$2"; shift 2 ;;
    --sprint) OVERRIDE_SPRINT="$2"; shift 2 ;;
    --fix-version) OVERRIDE_FIX_VERSION="$2"; shift 2 ;;
    MTV-*|PR-*) KEY="$1"; shift ;;
    *) echo "Unknown argument: $1" >&2; exit 1 ;;
  esac
done

[[ -n "$KEY" ]] || { echo "Usage: jira-track-phase.sh MTV-XXXX [--points N] [--sprint auto|ID] [--fix-version auto|NAME]" >&2; exit 1; }

state=$("$STATE_CLI" get "$KEY")
ticket_type=$(echo "$state" | jq -r '.type')
work_size=$(echo "$state" | jq -r '.workSize // empty')

target_points="$OVERRIDE_POINTS"
if [[ -z "$target_points" && -n "$work_size" ]]; then
  case "$work_size" in
    small)  target_points=$POINTS_MAP_SMALL ;;
    medium) target_points=$POINTS_MAP_MEDIUM ;;
    large)  target_points=$POINTS_MAP_LARGE ;;
  esac
fi

current=$("$JIRA_TRACK" get "$KEY")

current_points=$(echo "$current" | jq '.fields.customfield_10028 // null')
current_fix_version=$(echo "$current" | jq -r '.fields.fixVersions[0].name // empty')
current_sprint=$(echo "$current" | jq -r '.fields.customfield_12310940.name // empty')

report=""

if [[ -n "$target_points" ]]; then
  if [[ "$current_points" == "null" || "$current_points" != "$target_points" ]]; then
    "$JIRA_TRACK" set-story-points "$KEY" "$target_points"
    report+="SET story points: ${target_points}\n"
  else
    report+="SKIP story points: already ${current_points}\n"
  fi
fi

target_fix_version="$OVERRIDE_FIX_VERSION"
if [[ -n "$target_fix_version" ]]; then
  if [[ "$current_fix_version" != "$target_fix_version" ]]; then
    "$JIRA_TRACK" set-fix-version "$KEY" "$target_fix_version"
    report+="SET fix version: ${target_fix_version}\n"
  else
    report+="SKIP fix version: already ${current_fix_version}\n"
  fi
fi

if [[ -z "$current_sprint" ]]; then
  if [[ "$OVERRIDE_SPRINT" == "auto" || -z "$OVERRIDE_SPRINT" ]]; then
    sprint_info=$("$SPRINT_LOOKUP" 2>/dev/null || echo "")
    sprint_id=$(echo "$sprint_info" | grep "^SPRINT_ID:" | awk '{print $2}' || true)
    if [[ -n "$sprint_id" ]]; then
      "$JIRA_TRACK" set-sprint "$KEY" "$sprint_id"
      report+="SET sprint: ${sprint_id}\n"
    fi
  elif [[ -n "$OVERRIDE_SPRINT" ]]; then
    "$JIRA_TRACK" set-sprint "$KEY" "$OVERRIDE_SPRINT"
    report+="SET sprint: ${OVERRIDE_SPRINT}\n"
  fi
else
  report+="SKIP sprint: already assigned (${current_sprint})\n"
fi

if [[ "$ticket_type" == "Story" ]]; then
  parent_key=$(echo "$current" | jq -r '.fields.parent.key // empty')
  if [[ -n "$parent_key" ]]; then
    "$STATE_CLI" set "$KEY" --arg epic "$parent_key" '.parentEpic = $epic'
    report+="SET parent epic in state: ${parent_key}\n"
  fi
fi

echo "=== jira-track-phase.sh: ${KEY} ==="
printf "%b" "$report"
echo "=== Done ==="
