#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/_config.sh"
source ~/.jira-creds

ASSIGNEE_ID="${JIRA_ASSIGNEE_ID:?Set JIRA_ASSIGNEE_ID in ~/.jira-creds}"
SPRINT_WEEKS=3
CAPACITY_THRESHOLD=70

# Fetch active and future sprints
sprints=$(curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
  "${JIRA_BASE_URL}/rest/agile/1.0/board/${JIRA_BOARD_ID}/sprint?state=active,future" \
  | jq '[.values[] | {id, name, state, startDate, endDate}]')

active_sprint=$(echo "$sprints" | jq '[.[] | select(.state == "active")] | first')
future_sprint=$(echo "$sprints" | jq '[.[] | select(.state == "future")] | first')

if [[ "$(echo "$active_sprint" | jq -r '.id // empty')" == "" ]]; then
  echo "No active sprint found"
  echo "RECOMMEND: future"
  echo "$future_sprint" | jq .
  exit 0
fi

active_id=$(echo "$active_sprint" | jq -r '.id')
active_name=$(echo "$active_sprint" | jq -r '.name')
start_date=$(echo "$active_sprint" | jq -r '.startDate' | cut -dT -f1)
end_date=$(echo "$active_sprint" | jq -r '.endDate' | cut -dT -f1)

# Calculate sprint progress
now_epoch=$(date +%s)
start_epoch=$(date -j -f "%Y-%m-%d" "$start_date" +%s 2>/dev/null || date -d "$start_date" +%s)
end_epoch=$(date -j -f "%Y-%m-%d" "$end_date" +%s 2>/dev/null || date -d "$end_date" +%s)
total_days=$(( (end_epoch - start_epoch) / 86400 ))
elapsed_days=$(( (now_epoch - start_epoch) / 86400 ))
remaining_days=$(( (end_epoch - now_epoch) / 86400 ))
if (( total_days <= 0 )); then
  progress_pct=100
else
  progress_pct=$(( elapsed_days * 100 / total_days ))
fi

# Query assigned story points in active sprint
assigned_points=$(curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
  "${JIRA_BASE_URL}/rest/api/2/search?jql=sprint=${active_id}+AND+assignee=${ASSIGNEE_ID}&fields=customfield_10028" \
  | jq '[.issues[].fields.customfield_10028 // 0] | add // 0')

# Determine recommendation
future_id=$(echo "$future_sprint" | jq -r '.id // empty')
if [[ -n "$future_id" && $progress_pct -ge $CAPACITY_THRESHOLD ]]; then
  recommend="future"
  reason="Sprint is ${progress_pct}% elapsed (${remaining_days} days left) with ${assigned_points} points assigned"
else
  recommend="active"
  reason="Sprint is ${progress_pct}% elapsed (${remaining_days} days left) with ${assigned_points} points assigned"
fi

cat <<EOF
Sprint Analysis:
  Active: ${active_name} (ID: ${active_id})
  Dates:  ${start_date} to ${end_date}
  Progress: ${progress_pct}% (${elapsed_days}/${total_days} days, ${remaining_days} remaining)
  Your points: ${assigned_points}
  
RECOMMEND: ${recommend}
REASON: ${reason}
SPRINT_ID: $(echo "$sprints" | jq -r ".[] | select(.state == \"${recommend}\") | .id")
SPRINT_NAME: $(echo "$sprints" | jq -r ".[] | select(.state == \"${recommend}\") | .name")
EOF
