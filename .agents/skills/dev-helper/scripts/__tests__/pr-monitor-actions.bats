#!/usr/bin/env bats

load setup

setup_mocks() {
  export TEST_DIR
  mkdir -p "$TEST_DIR/bin"

  # Mock gh -- returns canned GraphQL/REST responses
  cat > "$TEST_DIR/bin/gh" << MOCK
#!/usr/bin/env bash
echo "\$@" >> "${TEST_DIR}/gh_calls.log"
if [[ "\$1" == "api" && "\$2" == "graphql" ]]; then
  cat "${TEST_DIR}/mock_graphql.json"
elif [[ "\$1" == "api" && "\$2" =~ repos/ ]]; then
  local jq_filter=""
  for arg in "\$@"; do
    if [[ "\$prev" == "--jq" ]]; then jq_filter="\$arg"; fi
    prev="\$arg"
  done
  local data
  data=\$(cat "${TEST_DIR}/mock_compare.json" 2>/dev/null || echo '{"behind_by": 0}')
  if [[ -n "\$jq_filter" ]]; then
    echo "\$data" | jq -r "\$jq_filter"
  else
    echo "\$data"
  fi
fi
MOCK
  chmod +x "$TEST_DIR/bin/gh"

  export PATH="$TEST_DIR/bin:$PATH"
}

write_pr_response() {
  local state="${1:-OPEN}"
  local merged="${2:-false}"
  local mergeable="${3:-MERGEABLE}"
  local ci_state="${4:-SUCCESS}"
  local review_decision="${5:-APPROVED}"
  local unresolved="${6:-0}"
  local merged_at="null"
  if [ "$merged" = "true" ]; then
    merged_at="\"2026-07-01T00:00:00Z\""
  fi

  local threads_json="[]"
  if [ "$unresolved" -gt 0 ]; then
    threads_json='[{"isResolved": false, "comments": {"nodes": [{"author": {"login": "reviewer"}, "body": "Please fix this", "path": "src/test.ts", "createdAt": "2026-07-01T00:00:00Z"}]}}]'
  fi

  local ci_checks="[]"
  if [ "$ci_state" = "FAILURE" ]; then
    ci_checks='[{"name": "lint", "conclusion": "FAILURE", "status": "COMPLETED"}]'
  fi

  local reviews="[]"
  if [ "$review_decision" = "APPROVED" ]; then
    reviews='[{"author": {"login": "reviewer"}, "state": "APPROVED", "body": "LGTM", "submittedAt": "2026-07-01T00:00:00Z"}]'
  fi

  cat > "$TEST_DIR/mock_graphql.json" << EOF
{
  "data": {
    "repository": {
      "pullRequest": {
        "title": "Test PR",
        "state": "${state}",
        "mergeable": "${mergeable}",
        "merged": ${merged},
        "mergedAt": ${merged_at},
        "headRefName": "feature-branch",
        "headRepositoryOwner": { "login": "testuser" },
        "reviewDecision": "${review_decision}",
        "commits": {
          "nodes": [{
            "commit": {
              "statusCheckRollup": {
                "state": "${ci_state}",
                "contexts": {
                  "nodes": ${ci_checks}
                }
              }
            }
          }]
        },
        "reviews": { "nodes": ${reviews} },
        "reviewThreads": { "nodes": ${threads_json} }
      }
    }
  }
}
EOF

  cat > "$TEST_DIR/mock_compare.json" << 'EOF'
{"behind_by": 0}
EOF
}

init_pr_state() {
  local learn="${1:-none}"
  bash "$CLI" init MTV-1000 Bug
  bash "$CLI" set MTV-1000 ".prNumber = 42 | .prUrl = \"https://github.com/test/repo/pull/42\" | .learn.status = \"${learn}\""
}

# --- tests ---

@test "outputs ACTION: rebase when behind main" {
  setup_mocks
  write_pr_response "OPEN" false "MERGEABLE" "SUCCESS" "APPROVED"
  init_pr_state "learned"

  # Override compare to show behind
  cat > "$TEST_DIR/mock_compare.json" << 'EOF'
{"behind_by": 5}
EOF

  run bash "$SCRIPTS_DIR/pr-monitor.sh" 42 MTV-1000
  [ "$status" -eq 0 ]

  echo "$output" | grep -q "Needs Rebase: true"
}

@test "outputs ACTION: fix-ci when CI failing" {
  setup_mocks
  write_pr_response "OPEN" false "MERGEABLE" "FAILURE" "APPROVED"
  init_pr_state "learned"

  run bash "$SCRIPTS_DIR/pr-monitor.sh" 42 MTV-1000
  [ "$status" -eq 0 ]

  echo "$output" | grep -q "CI Passing: false"
  echo "$output" | grep -q "CI_FAILING\|CI Status: FAILURE"
}

@test "outputs ACTION: reply-to-comments with comment details" {
  setup_mocks
  write_pr_response "OPEN" false "MERGEABLE" "SUCCESS" "APPROVED" 1
  init_pr_state "learned"

  run bash "$SCRIPTS_DIR/pr-monitor.sh" 42 MTV-1000
  [ "$status" -eq 0 ]

  echo "$output" | grep -q "Unresolved Threads: 1"
  echo "$output" | grep -q "Please fix this"
}

@test "outputs ACTION: learn when ready to merge but learn=none" {
  setup_mocks
  write_pr_response "OPEN" false "MERGEABLE" "SUCCESS" "APPROVED"
  init_pr_state "none"

  run bash "$SCRIPTS_DIR/pr-monitor.sh" 42 MTV-1000
  [ "$status" -eq 0 ]

  echo "$output" | grep -q "LEARN_PENDING"
}

@test "outputs ACTION: merge when all criteria met" {
  setup_mocks
  write_pr_response "OPEN" false "MERGEABLE" "SUCCESS" "APPROVED"
  init_pr_state "learned"

  run bash "$SCRIPTS_DIR/pr-monitor.sh" 42 MTV-1000
  [ "$status" -eq 0 ]

  echo "$output" | grep -q "READY_TO_MERGE"
}

@test "outputs ACTION: none when waiting for review" {
  setup_mocks
  write_pr_response "OPEN" false "MERGEABLE" "SUCCESS" "REVIEW_REQUIRED"
  init_pr_state "learned"

  run bash "$SCRIPTS_DIR/pr-monitor.sh" 42 MTV-1000
  [ "$status" -eq 0 ]

  echo "$output" | grep -q "WAITING_FOR_REVIEW"
}
