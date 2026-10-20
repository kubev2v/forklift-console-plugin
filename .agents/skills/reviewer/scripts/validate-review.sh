#!/usr/bin/env bash
set -euo pipefail

PR="${1:?Usage: validate-review.sh <PR_NUMBER>}"
OUT_DIR="/tmp/pr-review-${PR}"
REVIEW="${OUT_DIR}/review.json"
COMMENTABLE="${OUT_DIR}/commentable-lines.txt"
MAX_COMMENT_LEN=500
PERSPECTIVES=("Developer" "QE" "UX" "Architect" "Security" "Forklift expert")
MIN_PERSPECTIVES=3
REVIEW_EVENT_APPROVE="APPROVE"
REVIEW_EVENT_COMMENT="COMMENT"

errors=()

# --- Existence checks ----------------------------------------------------------
if [[ ! -f "$REVIEW" ]]; then
  echo "FAIL: ${REVIEW} not found"
  exit 1
fi
if [[ ! -f "$COMMENTABLE" ]]; then
  echo "FAIL: ${COMMENTABLE} not found (run gather-context.sh first)"
  exit 1
fi

# --- Valid JSON ----------------------------------------------------------------
if ! jq empty "$REVIEW" 2>/dev/null; then
  echo "FAIL: ${REVIEW} is not valid JSON"
  exit 1
fi

# --- Top-level required fields -------------------------------------------------
for field in commit_id event body; do
  val=$(jq -r ".${field} // empty" "$REVIEW")
  if [[ -z "$val" ]]; then
    errors+=("Missing required field: ${field}")
  fi
done

# --- event must be APPROVE or COMMENT (never REQUEST_CHANGES) -----------------
event=$(jq -r '.event' "$REVIEW")
if [[ "$event" != "$REVIEW_EVENT_APPROVE" && "$event" != "$REVIEW_EVENT_COMMENT" ]]; then
  errors+=("event must be APPROVE or COMMENT, got: ${event}")
fi

# --- body must start with greeting ---------------------------------------------
body=$(jq -r '.body' "$REVIEW")
if [[ ! "$body" =~ ^Hi\ @ ]]; then
  errors+=("Review body must start with 'Hi @<author>'")
fi

# --- comments + event coupling -------------------------------------------------
# APPROVE only when there are zero change-suggestion inline comments.
# COMMENT when any inline comment requests changes.
comment_count=$(jq '.comments | length' "$REVIEW")
if [[ "$event" == "$REVIEW_EVENT_APPROVE" && "$comment_count" -gt 0 ]]; then
  errors+=("event APPROVE is not allowed with inline comments (${comment_count}); use COMMENT when requesting changes")
fi
if [[ "$event" == "$REVIEW_EVENT_COMMENT" && "$comment_count" -eq 0 && ! "$body" =~ \*\*\[[A-Za-z\ ]+\]\*\* ]]; then
  errors+=("event COMMENT with empty comments requires at least one **[Perspective]** body item, or use APPROVE")
fi
if [[ "$event" == "$REVIEW_EVENT_APPROVE" && "$body" =~ Please\ address ]]; then
  errors+=("event APPROVE body must not ask to address comments; use COMMENT")
fi

# --- Per-comment checks --------------------------------------------------------
declare -a found_perspectives=()
if [[ "$comment_count" -gt 0 ]]; then
for i in $(seq 0 $((comment_count - 1))); do
  prefix="comments[${i}]"

  # Required fields
  for field in path line body; do
    val=$(jq -r ".comments[${i}].${field} // empty" "$REVIEW")
    if [[ -z "$val" ]]; then
      errors+=("${prefix}: missing '${field}'")
    fi
  done

  # Body length
  body_len=$(jq -r ".comments[${i}].body | length" "$REVIEW")
  if [[ "$body_len" -gt "$MAX_COMMENT_LEN" ]]; then
    path=$(jq -r ".comments[${i}].path" "$REVIEW")
    line=$(jq -r ".comments[${i}].line" "$REVIEW")
    errors+=("${prefix} (${path}:${line}): body is ${body_len} chars, max ${MAX_COMMENT_LEN}")
  fi

  # Line within commentable ranges
  c_path=$(jq -r ".comments[${i}].path" "$REVIEW")
  c_line=$(jq -r ".comments[${i}].line" "$REVIEW")
  if [[ -n "$c_path" && -n "$c_line" && "$c_line" != "null" ]]; then
    in_range=false
    while IFS= read -r range_line; do
      [[ -z "$range_line" ]] && continue
      range_file="${range_line%%:*}"
      range_spec="${range_line#*: }"
      if [[ "$range_file" == "$c_path" ]]; then
        range_start="${range_spec%%-*}"
        range_end="${range_spec##*-}"
        if [[ "$c_line" -ge "$range_start" && "$c_line" -le "$range_end" ]]; then
          in_range=true
          break
        fi
      fi
    done < "$COMMENTABLE"
    if [[ "$in_range" == "false" ]]; then
      errors+=("${prefix}: line ${c_line} in ${c_path} is not within any commentable range")
    fi
  fi

  # Collect perspective labels
  c_body=$(jq -r ".comments[${i}].body" "$REVIEW")
  for p in "${PERSPECTIVES[@]}"; do
    if [[ "$c_body" == *"[${p}]"* ]]; then
      found_perspectives+=("$p")
    fi
  done
done
fi

# Also check body for perspective labels
for p in "${PERSPECTIVES[@]}"; do
  if [[ "$body" == *"[${p}]"* ]]; then
    found_perspectives+=("$p")
  fi
done

# Deduplicate found perspectives
if [[ ${#found_perspectives[@]} -gt 0 ]]; then
  unique_perspectives=($(printf '%s\n' "${found_perspectives[@]}" | sort -u))
else
  unique_perspectives=()
fi
# Clean APPROVE may omit perspective labels. COMMENT with any finding needs min perspectives.
has_finding=false
if [[ "$comment_count" -gt 0 ]]; then
  has_finding=true
fi
if [[ "$event" == "$REVIEW_EVENT_COMMENT" && "$body" =~ \*\*\[[A-Za-z\ ]+\]\*\* ]]; then
  has_finding=true
fi
if [[ "$event" == "$REVIEW_EVENT_APPROVE" && "$comment_count" -eq 0 ]]; then
  :
elif [[ "$has_finding" == "true" && "${#unique_perspectives[@]}" -lt "$MIN_PERSPECTIVES" ]]; then
  errors+=("Only ${#unique_perspectives[@]} perspective(s) found (${unique_perspectives[*]:-none}), need at least ${MIN_PERSPECTIVES} of: ${PERSPECTIVES[*]}")
fi

# --- Report --------------------------------------------------------------------
if [[ ${#errors[@]} -gt 0 ]]; then
  {
    echo "VALIDATION FAILED (${#errors[@]} error(s)):"
    for err in "${errors[@]}"; do
      echo "  - ${err}"
    done
  } >&2
  exit 1
fi

if [[ "$comment_count" -eq 0 ]]; then
  echo "VALIDATION PASSED: 0 inline comment(s), event=${event}"
else
  echo "VALIDATION PASSED: ${comment_count} inline comment(s), perspectives: ${unique_perspectives[*]}, event=${event}"
fi
exit 0
