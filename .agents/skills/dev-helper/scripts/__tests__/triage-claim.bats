#!/usr/bin/env bats

load setup

setup_mocks() {
  mkdir -p "$TEST_DIR/bin"

  export TEST_DIR
  mkdir -p "$TEST_DIR/bin"

  # Mock curl -- logs calls and returns canned Jira response
  cat > "$TEST_DIR/bin/curl" << MOCK
#!/usr/bin/env bash
echo "\$@" >> "${TEST_DIR}/curl_calls.log"
cat "${TEST_DIR}/mock_response.json"
MOCK
  chmod +x "$TEST_DIR/bin/curl"

  # Mock jira-track.sh -- logs calls
  cat > "$SCRIPTS_DIR/jira-track.sh" << MOCK
#!/usr/bin/env bash
echo "\$@" >> "${TEST_DIR}/jira_track_calls.log"
echo "OK"
MOCK
  chmod +x "$SCRIPTS_DIR/jira-track.sh"

  # Mock jira-transition.sh -- logs calls
  cat > "$SCRIPTS_DIR/jira-transition.sh" << MOCK
#!/usr/bin/env bash
echo "\$@" >> "${TEST_DIR}/jira_transition_calls.log"
echo "Transitioned \$1 to \$2"
MOCK
  chmod +x "$SCRIPTS_DIR/jira-transition.sh"

  export PATH="$TEST_DIR/bin:$PATH"
}

write_bug_response() {
  local status="${1:-New}"
  cat > "$TEST_DIR/mock_response.json" << EOF
{
  "key": "MTV-1234",
  "fields": {
    "issuetype": { "name": "Bug" },
    "summary": "Fix broken migration",
    "status": { "name": "${status}" },
    "description": "Detailed description here",
    "priority": { "name": "Major" },
    "components": [{ "id": "1", "name": "UI" }],
    "fixVersions": [{ "name": "2.8" }],
    "customfield_10028": 5,
    "customfield_12310940": { "name": "Sprint 42" },
    "comment": {
      "comments": [
        { "author": { "displayName": "Alice" }, "body": "First comment", "created": "2026-01-01T00:00:00.000+0000" }
      ]
    },
    "attachment": [
      { "filename": "screenshot.png", "content": "https://example.com/screenshot.png" }
    ]
  }
}
EOF
}

write_story_response() {
  cat > "$TEST_DIR/mock_response.json" << 'EOF'
{
  "key": "MTV-5678",
  "fields": {
    "issuetype": { "name": "Story" },
    "summary": "Add new feature",
    "status": { "name": "New" },
    "description": "Feature description",
    "priority": { "name": "Normal" },
    "components": [],
    "fixVersions": [],
    "customfield_10028": null,
    "customfield_12310940": null,
    "comment": { "comments": [] },
    "attachment": []
  }
}
EOF
}

# --- tests ---

@test "fetches ticket and returns structured JSON" {
  setup_mocks
  write_bug_response

  run bash "$SCRIPTS_DIR/triage-claim.sh" MTV-1234
  [ "$status" -eq 0 ]

  echo "$output" | jq -e '.type == "Bug"'
  echo "$output" | jq -e '.summary == "Fix broken migration"'
  echo "$output" | jq -e '.status == "New"'
  echo "$output" | jq -e '.comments | length == 1'
}

@test "sets component via jira-track.sh" {
  setup_mocks
  write_bug_response

  bash "$SCRIPTS_DIR/triage-claim.sh" MTV-1234 > /dev/null

  [ -f "$TEST_DIR/jira_track_calls.log" ]
  grep -q "set-component MTV-1234 1" "$TEST_DIR/jira_track_calls.log"
}

@test "transitions Bug from New to ASSIGNED" {
  setup_mocks
  write_bug_response "New"

  bash "$SCRIPTS_DIR/triage-claim.sh" MTV-1234 > /dev/null

  [ -f "$TEST_DIR/jira_transition_calls.log" ]
  grep -q "MTV-1234 ASSIGNED" "$TEST_DIR/jira_transition_calls.log"
}

@test "does NOT transition Story from New" {
  setup_mocks
  write_story_response

  bash "$SCRIPTS_DIR/triage-claim.sh" MTV-5678 > /dev/null

  if [ -f "$TEST_DIR/jira_transition_calls.log" ]; then
    ! grep -q "ASSIGNED" "$TEST_DIR/jira_transition_calls.log"
  fi
}

@test "initializes state if missing" {
  setup_mocks
  write_bug_response

  bash "$SCRIPTS_DIR/triage-claim.sh" MTV-1234 > /dev/null

  local state_file="${SKILL_DIR}/state/MTV-1234/state.json"
  [ -f "$state_file" ]
  run jq -r '.type' "$state_file"
  [ "$output" = "Bug" ]
}

@test "skips init if state already exists" {
  setup_mocks
  write_bug_response

  bash "$CLI" init MTV-1234 Bug

  bash "$SCRIPTS_DIR/triage-claim.sh" MTV-1234 > /dev/null

  local state_file="${SKILL_DIR}/state/MTV-1234/state.json"
  [ -f "$state_file" ]
  run jq -r '.type' "$state_file"
  [ "$output" = "Bug" ]
}
