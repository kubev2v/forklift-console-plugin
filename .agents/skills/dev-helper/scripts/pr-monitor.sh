#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/_config.sh"

GH_OWNER="${GH_REPO%%/*}"
GH_REPO_NAME="${GH_REPO##*/}"

usage() {
  cat <<'USAGE'
Usage: pr-monitor.sh <PR_NUMBER> [TICKET_KEY]

Checks a PR for:
  - CI status (passing/failing/pending)
  - New review comments
  - Review decisions
  - Merge conflicts
  - Merge readiness
  - Learn status (when TICKET_KEY provided)

Output is structured text for agent consumption.
USAGE
  exit 1
}

PR="${1:?Missing PR_NUMBER}"
TICKET="${2:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
learn_status="none"
if [[ -n "$TICKET" ]]; then
  state_file="$SCRIPT_DIR/../state/$TICKET/state.json"
  if [[ -f "$state_file" ]]; then
    learn_status=$(jq -r '.learn.status // "none"' "$state_file")
  fi
fi

# Fetch PR data via GraphQL
pr_data=$(gh api graphql -f query='
query($owner: String!, $repo: String!, $number: Int!) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $number) {
      title
      state
      mergeable
      merged
      mergedAt
      headRefName
      headRepositoryOwner { login }
      reviewDecision
      commits(last: 1) {
        nodes {
          commit {
            statusCheckRollup {
              state
              contexts(last: 50) {
                nodes {
                  ... on CheckRun {
                    name
                    conclusion
                    status
                  }
                  ... on StatusContext {
                    context
                    state
                  }
                }
              }
            }
          }
        }
      }
      reviews(last: 10) {
        nodes {
          author { login }
          state
          body
          submittedAt
        }
      }
      reviewThreads(last: 50) {
        nodes {
          isResolved
          comments(first: 3) {
            nodes {
              author { login }
              body
              path
              createdAt
            }
          }
        }
      }
    }
  }
}' -f owner="$GH_OWNER" -f repo="$GH_REPO_NAME" -F number="$PR" 2>/dev/null)

if [[ -z "$pr_data" ]]; then
  echo "ERROR: Failed to fetch PR data" >&2
  exit 1
fi

pr=$(echo "$pr_data" | jq '.data.repository.pullRequest')

# Basic info
title=$(echo "$pr" | jq -r '.title')
state=$(echo "$pr" | jq -r '.state')
merged=$(echo "$pr" | jq -r '.merged')
mergeable=$(echo "$pr" | jq -r '.mergeable')
branch=$(echo "$pr" | jq -r '.headRefName')
review_decision=$(echo "$pr" | jq -r '.reviewDecision // "NONE"')

echo "=== PR #${PR}: ${title} ==="
echo "State: ${state} | Merged: ${merged} | Mergeable: ${mergeable}"
echo "Branch: ${branch} | Review: ${review_decision}"
echo ""

# CI status
ci_state=$(echo "$pr" | jq -r '.commits.nodes[0].commit.statusCheckRollup.state // "UNKNOWN"')
echo "--- CI Status: ${ci_state} ---"

