#!/usr/bin/env bats
# Tests for eval-orchestrator.sh

setup() {
  TEST_DIR="$(mktemp -d)"
  FIXTURES="${TEST_DIR}/fixtures"
  mkdir -p "$FIXTURES"

  EVAL="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)/eval-orchestrator.sh"
  GOLD_DIR="$(cd "$(dirname "$BATS_TEST_FILENAME")/../../docs" && pwd)"
  export EVAL

  # Good: 4 Tasks, no npm test, no SKILL read
  cat > "${FIXTURES}/pass.jsonl" <<'EOF'
{"role":"assistant","message":{"content":[{"type":"tool_use","name":"Task","input":{"subagent_type":"generalPurpose"}}]}}
{"role":"assistant","message":{"content":[{"type":"tool_use","name":"Task","input":{"subagent_type":"generalPurpose"}}]}}
{"role":"assistant","message":{"content":[{"type":"tool_use","name":"Task","input":{"subagent_type":"generalPurpose"}}]}}
{"role":"assistant","message":{"content":[{"type":"tool_use","name":"Task","input":{"subagent_type":"generalPurpose"}}]}}
EOF

  # Bad: 0 Tasks, npm test
  cat > "${FIXTURES}/fail.jsonl" <<'EOF'
{"role":"assistant","message":{"content":[{"type":"tool_use","name":"Shell","input":{"command":"npm test"}}]}}
{"role":"assistant","message":{"content":[{"type":"text","text":"Fixed inline without subagents"}]}}
EOF

  # Minimal pass: 1 Task
  cat > "${FIXTURES}/minimal-pass.jsonl" <<'EOF'
{"role":"assistant","message":{"content":[{"type":"tool_use","name":"Task","input":{"subagent_type":"generalPurpose"}}]}}
EOF
}

teardown() {
  rm -rf "$TEST_DIR"
}

@test "strict profile PASSes with 4 Task dispatches" {
  run "$EVAL" "${FIXTURES}/pass.jsonl" --profile strict
  [ "$status" -eq 0 ]
  [[ "$output" == *"OVERALL: PASS"* ]]
}

@test "strict profile FAILs with 0 Tasks and npm test" {
  run "$EVAL" "${FIXTURES}/fail.jsonl" --profile strict
  [ "$status" -eq 1 ]
  [[ "$output" == *"OVERALL: FAIL"* ]]
}

@test "minimal profile PASSes with 1 Task" {
  run "$EVAL" "${FIXTURES}/minimal-pass.jsonl" --profile minimal
  [ "$status" -eq 0 ]
  [[ "$output" == *"OVERALL: PASS"* ]]
}

@test "json output includes overall field" {
  run "$EVAL" "${FIXTURES}/pass.jsonl" --profile strict --json
  [ "$status" -eq 0 ]
  echo "$output" | jq -e '.overall == true' >/dev/null
}
