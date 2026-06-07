#!/usr/bin/env bash
# Shared test setup — creates a temp workspace with mock config

setup() {
  TEST_DIR="$(mktemp -d)"
  SKILL_DIR="${TEST_DIR}/.cursor/skills/dev-helper"
  SCRIPTS_DIR="${SKILL_DIR}/scripts"

  mkdir -p "$SCRIPTS_DIR"
  mkdir -p "${SKILL_DIR}/state"

  # Copy all scripts into the test workspace
  cp "$(dirname "${BATS_TEST_FILENAME}")/../"*.sh "$SCRIPTS_DIR/"

  # Create a minimal config so _config.sh doesn't fail
  cat > "${SKILL_DIR}/dev-helper.config.json" << 'CFG'
{
  "jira": { "baseUrl": "https://test.atlassian.net", "projectKey": "TEST", "componentId": "1", "componentName": "Test", "boardId": "1" },
  "github": { "repo": "test/repo", "backendRepo": "test/backend", "user": "testuser", "upstreamRemote": "upstream", "forkRemote": "origin", "baseBranch": "main" },
  "workflow": { "qaContact": "QA", "prLabels": ["test"], "staleWaitingDays": 7 },
  "phases": { "gates": ["design"], "skip": [] }
}
CFG

  # Create a fake ~/.jira-creds so _config.sh doesn't warn
  export HOME="$TEST_DIR"
  cat > "${TEST_DIR}/.jira-creds" << 'CREDS'
JIRA_BASE_URL=https://test.atlassian.net
JIRA_EMAIL=test@test.com
JIRA_API_TOKEN=fake-token
JIRA_ASSIGNEE_ID=test-id
CREDS

  CLI="${SCRIPTS_DIR}/state-cli.sh"
}

teardown() {
  rm -rf "$TEST_DIR"
}
