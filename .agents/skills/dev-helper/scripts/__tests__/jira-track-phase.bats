#!/usr/bin/env bats

load setup

setup_mocks() {
  mkdir -p "$TEST_DIR/bin"

  # Mock curl -- logs calls, returns canned Jira response from mock file
  cat > "$TEST_DIR/bin/curl" << 'MOCK'
#!/usr/bin/env bash
echo "$@" >> "$TEST_DIR/curl_calls.log"
cat "$TEST_DIR/mock_response.json"
MOCK
  chmod +x "$TEST_DIR/bin/curl"

  # Mock jira-track.sh -- intercept get and set-* commands
  cat > "$SCRIPTS_DIR/jira-track.sh" << 'MOCK'
#!/usr/bin/env bash
echo "$@" >> "$TEST_DIR/jira_track_calls.log"
case "$1" in
  get) cat "$TEST_DIR/mock_jira_get.json" ;;
  *) echo "OK" ;;
esac
MOCK
  chmod +x "$SCRIPTS_DIR/jira-track.sh"

  # Mock sprint-lookup.sh -- returns canned sprint recommendation
  cat > "$SCRIPTS_DIR/sprint-lookup.sh" << 'MOCK'
#!/usr/bin/env bash
echo "$@" >> "$TEST_DIR/sprint_lookup_calls.log"
cat << 'EOF'
Sprint Analysis:
  Active: Sprint 42 (ID: 999)
RECOMMEND: active
SPRINT_ID: 999
SPRINT_NAME: Sprint 42
EOF
MOCK
  chmod +x "$SCRIPTS_DIR/sprint-lookup.sh"

  export PATH="$TEST_DIR/bin:$PATH"
  export TEST_DIR
}

write_jira_get_response() {
  local points="${1:-null}"
  local fix_version="${2:-}"
  local sprint="${3:-null}"

  local fix_versions_json="[]"
  if [ -n "$fix_version" ]; then
    fix_versions_json="[{\"name\": \"${fix_version}\"}]"
  fi

  local sprint_json="null"
  if [ "$sprint" != "null" ]; then
    sprint_json="{\"name\": \"${sprint}\", \"id\": 999}"
  fi

  cat > "$TEST_DIR/mock_jira_get.json" << EOF
{
  "key": "MTV-1234",
  "fields": {
    "issuetype": { "name": "Story" },
    "summary": "Test ticket",
    "status": { "name": "New" },
    "customfield_10028": ${points},
    "fixVersions": ${fix_versions_json},
    "customfield_12310940": ${sprint_json},
    "parent": { "key": "MTV-100", "fields": { "issuetype": { "name": "Epic" } } }
  }
}
EOF
}

write_parent_response() {
  cat > "$TEST_DIR/mock_response.json" << 'EOF'
{
  "key": "MTV-100",
  "fields": {
    "issuetype": { "name": "Epic" },
    "summary": "Parent epic"
  }
}
EOF
}

init_state_with_worksize() {
  local key="$1"
  local type="${2:-Story}"
  local worksize="$3"

  bash "$CLI" init "$key" "$type"
  bash "$CLI" set "$key" --arg ws "$worksize" '.workSize = $ws'
}

# --- tests ---

@test "auto-maps small workSize to 2 points" {
  setup_mocks
  write_jira_get_response null "" null
  write_parent_response
  init_state_with_worksize MTV-1234 Story small

  run bash "$SCRIPTS_DIR/jira-track-phase.sh" MTV-1234
  [ "$status" -eq 0 ]

  grep -q "set-story-points MTV-1234 2" "$TEST_DIR/jira_track_calls.log"
}

@test "auto-maps medium workSize to 5 points" {
  setup_mocks
  write_jira_get_response null "" null
  write_parent_response
  init_state_with_worksize MTV-1234 Story medium

  run bash "$SCRIPTS_DIR/jira-track-phase.sh" MTV-1234
  [ "$status" -eq 0 ]

  grep -q "set-story-points MTV-1234 5" "$TEST_DIR/jira_track_calls.log"
}

