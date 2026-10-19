#!/usr/bin/env bats

load setup

setup_mocks() {
  mkdir -p "$TEST_DIR/bin"

  # Mock curl -- logs calls, returns canned response based on URL
  cat > "$TEST_DIR/bin/curl" << 'MOCK'
#!/usr/bin/env bash
echo "$@" >> "$TEST_DIR/curl_calls.log"
# Check if this is a JQL search (children query)
if echo "$@" | grep -q "search?jql="; then
  cat "$TEST_DIR/mock_children_response.json" 2>/dev/null || echo '{"issues":[]}'
else
  cat "$TEST_DIR/mock_response.json" 2>/dev/null || echo '{}'
fi
MOCK
  chmod +x "$TEST_DIR/bin/curl"

  # Mock jira-track.sh -- logs all calls
  cat > "$SCRIPTS_DIR/jira-track.sh" << 'MOCK'
#!/usr/bin/env bash
echo "$@" >> "$TEST_DIR/jira_track_calls.log"
case "$1" in
  get) cat "$TEST_DIR/mock_jira_get.json" 2>/dev/null || echo '{}' ;;
  *) echo "OK" ;;
esac
MOCK
  chmod +x "$SCRIPTS_DIR/jira-track.sh"

  # Mock jira-transition.sh -- logs calls
  cat > "$SCRIPTS_DIR/jira-transition.sh" << 'MOCK'
#!/usr/bin/env bash
echo "$@" >> "$TEST_DIR/jira_transition_calls.log"
echo "Transitioned $1 to $2"
MOCK
  chmod +x "$SCRIPTS_DIR/jira-transition.sh"

  export PATH="$TEST_DIR/bin:$PATH"
  export TEST_DIR
}

write_jira_status_response() {
  local status="${1:-New}"
  cat > "$TEST_DIR/mock_jira_get.json" << EOF
{
  "key": "MTV-1234",
  "fields": {
    "status": { "name": "${status}" },
    "customfield_10028": 5
  }
}
EOF
  cat > "$TEST_DIR/mock_response.json" << EOF
{
  "key": "MTV-1234",
  "fields": {
    "status": { "name": "${status}" }
  }
}
EOF
}

init_ticket() {
  local key="$1"
  local type="$2"
  bash "$CLI" init "$key" "$type"
  bash "$CLI" set "$key" --arg t "$type" '.type = $t'
}

# --- tests ---

@test "transitions Bug to MODIFIED" {
  setup_mocks
  write_jira_status_response "POST"
  init_ticket MTV-1234 Bug

  run bash "$SCRIPTS_DIR/post-merge.sh" MTV-1234
  [ "$status" -eq 0 ]

  grep -q "MTV-1234 MODIFIED" "$TEST_DIR/jira_transition_calls.log"
}

@test "transitions Story to Done" {
  setup_mocks
  write_jira_status_response "In Progress"
  init_ticket MTV-1234 Story

  run bash "$SCRIPTS_DIR/post-merge.sh" MTV-1234
  [ "$status" -eq 0 ]

  grep -q "MTV-1234 Done" "$TEST_DIR/jira_transition_calls.log"
}

@test "skips transition for Epic" {
  setup_mocks
  write_jira_status_response "In Progress"
  init_ticket MTV-1234 Epic

  run bash "$SCRIPTS_DIR/post-merge.sh" MTV-1234
  [ "$status" -eq 0 ]

  if [ -f "$TEST_DIR/jira_transition_calls.log" ]; then
    ! grep -q "MTV-1234" "$TEST_DIR/jira_transition_calls.log"
  fi
}

@test "skips transition if already terminal" {
  setup_mocks
  write_jira_status_response "MODIFIED"
  init_ticket MTV-1234 Bug

  run bash "$SCRIPTS_DIR/post-merge.sh" MTV-1234
  [ "$status" -eq 0 ]

  if [ -f "$TEST_DIR/jira_transition_calls.log" ]; then
    ! grep -q "MTV-1234 MODIFIED" "$TEST_DIR/jira_transition_calls.log"
  fi
}

@test "sets QA contact from config" {
  setup_mocks
  write_jira_status_response "POST"
  init_ticket MTV-1234 Bug

  bash "$SCRIPTS_DIR/post-merge.sh" MTV-1234 > /dev/null

  grep -q "set-qa-contact MTV-1234 QA" "$TEST_DIR/jira_track_calls.log"
}

@test "sets activity type deterministically" {
  setup_mocks
  write_jira_status_response "POST"
  init_ticket MTV-1234 Bug

  bash "$SCRIPTS_DIR/post-merge.sh" MTV-1234 > /dev/null

  grep -q 'set-field MTV-1234.*Quality / Stability / Reliability' "$TEST_DIR/jira_track_calls.log"

  # Reset for Story
  rm -f "$TEST_DIR/jira_track_calls.log" "$TEST_DIR/jira_transition_calls.log"
  rm -rf "${SKILL_DIR}/state/MTV-5678"

  write_jira_status_response "In Progress"
  init_ticket MTV-5678 Story

  bash "$SCRIPTS_DIR/post-merge.sh" MTV-5678 > /dev/null

  grep -q 'set-field MTV-5678.*Product / Portfolio Work' "$TEST_DIR/jira_track_calls.log"
}

@test "NEVER sets story points" {
  setup_mocks
  write_jira_status_response "POST"
  init_ticket MTV-1234 Bug

  bash "$SCRIPTS_DIR/post-merge.sh" MTV-1234 > /dev/null

  if [ -f "$TEST_DIR/jira_track_calls.log" ]; then
    ! grep -q "set-story-points" "$TEST_DIR/jira_track_calls.log"
  fi
}

@test "reads parent epic from state, not Jira" {
  setup_mocks
  write_jira_status_response "In Progress"
  init_ticket MTV-1234 Story
  bash "$CLI" set MTV-1234 '.parentEpic = "MTV-100"'

  # Mock children JQL response: all children done
  cat > "$TEST_DIR/mock_children_response.json" << 'EOF'
{
  "total": 2,
  "issues": [
    { "key": "MTV-1234", "fields": { "status": { "name": "Done" } } },
    { "key": "MTV-1235", "fields": { "status": { "name": "Done" } } }
  ]
}
EOF

  bash "$SCRIPTS_DIR/post-merge.sh" MTV-1234 > /dev/null

  # Verify no curl call fetched the parent field from Jira
  if [ -f "$TEST_DIR/curl_calls.log" ]; then
    ! grep -q "fields=parent" "$TEST_DIR/curl_calls.log"
  fi
}

@test "generates summary.md" {
  setup_mocks
  write_jira_status_response "POST"
  init_ticket MTV-1234 Bug
  bash "$CLI" set MTV-1234 '.prUrl = "https://github.com/test/repo/pull/42" | .prNumber = 42'

  bash "$SCRIPTS_DIR/post-merge.sh" MTV-1234 > /dev/null

  local summary="${SKILL_DIR}/state/MTV-1234/summary.md"
  [ -f "$summary" ]
  grep -q "MTV-1234" "$summary"
}
