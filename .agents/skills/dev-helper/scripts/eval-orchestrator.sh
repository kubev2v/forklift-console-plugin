#!/usr/bin/env bash
# Evaluate a Cursor agent transcript against frozen orchestrator gold rules.
# Usage: eval-orchestrator.sh <transcript.jsonl> [--profile strict|minimal] [--json]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GOLD_FILE="${SCRIPT_DIR}/../docs/gold-strict.json"

usage() {
  cat <<'USAGE'
Usage: eval-orchestrator.sh <transcript.jsonl> [--profile strict|minimal] [--json]

Pass/fail audit of orchestrator compliance (Task dispatches, no parent npm test,
no SKILL.md Read tool, no legacy phase file Reads). Exit 1 on any failed check.
USAGE
  exit 1
}

JSON_OUTPUT=false
PROFILE="strict"
TRANSCRIPT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --json) JSON_OUTPUT=true; shift ;;
    --profile) PROFILE="${2:?}"; shift 2 ;;
    -h|--help) usage ;;
    *)
      if [[ -z "$TRANSCRIPT" ]]; then
        TRANSCRIPT="$1"
        shift
      else
        echo "ERROR: Unexpected argument: $1" >&2
        usage
      fi
      ;;
  esac
done

[[ -n "$TRANSCRIPT" ]] || usage
[[ -f "$TRANSCRIPT" ]] || { echo "ERROR: File not found: $TRANSCRIPT" >&2; exit 1; }
[[ -f "$GOLD_FILE" ]] || { echo "ERROR: Missing gold config: $GOLD_FILE" >&2; exit 1; }

count_rg() {
  local pattern="$1"
  local n
  n=$(rg -c "$pattern" "$TRANSCRIPT" 2>/dev/null || true)
  [[ -z "$n" ]] && n=0
  echo "$n"
}

task_dispatches=$(count_rg '"name"\s*:\s*"Task"')
if [[ "$task_dispatches" -eq 0 ]]; then
  # Older / alternate Task encoding
  task_dispatches=$(count_rg '"toolName"\s*:\s*"Task"')
fi

# Parent Shell running npm test / npm run test (tool input), not prose mentions
parent_npm_test=$(count_rg '"command"\s*:\s*"[^"]*npm (test|run test)')

# Playwright MCP tool names in tool_use blocks
playwright_mcp=$(count_rg '"name"\s*:\s*"browser_[a-z_]+"')

# Read tool targeting SKILL.md (JSONL parse — ignore skill attachment preamble)
skill_reads=$(python3 - "$TRANSCRIPT" <<'PY' 2>/dev/null || echo 0
import json, sys
n = 0
with open(sys.argv[1], encoding="utf-8", errors="replace") as f:
    for line in f:
        try:
            obj = json.loads(line)
        except Exception:
            continue
        content = (obj.get("message") or {}).get("content")
        if not isinstance(content, list):
            continue
        for block in content:
            if not isinstance(block, dict):
                continue
            if block.get("type") != "tool_use" or block.get("name") != "Read":
                continue
            path = (block.get("input") or {}).get("path") or ""
            if "dev-helper/SKILL.md" in path:
                n += 1
print(n)
PY
)
[[ -z "$skill_reads" ]] && skill_reads=0
skill_reads=$(echo "$skill_reads" | tr -d '[:space:]')
[[ -z "$skill_reads" ]] && skill_reads=0

# Read of numbered phase files (01-triage.md etc.) — not quick-ref or prompts/
legacy_phase=$(count_rg '"path"\s*:\s*"[^"]*phases/0[0-9]-[^"]+\.md"')

# Write to repo-root state/MTV- (missing .agents/skills/dev-helper/)
repo_root_state=$(rg -c '"path"\s*:\s*"(state/MTV-|/[^"]+/Workspace/[^"]+/state/MTV-)' "$TRANSCRIPT" 2>/dev/null || true)
[[ -z "$repo_root_state" ]] && repo_root_state=0
# Exclude correct skill state path
correct_writes=$(count_rg '"path"\s*:\s*"[^"]*\.agents/skills/dev-helper/state/MTV-')
# If all writes are under skill path, zero the false signal
if [[ "$repo_root_state" -gt 0 && "$correct_writes" -ge "$repo_root_state" ]]; then
  # Prefer counting only paths that are NOT under .agents/skills/dev-helper
  repo_root_state=$(rg -c '"path"\s*:\s*"state/MTV-' "$TRANSCRIPT" 2>/dev/null || true)
  [[ -z "$repo_root_state" ]] && repo_root_state=0
fi

