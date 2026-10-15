#!/usr/bin/env bash
# Find dev-helper lessons relevant to a PR review context.
# Usage: select-lessons-for-pr.sh <PR_NUMBER>
# Prerequisite: gather-context.sh <PR>
set -euo pipefail

PR="${1:?Usage: select-lessons-for-pr.sh <PR_NUMBER>}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT_DIR="/tmp/pr-review-${PR}"
LESSONS_GREP="${SCRIPT_DIR}/../../dev-helper/scripts/lessons-grep.sh"
OUTPUT="${OUT_DIR}/lessons-context.md"
HITS_TMP="${OUT_DIR}/lessons-hits.tmp"

if [[ ! -f "${OUT_DIR}/changed-paths.txt" ]]; then
  echo "FAIL: run gather-context.sh ${PR} first" >&2
  exit 1
fi

if [[ ! -x "$LESSONS_GREP" ]]; then
  echo "# Lessons consulted" > "$OUTPUT"
  echo "(lessons-grep.sh not found)" >> "$OUTPUT"
  exit 0
fi

keywords_file="${OUT_DIR}/lessons-keywords.tmp"
: > "$keywords_file"

while IFS= read -r path; do
  [[ -z "$path" ]] && continue
  case "$path" in
    src/providers/*) printf '%s\n' providers Provider >> "$keywords_file" ;;
    src/plans/*) printf '%s\n' plans Plan migration >> "$keywords_file" ;;
    src/storageMaps/*) printf '%s\n' storageMaps StorageMap offload >> "$keywords_file" ;;
    src/networkMaps/*) printf '%s\n' networkMaps NetworkMap >> "$keywords_file" ;;
    src/overview/*) printf '%s\n' overview >> "$keywords_file" ;;
    locales/*) printf '%s\n' i18n locale >> "$keywords_file" ;;
    testing/playwright/*) printf '%s\n' Playwright e2e >> "$keywords_file" ;;
    src/components/common/TableView/*) printf '%s\n' TableView column >> "$keywords_file" ;;
    src/components/common/DataViewTable/*) printf '%s\n' DataViewTable resizable columnWidth >> "$keywords_file" ;;
  esac
  base=$(basename "$path" | sed 's/\.[^.]*$//')
  if [[ ${#base} -ge 5 ]]; then
    printf '%s\n' "$base" >> "$keywords_file"
  fi
done < "${OUT_DIR}/changed-paths.txt"

if [[ -f "${OUT_DIR}/context.md" ]]; then
  grep -oE 'MTV-[0-9]+' "${OUT_DIR}/context.md" 2>/dev/null | sort -u | head -5 >> "$keywords_file" || true
fi

if [[ -f "${OUT_DIR}/diff.patch" ]]; then
  grep -oE 'useK8sWatchResource|isEmpty\(|ForkliftTrans|excludeDisks|copyAppliance' \
    "${OUT_DIR}/diff.patch" 2>/dev/null | sort -u | head -8 >> "$keywords_file" || true
fi

unique_kw=$(sort -u "$keywords_file" | grep -v '^$' | head -30)

{
  echo "# Lessons consulted (for reviewer only — do not paste into GitHub review)"
  echo ""
  echo "| Source | Lesson | Matched because |"
  echo "|--------|--------|-----------------|"
} > "$OUTPUT"

if [[ -z "$unique_kw" ]]; then
  echo "| — | (no keywords derived from PR) | — |" >> "$OUTPUT"
  echo "Lessons written to ${OUTPUT}"
  exit 0
fi

: > "$HITS_TMP"
batch=()
while IFS= read -r kw; do
  batch+=("$kw")
  if [[ ${#batch[@]} -ge 6 ]]; then
    "$LESSONS_GREP" "${batch[@]}" 2>/dev/null >> "$HITS_TMP" || true
    batch=()
  fi
done <<< "$unique_kw"
if [[ ${#batch[@]} -gt 0 ]]; then
  "$LESSONS_GREP" "${batch[@]}" 2>/dev/null >> "$HITS_TMP" || true
fi

count=0
max_hits=20
while IFS= read -r hit; do
  [[ -z "$hit" ]] && continue
  [[ "$hit" == *"(no matching lessons)"* ]] && continue
  file_part="${hit%%:*}"
  rest="${hit#*: }"
  line_no="${rest%%:*}"
  lesson_text="${rest#*: }"
  lesson_text="${lesson_text# }"
  short=$(echo "$lesson_text" | cut -c1-120)
  short=${short//|/\\|}
  echo "| ${file_part}:${line_no} | ${short} | keyword batch |" >> "$OUTPUT"
  count=$((count + 1))
  [[ "$count" -ge "$max_hits" ]] && break
done < <(sort -u "$HITS_TMP" 2>/dev/null || true)

if [[ "$count" -eq 0 ]]; then
  first_kw=$(echo "$unique_kw" | head -3 | tr '\n' ' ')
  echo "| — | (no matching lessons) | keywords: ${first_kw} |" >> "$OUTPUT"
fi

rm -f "$keywords_file" "$HITS_TMP"
echo "Lessons written to ${OUTPUT} (${count} hit(s))"
