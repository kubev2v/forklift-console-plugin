#!/usr/bin/env bats

load setup

# --- init ---

@test "init creates state file with correct fields" {
  run bash "$CLI" init MTV-100 Bug
  [ "$status" -eq 0 ]
  [ "$output" = "MTV-100" ]

  local file="${SKILL_DIR}/state/MTV-100/state.json"
  [ -f "$file" ]

  run jq -r '.ticket' "$file"
  [ "$output" = "MTV-100" ]

  run jq -r '.type' "$file"
  [ "$output" = "Bug" ]

  run jq -r '.phase' "$file"
  [ "$output" = "triage" ]

  run jq -r '.branch' "$file"
  [ "$output" = "null" ]

  run jq -r '.complexity' "$file"
  [ "$output" = "null" ]

  run jq -r '.workSize' "$file"
  [ "$output" = "null" ]
}

@test "init fails if state already exists" {
  bash "$CLI" init MTV-100 Bug
  run bash "$CLI" init MTV-100 Bug
  [ "$status" -eq 1 ]
}

# --- get ---

@test "get returns full JSON" {
  bash "$CLI" init MTV-200 Story
  run bash "$CLI" get MTV-200
  [ "$status" -eq 0 ]
  echo "$output" | jq -e '.ticket == "MTV-200"'
}

@test "get fails for unknown ticket" {
  run bash "$CLI" get MTV-NOPE
  [ "$status" -eq 1 ]
}

# --- field ---

@test "field returns a single value" {
  bash "$CLI" init MTV-300 Task
  run bash "$CLI" field MTV-300 '.type'
  [ "$status" -eq 0 ]
  [ "$output" = "Task" ]
}

# --- set ---

@test "set updates state with jq expression" {
  bash "$CLI" init MTV-400 Bug
  bash "$CLI" set MTV-400 '.branch = "bug/MTV-400"'
  run bash "$CLI" field MTV-400 '.branch'
  [ "$output" = "bug/MTV-400" ]
}

@test "set updates complexity and workSize" {
  bash "$CLI" init MTV-401 Story
  bash "$CLI" set MTV-401 '.complexity = "clear" | .workSize = "small"'
  run bash "$CLI" field MTV-401 '.complexity'
  [ "$output" = "clear" ]
  run bash "$CLI" field MTV-401 '.workSize'
  [ "$output" = "small" ]
}

# --- phase transitions ---

@test "phase advances with valid prerequisites" {
  bash "$CLI" init MTV-500 Bug

  # Write triage artifact (required for investigate)
  echo "triage done" > "${SKILL_DIR}/state/MTV-500/triage.md"
  bash "$CLI" set MTV-500 '.type = "Bug"'

  run bash "$CLI" phase MTV-500 investigate
  [ "$status" -eq 0 ]

  run bash "$CLI" field MTV-500 '.phase'
  [ "$output" = "investigate" ]
}

@test "phase fails without prerequisites" {
  bash "$CLI" init MTV-501 Bug

  # Try to advance to investigate without triage.md
  run bash "$CLI" phase MTV-501 investigate
  [ "$status" -eq 1 ]
}

@test "phase --force bypasses validation" {
  bash "$CLI" init MTV-502 Bug

  run bash "$CLI" phase --force MTV-502 implement
  [ "$status" -eq 0 ]

  run bash "$CLI" field MTV-502 '.phase'
  [ "$output" = "implement" ]
}

@test "phase records history" {
  bash "$CLI" init MTV-503 Story
  echo "triage" > "${SKILL_DIR}/state/MTV-503/triage.md"
  bash "$CLI" phase MTV-503 investigate

  run bash "$CLI" field MTV-503 '.history | length'
  # init doesn't add history, phase adds one entry
  [ "$output" = "1" ]
}

@test "phase creates audit trail" {
  bash "$CLI" init MTV-504 Bug
  bash "$CLI" phase --force MTV-504 investigate

  local audit="${SKILL_DIR}/audit/MTV-504.md"
  [ -f "$audit" ]
  grep -q "investigate" "$audit"
}

# --- validate_transition: learn gate ---

@test "track-jira-merged blocked without learn status" {
  bash "$CLI" init MTV-600 Bug
  bash "$CLI" phase --force MTV-600 monitor-pr
  bash "$CLI" set MTV-600 '.prNumber = 123 | .pr.mergedAt = "2026-01-01"'
  bash "$CLI" phase --force MTV-600 learn
  bash "$CLI" set MTV-600 '.learn.status = "none"'

  run bash "$CLI" phase MTV-600 track-jira-merged
  [ "$status" -eq 1 ]
}

@test "track-jira-merged passes with reviewed-skipped" {
  bash "$CLI" init MTV-601 Bug
  bash "$CLI" phase --force MTV-601 learn
  bash "$CLI" set MTV-601 '.learn.status = "reviewed-skipped"'

  run bash "$CLI" phase MTV-601 track-jira-merged
  [ "$status" -eq 0 ]
}

@test "track-jira-merged rejects legacy skipped value" {
  bash "$CLI" init MTV-602 Bug
  bash "$CLI" phase --force MTV-602 learn
  bash "$CLI" set MTV-602 '.learn.status = "skipped"'

  run bash "$CLI" phase MTV-602 track-jira-merged
  [ "$status" -eq 1 ]
}

# --- wait / resume ---

@test "wait marks ticket as waiting" {
  bash "$CLI" init MTV-700 Story
  bash "$CLI" wait MTV-700 pr-ci-pending

  run bash "$CLI" field MTV-700 '.waiting.active'
  [ "$output" = "true" ]

  run bash "$CLI" field MTV-700 '.waiting.reason'
  [ "$output" = "pr-ci-pending" ]
}

@test "resume clears waiting state" {
  bash "$CLI" init MTV-701 Story
  bash "$CLI" wait MTV-701 pr-review-pending
  bash "$CLI" resume MTV-701

  run bash "$CLI" field MTV-701 '.waiting.active'
  [ "$output" = "false" ]
}

# --- list / active ---

@test "list shows tracked tickets" {
  bash "$CLI" init MTV-800 Bug
  bash "$CLI" init MTV-801 Story

  run bash "$CLI" list
  [ "$status" -eq 0 ]
  echo "$output" | grep -q "MTV-800"
  echo "$output" | grep -q "MTV-801"
}

@test "active excludes done tickets" {
  bash "$CLI" init MTV-810 Bug
  bash "$CLI" init MTV-811 Story
  bash "$CLI" phase --force MTV-811 done

  run bash "$CLI" active
  echo "$output" | grep -q "MTV-810"
  ! echo "$output" | grep -q "MTV-811"
}

# --- atomic_write ---

@test "atomic_write produces valid JSON" {
  bash "$CLI" init MTV-900 Bug
  bash "$CLI" set MTV-900 '.branch = "test-branch"'

  local file="${SKILL_DIR}/state/MTV-900/state.json"
  run jq -e '.' "$file"
  [ "$status" -eq 0 ]
}