@test "auto-maps large workSize to 8 points" {
  setup_mocks
  write_jira_get_response null "" null
  write_parent_response
  init_state_with_worksize MTV-1234 Story large

  run bash "$SCRIPTS_DIR/jira-track-phase.sh" MTV-1234
  [ "$status" -eq 0 ]

  grep -q "set-story-points MTV-1234 8" "$TEST_DIR/jira_track_calls.log"
}

@test "respects --points override" {
  setup_mocks
  write_jira_get_response null "" null
  write_parent_response
  init_state_with_worksize MTV-1234 Story small

  run bash "$SCRIPTS_DIR/jira-track-phase.sh" MTV-1234 --points 13
  [ "$status" -eq 0 ]

  grep -q "set-story-points MTV-1234 13" "$TEST_DIR/jira_track_calls.log"
}

@test "skips story points if already correct" {
  setup_mocks
  write_jira_get_response 5 "" null
  write_parent_response
  init_state_with_worksize MTV-1234 Story medium

  run bash "$SCRIPTS_DIR/jira-track-phase.sh" MTV-1234
  [ "$status" -eq 0 ]

  if [ -f "$TEST_DIR/jira_track_calls.log" ]; then
    ! grep -q "set-story-points" "$TEST_DIR/jira_track_calls.log"
  fi
}

@test "skips fix version if already set" {
  setup_mocks
  write_jira_get_response 5 "2.8" null
  write_parent_response
  init_state_with_worksize MTV-1234 Story medium

  run bash "$SCRIPTS_DIR/jira-track-phase.sh" MTV-1234 --fix-version 2.8
  [ "$status" -eq 0 ]

  if [ -f "$TEST_DIR/jira_track_calls.log" ]; then
    ! grep -q "set-fix-version" "$TEST_DIR/jira_track_calls.log"
  fi
}

@test "skips sprint if already assigned" {
  setup_mocks
  write_jira_get_response null "" "Sprint 42"
  write_parent_response
  init_state_with_worksize MTV-1234 Story medium

  run bash "$SCRIPTS_DIR/jira-track-phase.sh" MTV-1234
  [ "$status" -eq 0 ]

  if [ -f "$TEST_DIR/jira_track_calls.log" ]; then
    ! grep -q "set-sprint" "$TEST_DIR/jira_track_calls.log"
  fi
}

@test "sets fields that differ" {
  setup_mocks
  write_jira_get_response 3 "" null
  write_parent_response
  init_state_with_worksize MTV-1234 Story medium

  run bash "$SCRIPTS_DIR/jira-track-phase.sh" MTV-1234
  [ "$status" -eq 0 ]

  grep -q "set-story-points MTV-1234 5" "$TEST_DIR/jira_track_calls.log"
}

@test "stores parent epic in state for Stories" {
  setup_mocks
  write_jira_get_response null "" null
  write_parent_response
  init_state_with_worksize MTV-1234 Story medium

  bash "$SCRIPTS_DIR/jira-track-phase.sh" MTV-1234 > /dev/null

  run bash "$CLI" field MTV-1234 '.parentEpic'
  [ "$output" = "MTV-100" ]
}

@test "skips parent epic for non-Stories" {
  setup_mocks

  # Write Bug-specific jira-get response (no parent field)
  cat > "$TEST_DIR/mock_jira_get.json" << 'EOF'
{
  "key": "MTV-1234",
  "fields": {
    "issuetype": { "name": "Bug" },
    "summary": "Bug ticket",
    "status": { "name": "New" },
    "customfield_10028": null,
    "fixVersions": [],
    "customfield_12310940": null
  }
}
EOF
  write_parent_response

  bash "$CLI" init MTV-1234 Bug
  bash "$CLI" set MTV-1234 '.workSize = "small"'

  bash "$SCRIPTS_DIR/jira-track-phase.sh" MTV-1234 > /dev/null

  run bash "$CLI" field MTV-1234 '.parentEpic // empty'
  [ "$output" = "" ]
}
