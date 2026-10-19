#!/usr/bin/env bash
# Search local lessons/*.md for keywords (skip ## Superseded sections).
# Usage: lessons-grep.sh "keyword1" ["keyword2" ...]
# Max 20 matching lines. Exit 0 even if no lessons dir / no hits.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LESSONS_DIR="${SCRIPT_DIR}/../lessons"
MAX_HITS=20

if [[ $# -lt 1 ]]; then
  echo "Usage: lessons-grep.sh <keyword> [keyword...]" >&2
  exit 1
fi

if [[ ! -d "$LESSONS_DIR" ]]; then
  echo "(no lessons/ directory — copy from examples/lessons.example/)"
  exit 0
fi

# Build case-insensitive pattern: any keyword
pattern=$(printf '%s|' "$@" | sed 's/|$//')

hits=0
shopt -s nullglob
for f in "$LESSONS_DIR"/*.md; do
  [[ -f "$f" ]] || continue
  # Skip pending review queue
  [[ "$(basename "$(dirname "$f")")" == "pending" ]] && continue

  in_superseded=false
  line_no=0
  while IFS= read -r line || [[ -n "$line" ]]; do
    line_no=$((line_no + 1))
    if [[ "$line" =~ ^##[[:space:]]*Superseded ]]; then
      in_superseded=true
      continue
    fi
    if [[ "$line" =~ ^##[[:space:]] ]] && [[ "$in_superseded" == "true" ]]; then
      in_superseded=false
    fi
    [[ "$in_superseded" == "true" ]] && continue
    [[ "$line" =~ ^-[[:space:]] ]] || continue

    if echo "$line" | grep -qiE "$pattern"; then
      echo "$(basename "$f"):${line_no}: ${line}"
      hits=$((hits + 1))
      [[ "$hits" -ge "$MAX_HITS" ]] && break 2
    fi
  done < "$f"
done

if [[ "$hits" -eq 0 ]]; then
  echo "(no matching lessons)"
fi
exit 0