if [[ "$ci_state" != "SUCCESS" ]]; then
  echo "Failing/pending checks:"
  echo "$pr" | jq -r '.commits.nodes[0].commit.statusCheckRollup.contexts.nodes[] |
    select(.conclusion != "SUCCESS" and .conclusion != "NEUTRAL" and .state != "SUCCESS") |
    "  - \(.name // .context): \(.conclusion // .state // "PENDING")"' 2>/dev/null || echo "  (none parseable)"

  sonar_failed=$(echo "$pr" | jq -r '[.commits.nodes[0].commit.statusCheckRollup.contexts.nodes[] |
    select(.conclusion != "SUCCESS" and .conclusion != "NEUTRAL" and .state != "SUCCESS") |
    .name // .context] | map(select(test("SonarCloud"; "i"))) | length')
  if [[ "${sonar_failed:-0}" -gt 0 ]]; then
    sonar_script="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/sonar-pr-issues.sh"
    if [[ -x "$sonar_script" ]]; then
      echo ""
      "$sonar_script" "$PR" || echo "  (SonarCloud API fetch failed)" >&2
      echo "FLAG: SONAR_ISSUES"
    fi
  fi
fi
echo ""

# Reviews
echo "--- Reviews ---"
echo "$pr" | jq -r '.reviews.nodes[] | "  \(.author.login): \(.state) (\(.submittedAt))"'
echo ""

# Unresolved threads
unresolved=$(echo "$pr" | jq '[.reviewThreads.nodes[] | select(.isResolved == false)] | length')
echo "--- Unresolved Threads: ${unresolved} ---"
if [[ "$unresolved" -gt 0 ]]; then
  echo "$pr" | jq -r '.reviewThreads.nodes[] | select(.isResolved == false) |
    .comments.nodes[0] | "  [\(.path // "general")] \(.author.login): \(.body | split("\n")[0])"'
fi
echo ""

# Merge readiness assessment
is_approved="false"
if [[ "$review_decision" == "APPROVED" ]]; then
  is_approved="true"
fi
# Fallback: check individual review states when reviewDecision is NONE
# (happens when branch protection doesn't enforce reviewDecision)
if [[ "$is_approved" == "false" ]]; then
  has_approved_review=$(echo "$pr" | jq '[.reviews.nodes[] | select(.state == "APPROVED")] | length')
  if [[ "$has_approved_review" -gt 0 ]]; then
    is_approved="true"
  fi
fi

ci_passing="false"
if [[ "$ci_state" == "SUCCESS" ]]; then
  ci_passing="true"
fi
# Treat CI as passing if only non-blocking GitHub Action workflow checks fail
# (pr-commands.yaml: approval commands, retest, hold, review approval, DCO on non-code PRs)
if [[ "$ci_passing" == "false" && "$ci_state" == "FAILURE" ]]; then
  blocking_failures=$(echo "$pr" | jq '[.commits.nodes[0].commit.statusCheckRollup.contexts.nodes[] |
    select(.conclusion != "SUCCESS" and .conclusion != "NEUTRAL" and .conclusion != "SKIPPED" and .state != "SUCCESS") |
    select(.name // .context |
      test("Handle approval|Handle review|Handle retest|Handle hold|Reset approval|DCO") | not
    )] | length')
  if [[ "$blocking_failures" -eq 0 ]]; then
    ci_passing="true"
  fi
fi

has_conflicts="false"
if [[ "$mergeable" == "CONFLICTING" ]]; then
  has_conflicts="true"
fi

# Check if branch is behind base (needs rebase)
needs_rebase="false"
behind_count="0"
if [[ "$mergeable" == "CONFLICTING" ]]; then
  needs_rebase="true"
elif [[ "$merged" == "false" && "$state" == "OPEN" ]]; then
  # Get the PR head repo owner for cross-fork comparison
  head_owner=$(echo "$pr_data" | jq -r '.data.repository.pullRequest.headRepositoryOwner.login // empty' 2>/dev/null)
  if [[ -n "$head_owner" ]]; then
    behind_count=$(gh api "repos/${GH_REPO}/compare/main...${head_owner}:${branch}" \
      --jq '.behind_by' 2>/dev/null || echo "0")
  fi
  if [[ "$behind_count" -gt 0 ]]; then
    needs_rebase="true"
  fi
fi

echo "=== ASSESSMENT ==="
echo "Approved: ${is_approved}"
echo "CI Passing: ${ci_passing}"
echo "Conflicts: ${has_conflicts}"
echo "Needs Rebase: ${needs_rebase} (${behind_count:-0} commits behind)"
echo "Unresolved Threads: ${unresolved}"
echo "Learn: ${learn_status}"

learn_ready="false"
if [[ "$learn_status" == "learned" || "$learn_status" == "reviewed-skipped" ]]; then
  learn_ready="true"
fi

if [[ "$merged" == "true" ]]; then
  if [[ "$learn_status" == "learned" || "$learn_status" == "reviewed-skipped" ]]; then
    echo "STATUS: MERGED"
    echo "ACTION: none"
    echo "DETAILS: PR is merged and learn is complete"
  else
    echo "STATUS: LEARN_PENDING"
    echo "ACTION: learn"
    echo "DETAILS: PR merged but learn phase not done -- review work and capture learnings"
  fi
elif [[ "$needs_rebase" == "true" ]]; then
  echo "STATUS: NEEDS_REBASE"
  echo "ACTION: rebase"
  echo "DETAILS: Branch is ${behind_count:-0} commits behind main -- rebase and force-push"
elif [[ "$ci_passing" == "false" && "$ci_state" != "PENDING" ]]; then
  echo "STATUS: CI_FAILING"
  echo "ACTION: fix-ci"
  # List failing checks for agent context
  failing_checks=$(echo "$pr" | jq -r '.commits.nodes[0].commit.statusCheckRollup.contexts.nodes[] |
    select(.conclusion != "SUCCESS" and .conclusion != "NEUTRAL" and .conclusion != "SKIPPED" and .state != "SUCCESS") |
    select(.name // .context |
      test("Handle approval|Handle review|Handle retest|Handle hold|Reset approval|DCO") | not
    ) | .name // .context' 2>/dev/null | tr '\n' ', ' | sed 's/,$//')
  echo "DETAILS: Failing checks: ${failing_checks:-unknown}"
elif [[ "$unresolved" -gt 0 ]]; then
  echo "STATUS: ACTION_NEEDED"
  echo "ACTION: reply-to-comments"
  # Output unresolved comment details for agent
  echo "COMMENTS:"
  echo "$pr" | jq -r '.reviewThreads.nodes[] | select(.isResolved == false) |
    .comments.nodes[0] | "  ID:\(.path // "general") | \(.author.login): \(.body | split("\n")[0])"' 2>/dev/null
  echo "DETAILS: ${unresolved} unresolved thread(s) -- reply to each individually"
elif [[ "$review_decision" == "CHANGES_REQUESTED" ]]; then
  echo "STATUS: CHANGES_REQUESTED"
  echo "ACTION: reply-to-comments"
  echo "DETAILS: Changes requested -- address reviewer feedback"
elif [[ "$is_approved" == "true" && "$ci_state" == "PENDING" ]]; then
  echo "STATUS: CI_PENDING"
  echo "ACTION: none"
  echo "DETAILS: Approved but CI still running -- wait"
elif [[ "$is_approved" == "true" && "$ci_passing" == "true" && "$has_conflicts" == "false" && "$unresolved" -eq 0 ]]; then
  if [[ "$learn_ready" == "true" ]]; then
    echo "STATUS: READY_TO_MERGE"
    echo "ACTION: merge"
    echo "DETAILS: All 6 merge criteria pass -- squash merge and delete branch"
  else
    echo "STATUS: LEARN_PENDING"
    echo "ACTION: learn"
    echo "DETAILS: All criteria pass except learn -- review work and capture learnings first"
  fi
else
  echo "STATUS: WAITING_FOR_REVIEW"
  echo "ACTION: none"
  echo "DETAILS: Waiting for reviewer -- no agent action possible"
fi

if [[ "$needs_rebase" == "true" && "$merged" != "true" ]]; then
  echo "FLAG: NEEDS_REBASE"
fi