min_tasks=$(jq -r --arg p "$PROFILE" '
  if $p == "minimal" then .minimal.minTaskDispatches else .minTaskDispatches end
' "$GOLD_FILE")
max_npm=$(jq -r --arg p "$PROFILE" '
  if $p == "minimal" then .minimal.maxParentNpmTest else .maxParentNpmTest end
' "$GOLD_FILE")
max_skill=$(jq -r '.maxSkillMdReads // 0' "$GOLD_FILE")
max_legacy=$(jq -r '.maxLegacyPhaseReads // 0' "$GOLD_FILE")
max_pw=$(jq -r '.maxPlaywrightMcp // 0' "$GOLD_FILE")
max_root=$(jq -r '.maxRepoRootStateWrites // 0' "$GOLD_FILE")

pass_tasks=false
pass_npm=false
pass_skill=true
pass_legacy=true
pass_pw=true
pass_root=true

[[ "$task_dispatches" -ge "$min_tasks" ]] && pass_tasks=true
[[ "$parent_npm_test" -le "$max_npm" ]] && pass_npm=true

if [[ "$PROFILE" == "strict" ]]; then
  [[ "$skill_reads" -le "$max_skill" ]] && pass_skill=true || pass_skill=false
  [[ "$legacy_phase" -le "$max_legacy" ]] && pass_legacy=true || pass_legacy=false
  [[ "$playwright_mcp" -le "$max_pw" ]] && pass_pw=true || pass_pw=false
  [[ "$repo_root_state" -le "$max_root" ]] && pass_root=true || pass_root=false
fi

overall=true
for flag in "$pass_tasks" "$pass_npm" "$pass_skill" "$pass_legacy" "$pass_pw" "$pass_root"; do
  [[ "$flag" == "true" ]] || overall=false
done

status_word() {
  if [[ "$1" == "true" ]]; then echo PASS; else echo FAIL; fi
}

if [[ "$JSON_OUTPUT" == "true" ]]; then
  jq -n \
    --arg profile "$PROFILE" \
    --argjson overall "$overall" \
    --argjson taskDispatches "$task_dispatches" \
    --argjson minTasks "$min_tasks" \
    --argjson passTasks "$pass_tasks" \
    --argjson parentNpmTest "$parent_npm_test" \
    --argjson maxNpm "$max_npm" \
    --argjson passNpm "$pass_npm" \
    --argjson skillReads "$skill_reads" \
    --argjson passSkill "$pass_skill" \
    --argjson legacyPhaseReads "$legacy_phase" \
    --argjson passLegacy "$pass_legacy" \
    --argjson playwrightMcp "$playwright_mcp" \
    --argjson passPlaywright "$pass_pw" \
    --argjson repoRootStateWrites "$repo_root_state" \
    --argjson passRepoRoot "$pass_root" \
    '{profile: $profile, overall: $overall,
      checks: {
        taskDispatches: {value: $taskDispatches, min: $minTasks, pass: $passTasks},
        parentNpmTest: {value: $parentNpmTest, max: $maxNpm, pass: $passNpm},
        skillMdReads: {value: $skillReads, pass: $passSkill},
        legacyPhaseReads: {value: $legacyPhaseReads, pass: $passLegacy},
        playwrightMcp: {value: $playwrightMcp, pass: $passPlaywright},
        repoRootStateWrites: {value: $repoRootStateWrites, pass: $passRepoRoot}
      }}'
else
  echo "Profile: ${PROFILE}"
  echo "Transcript: ${TRANSCRIPT}"
  echo "---"
  echo "[$(status_word "$pass_tasks")] Task dispatches: ${task_dispatches} (min ${min_tasks})"
  echo "[$(status_word "$pass_npm")] Parent npm test (Shell): ${parent_npm_test} (max ${max_npm})"
  if [[ "$PROFILE" == "strict" ]]; then
    echo "[$(status_word "$pass_skill")] SKILL.md Read tool: ${skill_reads} (max ${max_skill})"
    echo "[$(status_word "$pass_legacy")] Legacy phase file Reads: ${legacy_phase} (max ${max_legacy})"
    echo "[$(status_word "$pass_pw")] Playwright MCP tools: ${playwright_mcp} (max ${max_pw})"
    echo "[$(status_word "$pass_root")] Repo-root state/ Writes: ${repo_root_state} (max ${max_root})"
  fi
  echo "---"
  if [[ "$overall" == "true" ]]; then
    echo "OVERALL: PASS"
  else
    echo "OVERALL: FAIL"
    echo "See docs/GOLD-EVAL.md for remediation."
  fi
fi

[[ "$overall" == "true" ]]
