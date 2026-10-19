#!/usr/bin/env bash
set -euo pipefail

PR="${1:?Usage: sonar-pr-issues.sh <PR_NUMBER>}"
SONAR_PROJECT_KEY="${SONAR_PROJECT_KEY:-kubev2v_forklift-console-plugin}"
PS="${SONAR_ISSUES_PAGE_SIZE:-50}"

query_url="https://sonarcloud.io/api/issues/search?pullRequest=${PR}&componentKeys=${SONAR_PROJECT_KEY}&resolved=false&ps=${PS}"
response=$(curl -fsS "$query_url")
total=$(echo "$response" | jq -r '.total // 0')

dashboard_url="https://sonarcloud.io/project/issues?pullRequest=${PR}&resolved=false&id=${SONAR_PROJECT_KEY}"

echo "--- SonarCloud open issues (PR #${PR}) ---"
echo "Project: ${SONAR_PROJECT_KEY} | Total open: ${total}"
echo "Dashboard: ${dashboard_url}"
echo ""

if [[ "$total" == "0" ]]; then
  echo "(no open issues returned by API — check may still be red until analysis finishes)"
  exit 0
fi

echo "$response" | jq -r '.issues[] |
  "[\(.severity)] \(.component | split(":")[1] // .component):\(.line // "?") | \(.rule) | \(.message)"'
