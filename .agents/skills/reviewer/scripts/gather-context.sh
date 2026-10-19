#!/usr/bin/env bash
set -euo pipefail

PR="${1:?Usage: gather-context.sh <PR_NUMBER>}"
REPO=$(gh repo view --json nameWithOwner -q '.nameWithOwner')
OUT_DIR="/tmp/pr-review-${PR}"
CONTEXT="${OUT_DIR}/context.md"

mkdir -p "${OUT_DIR}/perspectives"
for artifact in context.md diff.patch commentable-lines.txt commit-sha.txt repo-slug.txt pr-url.txt author.txt pr-title.txt changed-paths.txt; do
  rm -f "${OUT_DIR}/${artifact}"
done

# --- 1. PR metadata -----------------------------------------------------------
META=$(gh pr view "$PR" --repo "$REPO" --json \
  title,body,author,additions,deletions,headRefName,baseRefName,baseRefOid,headRefOid,state,url)

TITLE=$(echo "$META"   | jq -r '.title')
AUTHOR=$(echo "$META"  | jq -r '.author.login')
STATE=$(echo "$META"   | jq -r '.state')
URL=$(echo "$META"     | jq -r '.url')
BASE=$(echo "$META"    | jq -r '.baseRefName')
HEAD=$(echo "$META"    | jq -r '.headRefName')
COMMIT=$(echo "$META"  | jq -r '.headRefOid')
BASE_SHA=$(echo "$META" | jq -r '.baseRefOid')
ADDS=$(echo "$META"    | jq -r '.additions')
DELS=$(echo "$META"    | jq -r '.deletions')
BODY=$(echo "$META"    | jq -r '.body // ""')

PR_FILES_JSON=$(gh api "repos/${REPO}/pulls/${PR}/files?per_page=100" --paginate)
FILE_COUNT=$(echo "$PR_FILES_JSON" | jq 'length')
echo "$PR_FILES_JSON" | jq -r '.[].filename' > "${OUT_DIR}/changed-paths.txt"

echo "$COMMIT" > "${OUT_DIR}/commit-sha.txt"
echo "$REPO" > "${OUT_DIR}/repo-slug.txt"
echo "$URL" > "${OUT_DIR}/pr-url.txt"
echo "$AUTHOR" > "${OUT_DIR}/author.txt"
printf '%s' "$TITLE" > "${OUT_DIR}/pr-title.txt"

FILES_TABLE=$(echo "$PR_FILES_JSON" | jq -r '.[] | "| \(.filename) | +\(.additions)/-\(.deletions) |"')

# --- 3. Full diff --------------------------------------------------------------
DIFF=$(gh pr diff "$PR" --repo "$REPO" 2>/dev/null || true)
if [[ -z "$DIFF" ]]; then
  git fetch origin "${HEAD_SHA}" "${BASE_SHA}" 2>/dev/null || true
  DIFF=$(git diff "${BASE_SHA}...${HEAD_SHA}" 2>/dev/null || echo "(diff unavailable)")
fi
echo "$DIFF" > "${OUT_DIR}/diff.patch"

# --- 4. Existing reviews -------------------------------------------------------
REVIEWS_BODY=$(gh api "repos/${REPO}/pulls/${PR}/reviews" \
  --jq '.[] | select(.body != null and .body != "") | "### \(.user.login)\n\(.body)\n"' \
  2>/dev/null || echo "")

INLINE_COMMENTS=$(gh api "repos/${REPO}/pulls/${PR}/comments" \
  --jq '.[] | "- **\(.path):\(.line // .original_line)** (\(.user.login)): \(.body | split("\n") | first)"' \
  2>/dev/null || echo "")

# --- 5. Commentable line ranges ------------------------------------------------
COMMENTABLE=""
current_file=""
while IFS= read -r line; do
  if [[ "$line" =~ ^diff\ --git\ a/(.+)\ b/(.+)$ ]]; then
    current_file="${BASH_REMATCH[2]}"
  elif [[ "$line" =~ ^\@\@.*\+([0-9]+),([0-9]+) ]]; then
    start="${BASH_REMATCH[1]}"
    count="${BASH_REMATCH[2]}"
    end=$((start + count - 1))
    COMMENTABLE="${COMMENTABLE}${current_file}: ${start}-${end}\n"
  elif [[ "$line" =~ ^\@\@.*\+([0-9]+)\ \@\@ ]]; then
    start="${BASH_REMATCH[1]}"
    COMMENTABLE="${COMMENTABLE}${current_file}: ${start}-${start}\n"
  fi
done <<< "$DIFF"

echo -e "$COMMENTABLE" > "${OUT_DIR}/commentable-lines.txt"

# --- 6. Assemble context.md ----------------------------------------------------
cat > "$CONTEXT" << ENDCONTEXT
# PR #${PR} Review Context
Commit: ${COMMIT}

## Metadata
- **Title:** ${TITLE}
- **Author:** ${AUTHOR}
- **State:** ${STATE}
- **URL:** ${URL}
- **Base:** ${BASE} ← ${HEAD}
- **Changes:** ${FILE_COUNT} files (+${ADDS}/-${DELS})

## Changed Files
| Path | Changes |
|------|---------|
${FILES_TABLE}

## Description
${BODY}

## Existing Reviews
${REVIEWS_BODY:-_(none)_}

### Inline Comments
${INLINE_COMMENTS:-_(none)_}

## Diff
\`\`\`diff
${DIFF}
\`\`\`

## Commentable Lines
$(cat "${OUT_DIR}/commentable-lines.txt")
ENDCONTEXT

echo "Context written to ${CONTEXT}"
echo "Files: ${FILE_COUNT}  Additions: +${ADDS}  Deletions: -${DELS}"
