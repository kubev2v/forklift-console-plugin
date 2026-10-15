#!/usr/bin/env bash
set -euo pipefail

PR="${1:?Usage: post-review.sh <PR_NUMBER>}"
REPO=$(gh repo view --json nameWithOwner -q '.nameWithOwner')
OUT_DIR="/tmp/pr-review-${PR}"
REVIEW="${OUT_DIR}/review.json"

if [[ ! -f "$REVIEW" ]]; then
  echo "FAIL: ${REVIEW} not found"
  exit 1
fi

RESULT=$(gh api "repos/${REPO}/pulls/${PR}/reviews" \
  --method POST --input "$REVIEW")

REVIEW_URL=$(echo "$RESULT" | jq -r '.html_url // empty')

if [[ -n "$REVIEW_URL" ]]; then
  echo "Review posted: ${REVIEW_URL}"
else
  echo "Review posted (no URL in response)"
  echo "$RESULT" | jq -r '.id // "unknown"'
fi
