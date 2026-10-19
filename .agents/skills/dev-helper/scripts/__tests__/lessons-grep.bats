#!/usr/bin/env bats

setup() {
  TEST_DIR="$(mktemp -d)"
  SKILL_DIR="${TEST_DIR}/dev-helper-skill"
  mkdir -p "${SKILL_DIR}/lessons" "${SKILL_DIR}/scripts"
  cp "$(dirname "${BATS_TEST_FILENAME}")/../lessons-grep.sh" "${SKILL_DIR}/scripts/"
  chmod +x "${SKILL_DIR}/scripts/lessons-grep.sh"
  GREP="${SKILL_DIR}/scripts/lessons-grep.sh"

  cat > "${SKILL_DIR}/lessons/implementation.md" <<'EOF'
# Lessons: Implementation

## Lessons

- [Implementation] OVA embedded disks use PascalCase ID -> Access via cast with ID fallback -> Types mismatch API (MTV-5734, 2026-06-09)
- [Implementation] Unrelated hook tip -> Keep hooks small -> Clarity (MTV-1000, 2026-01-01)

## Superseded

- [Implementation] Old OVA tip that is wrong -> ignore -> superseded (MTV-1, 2025-01-01)
EOF
}

teardown() {
  rm -rf "$TEST_DIR"
}

@test "finds matching lesson and skips superseded" {
  run "$GREP" "OVA"
  [ "$status" -eq 0 ]
  [[ "$output" == *"OVA embedded"* ]]
  [[ "$output" != *"Old OVA tip"* ]]
}

@test "no match prints friendly message" {
  run "$GREP" "zzzz-no-hit"
  [ "$status" -eq 0 ]
  [[ "$output" == *"(no matching lessons)"* ]]
}

@test "missing lessons dir is soft success" {
  rm -rf "${SKILL_DIR}/lessons"
  run "$GREP" "OVA"
  [ "$status" -eq 0 ]
  [[ "$output" == *"(no lessons/"* ]]
}
