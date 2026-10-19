#!/usr/bin/env bash
# Build rules-manifest.json for PR review subagents.
# Usage: select-rules-for-pr.sh <PR_NUMBER>
set -euo pipefail

PR="${1:?Usage: select-rules-for-pr.sh <PR_NUMBER>}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../../.." && pwd)"
OUT_DIR="/tmp/pr-review-${PR}"
PATHS_FILE="${OUT_DIR}/changed-paths.txt"
DIFF_FILE="${OUT_DIR}/diff.patch"
MANIFEST="${OUT_DIR}/rules-manifest.json"

append_rule() {
  local file="$1"
  local rule="$2"
  [[ -f "${REPO_ROOT}/${rule}" ]] || return 0
  printf '%s\n' "$rule" >> "$file"
}

if [[ ! -f "$PATHS_FILE" ]]; then
  echo "FAIL: run gather-context.sh ${PR} first" >&2
  exit 1
fi

shared_f="${OUT_DIR}/rules-shared.tmp"
dev_f="${OUT_DIR}/rules-dev.tmp"
qe_f="${OUT_DIR}/rules-qe.tmp"
ux_f="${OUT_DIR}/rules-ux.tmp"
arch_f="${OUT_DIR}/rules-arch.tmp"
sec_f="${OUT_DIR}/rules-sec.tmp"
fork_f="${OUT_DIR}/rules-fork.tmp"
rm -f "$shared_f" "$dev_f" "$qe_f" "$ux_f" "$arch_f" "$sec_f" "$fork_f"

append_rule "$shared_f" "AGENTS.md"
append_rule "$shared_f" ".agents/rules/project-context.md"

append_rule "$dev_f" "AGENTS.md"
append_rule "$dev_f" ".agents/rules/agents/developer.md"
append_rule "$qe_f" ".agents/rules/agents/qe-agent.md"
append_rule "$ux_f" ".agents/rules/agents/ux-reviewer.md"
append_rule "$arch_f" ".agents/rules/agents/architect.md"
append_rule "$sec_f" ".agents/rules/agents/security-reviewer.md"
append_rule "$fork_f" ".agents/rules/agents/forklift-expert.md"
append_rule "$fork_f" ".agents/rules/project-context.md"

has_ts=false
has_tsx=false
has_scss=false
has_locales=false
has_playwright=false
has_crds=false
has_new_component=false
has_metadata_chain=false
has_providers=false
has_plans=false
has_mappings=false
has_overview=false

while IFS= read -r path; do
  [[ -z "$path" ]] && continue
  case "$path" in
    src/providers/*) has_providers=true ;;
    src/plans/*) has_plans=true ;;
    src/storageMaps/*|src/networkMaps/*) has_mappings=true ;;
    src/overview/*) has_overview=true ;;
    src/utils/crds/*) has_crds=true ;;
    testing/playwright/*) has_playwright=true ;;
    locales/*) has_locales=true ;;
    *.scss) has_scss=true ;;
    *.tsx) has_tsx=true ;;
    *.ts) has_ts=true ;;
    *) ;;
  esac
done < "$PATHS_FILE"

if [[ -f "$DIFF_FILE" ]]; then
  if grep -qE '\?\.(metadata|spec|status)\.' "$DIFF_FILE" 2>/dev/null; then
    has_metadata_chain=true
  fi
  if grep -qE '^diff --git a/dev/null b/(src/components/|src/[^/]+/components/)' "$DIFF_FILE" 2>/dev/null; then
    has_new_component=true
  fi
fi

[[ "$has_ts" == "true" || "$has_tsx" == "true" ]] && append_rule "$dev_f" ".agents/rules/typescript.md"
[[ "$has_tsx" == "true" ]] && append_rule "$dev_f" ".agents/rules/react-components.md"
[[ "$has_crds" == "true" || "$has_metadata_chain" == "true" ]] && append_rule "$dev_f" ".agents/rules/selectors.md"
[[ "$has_new_component" == "true" ]] && append_rule "$dev_f" ".agents/rules/workflows/new-component.md"

[[ "$has_ts" == "true" || "$has_tsx" == "true" ]] && append_rule "$qe_f" ".agents/rules/testing.md"
[[ "$has_playwright" == "true" ]] && append_rule "$qe_f" ".agents/rules/workflows/playwright-testing.md"

[[ "$has_locales" == "true" ]] && append_rule "$ux_f" ".agents/rules/i18n.md"
[[ "$has_scss" == "true" ]] && append_rule "$ux_f" ".agents/rules/styles.md"
append_rule "$ux_f" ".agents/rules/agents/forklift-ux-patterns.md"

[[ "$has_providers" == "true" ]] && append_rule "$arch_f" ".agents/rules/frontend/providers.md"
[[ "$has_plans" == "true" ]] && append_rule "$arch_f" ".agents/rules/frontend/plans.md"
[[ "$has_mappings" == "true" ]] && append_rule "$arch_f" ".agents/rules/frontend/mappings.md"
[[ "$has_overview" == "true" ]] && append_rule "$arch_f" ".agents/rules/frontend/overview.md"
[[ "$has_tsx" == "true" ]] && append_rule "$arch_f" ".agents/rules/frontend/shared-components.md"

to_json_array() {
  local f="$1"
  if [[ ! -f "$f" ]]; then
    echo "[]"
    return
  fi
  sort -u "$f" | jq -R . | jq -s .
}

jq -n \
  --argjson shared "$(to_json_array "$shared_f")" \
  --argjson Developer "$(to_json_array "$dev_f")" \
  --argjson QE "$(to_json_array "$qe_f")" \
  --argjson UX "$(to_json_array "$ux_f")" \
  --argjson Architect "$(to_json_array "$arch_f")" \
  --argjson Security "$(to_json_array "$sec_f")" \
  --argjson forklift "$(to_json_array "$fork_f")" \
  '{
    shared: $shared,
    by_perspective: {
      Developer: $Developer,
      QE: $QE,
      UX: $UX,
      Architect: $Architect,
      Security: $Security,
      "Forklift expert": $forklift
    }
  }' > "$MANIFEST"

rm -f "$shared_f" "$dev_f" "$qe_f" "$ux_f" "$arch_f" "$sec_f" "$fork_f"
echo "Rules manifest written to ${MANIFEST}"
