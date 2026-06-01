#!/usr/bin/env bash
# Shared config reader -- sourced by all dev-helper scripts

# Resolve SKILL_DIR with multiple fallback strategies
if [[ -n "${BASH_SOURCE[0]:-}" && "${BASH_SOURCE[0]}" != "$0" ]]; then
  SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." 2>/dev/null && pwd)"
elif [[ -n "${0:-}" && "$0" != "bash" && "$0" != "-bash" ]]; then
  SKILL_DIR="$(cd "$(dirname "$0")/.." 2>/dev/null && pwd)"
fi

# Fallback: locate from git root if the above didn't find the config
if [[ -z "${SKILL_DIR:-}" || ! -f "${SKILL_DIR}/dev-helper.config.json" ]]; then
  GIT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || GIT_ROOT="."
  SKILL_DIR="$GIT_ROOT/.cursor/skills/dev-helper"
fi

CONFIG_FILE="$SKILL_DIR/dev-helper.config.json"

if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "ERROR: Missing config file: $CONFIG_FILE" >&2
  echo "Copy dev-helper.config.example.json to dev-helper.config.json and fill in your values." >&2
  exit 1
fi

config_get() { jq -r "$1" "$CONFIG_FILE"; }

JIRA_BASE_URL=$(config_get '.jira.baseUrl')
JIRA_PROJECT_KEY=$(config_get '.jira.projectKey')
JIRA_COMPONENT_ID=$(config_get '.jira.componentId')
JIRA_COMPONENT_NAME=$(config_get '.jira.componentName')
JIRA_BOARD_ID=$(config_get '.jira.boardId')
GH_REPO=$(config_get '.github.repo')
GH_BACKEND_REPO=$(config_get '.github.backendRepo')
GH_UPSTREAM=$(config_get '.github.upstreamRemote')
GH_FORK=$(config_get '.github.forkRemote')
GH_BASE_BRANCH=$(config_get '.github.baseBranch')
GH_USER=$(config_get '.github.user')
QA_CONTACT=$(config_get '.workflow.qaContact')
PR_LABELS=$(config_get '.workflow.prLabels | join(",")')
STALE_THRESHOLD_DAYS=$(config_get '.workflow.staleWaitingDays')

# Personal secrets (not in config -- per-developer)
CREDS_FILE="${HOME}/.jira-creds"
if [[ -f "$CREDS_FILE" ]]; then
  source "$CREDS_FILE"
fi
export JIRA_EMAIL="${JIRA_EMAIL:-}"
export JIRA_API_TOKEN="${JIRA_API_TOKEN:-}"
export JIRA_ASSIGNEE_ID="${JIRA_ASSIGNEE_ID:-}"
