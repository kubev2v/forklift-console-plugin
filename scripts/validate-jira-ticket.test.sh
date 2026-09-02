#!/usr/bin/env bash
# Tests for validate-jira-ticket.sh
# Run: bash scripts/validate-jira-ticket.test.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_TMPDIR="$(mktemp -d)"
PASS_COUNT=0
FAIL_COUNT=0

cleanup() { rm -rf "$TEST_TMPDIR"; }
trap cleanup EXIT

source "${SCRIPT_DIR}/validate-jira-ticket.sh"

assert_eq() {
  local test_name="$1" expected="$2" actual="$3"
  if [[ "$expected" == "$actual" ]]; then
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    echo "  FAIL: $test_name (expected '$expected', got '$actual')" >&2
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
}

reset_globals() {
  TICKET_KEY=""
  PR_TITLE=""
  PR_BODY=""
  COMMITS_JSON=""
  VERBOSE=false
  OUTPUT_FILE=""
}

make_commits_json() {
  local file="${TEST_TMPDIR}/commits_${RANDOM}.json"
  echo "$1" > "$file"
  echo "$file"
}

echo "=== extract_ticket_key ==="

echo "  title takes priority over body and commits"
reset_globals
PR_TITLE="MTV-100 | Some feature"
PR_BODY="Fixes MTV-200"
COMMITS_JSON="$(make_commits_json '[{"commit":{"message":"MTV-300 commit"}}]')"
assert_eq "title wins" "MTV-100" "$(extract_ticket_key)"

echo "  commits take priority over body"
reset_globals
PR_TITLE="Some feature without ticket"
PR_BODY="Fixes MTV-200"
COMMITS_JSON="$(make_commits_json '[{"commit":{"message":"MTV-150 fix thing"}}]')"
assert_eq "commits win" "MTV-150" "$(extract_ticket_key)"

echo "  body used as fallback"
reset_globals
PR_TITLE="Some feature"
PR_BODY="Resolves: MTV-300"
assert_eq "body fallback" "MTV-300" "$(extract_ticket_key)"

echo "  no key returns empty"
reset_globals
PR_TITLE="Some feature"
PR_BODY="No ticket reference"
assert_eq "empty result" "" "$(extract_ticket_key)"

echo "  first title key wins when multiple present"
reset_globals
PR_TITLE="MTV-555 and MTV-111"
assert_eq "first in title" "MTV-555" "$(extract_ticket_key)"

echo ""
echo "=== validate_ticket_data ==="

echo "  all fields present -> passed"
reset_globals
TICKET_KEY="MTV-100"
OUTPUT_FILE="${TEST_TMPDIR}/out_pass.txt"
: > "$OUTPUT_FILE"
local_data='{"fields":{"fixVersions":[{"name":"2.8"}],"customfield_10020":[{"name":"Sprint 42"}],"customfield_10028":5}}'
validate_ticket_data "$local_data" && rc=0 || rc=$?
assert_eq "exit 0" "0" "$rc"
assert_eq "status=passed" "status=passed" "$(grep '^status=' "$OUTPUT_FILE")"

echo "  missing all fields -> failed"
reset_globals
TICKET_KEY="MTV-200"
OUTPUT_FILE="${TEST_TMPDIR}/out_fail.txt"
: > "$OUTPUT_FILE"
local_data='{"fields":{"fixVersions":[],"customfield_10020":[],"customfield_10028":null}}'
validate_ticket_data "$local_data" && rc=0 || rc=$?
assert_eq "exit 1" "1" "$rc"
assert_eq "status=failed" "status=failed" "$(grep '^status=' "$OUTPUT_FILE")"
assert_eq "all missing" "missing=fix version,sprint,story points" "$(grep '^missing=' "$OUTPUT_FILE")"

echo "  partial fields -> failed with correct missing list"
reset_globals
TICKET_KEY="MTV-300"
OUTPUT_FILE="${TEST_TMPDIR}/out_partial.txt"
: > "$OUTPUT_FILE"
local_data='{"fields":{"fixVersions":[{"name":"2.9"}],"customfield_10020":[],"customfield_10028":null}}'
validate_ticket_data "$local_data" && rc=0 || rc=$?
assert_eq "exit 1" "1" "$rc"
assert_eq "missing sprint+sp" "missing=sprint,story points" "$(grep '^missing=' "$OUTPUT_FILE")"

echo ""
echo "=== parse_args ==="

echo "  --ticket sets TICKET_KEY"
reset_globals
parse_args --ticket MTV-123
assert_eq "ticket" "MTV-123" "$TICKET_KEY"

echo "  PR args and --verbose"
reset_globals
parse_args --pr-title "MTV-456 | Title" --pr-body "Body text" --verbose
assert_eq "title" "MTV-456 | Title" "$PR_TITLE"
assert_eq "body" "Body text" "$PR_BODY"
assert_eq "verbose" "true" "$VERBOSE"

echo ""
echo "=== jira_auth_header ==="

echo "  rejects http:// JIRA_BASE"
env JIRA_BASE="http://jira.example.com" JIRA_EMAIL="x@y.com" JIRA_API_TOKEN="tok" \
  bash -c 'source "'"${SCRIPT_DIR}/validate-jira-ticket.sh"'"; jira_auth_header' 2>/dev/null \
  && rc=0 || rc=$?
assert_eq "rejects http" "1" "$rc"

echo "  rejects missing credentials"
env -u JIRA_EMAIL -u JIRA_API_TOKEN JIRA_BASE="https://jira.example.com" \
  bash -c 'source "'"${SCRIPT_DIR}/validate-jira-ticket.sh"'"; jira_auth_header' 2>/dev/null \
  && rc=0 || rc=$?
assert_eq "rejects no creds" "1" "$rc"

echo ""
echo "=== Results: ${PASS_COUNT} passed, ${FAIL_COUNT} failed ==="

if [[ "$FAIL_COUNT" -gt 0 ]]; then
  exit 1
fi
