#!/usr/bin/env bash
# Merge perspective JSON files into review.json for GitHub posting.
# Usage: merge-perspective-reviews.sh <PR_NUMBER>
set -euo pipefail

PR="${1:?Usage: merge-perspective-reviews.sh <PR_NUMBER>}"
OUT_DIR="/tmp/pr-review-${PR}"
PERS_DIR="${OUT_DIR}/perspectives"
REVIEW="${OUT_DIR}/review.json"

commit_id=$(cat "${OUT_DIR}/commit-sha.txt")
author=$(cat "${OUT_DIR}/author.txt")
title=$(cat "${OUT_DIR}/pr-title.txt")

if [[ ! -d "$PERS_DIR" ]]; then
  echo "FAIL: ${PERS_DIR} not found" >&2
  exit 1
fi

shopt -s nullglob
files=("${PERS_DIR}"/*.json)
if [[ ${#files[@]} -eq 0 ]]; then
  echo "FAIL: no perspective JSON in ${PERS_DIR}" >&2
  exit 1
fi

body_bullets=()
comments_json='[]'

for f in "${files[@]}"; do
  perspective=$(jq -r '.perspective // empty' "$f")
  while IFS= read -r item; do
    kind=$(echo "$item" | jq -r '.kind')
    if [[ "$kind" == "body" ]]; then
      body_bullets+=("$(echo "$item" | jq -r '.body')")
    elif [[ "$kind" == "inline" ]]; then
      entry=$(echo "$item" | jq -c '{path, line, side: "RIGHT", body}')
      comments_json=$(echo "$comments_json" | jq --argjson e "$entry" '. + [$e]')
    fi
  done < <(jq -c '.findings[]?' "$f")
done

has_changes=false
if [[ $(echo "$comments_json" | jq 'length') -gt 0 ]]; then
  has_changes=true
fi
if [[ ${#body_bullets[@]} -gt 0 ]]; then
  has_changes=true
fi

if [[ "$has_changes" == "true" ]]; then
  event="COMMENT"
  body="Hi @${author}, thanks for this PR!

**${title}**"
  for bullet in "${body_bullets[@]}"; do
    body="${body}
- ${bullet}"
  done
  if [[ $(echo "$comments_json" | jq 'length') -gt 0 ]]; then
    body="${body}

Please address the inline comments (and body items) before merge."
  elif [[ ${#body_bullets[@]} -gt 0 ]]; then
    body="${body}

Please address the items above before merge."
  fi
else
  event="APPROVE"
  body="Hi @${author}, thanks for this PR!

**${title}**

LGTM — no change requests from this review."
  comments_json='[]'
fi

jq -n \
  --arg commit_id "$commit_id" \
  --arg event "$event" \
  --arg body "$body" \
  --argjson comments "$comments_json" \
  '{commit_id: $commit_id, event: $event, body: $body, comments: $comments}' > "$REVIEW"

echo "Merged ${#files[@]} perspective file(s) → ${REVIEW} (event=${event})"
