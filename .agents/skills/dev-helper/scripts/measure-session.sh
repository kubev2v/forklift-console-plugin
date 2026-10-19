#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: measure-session.sh <transcript.jsonl> [--json]

Analyzes a dev-helper agent transcript and outputs metrics.
Use --json for machine-readable output.

Useful for gold-eval debugging and large/complex sessions — not daily cost tracking
(use the Cursor dashboard for quota).

Batch mode:
  measure-session.sh --batch <dir> [--json]
  Scans all dev-helper transcripts in <dir> and outputs aggregate stats.
USAGE
  exit 1
}

JSON_OUTPUT=false
BATCH_MODE=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --json) JSON_OUTPUT=true; shift ;;
    --batch) BATCH_MODE=true; shift; BATCH_DIR="${1:?Missing directory}"; shift ;;
    -h|--help) usage ;;
    *) TRANSCRIPT="$1"; shift ;;
  esac
done

count_rg() {
  local pattern="$1"
  local file="$2"
  local n
  n=$(rg -c "$pattern" "$file" 2>/dev/null || true)
  [[ -z "$n" ]] && n=0
  echo "$n"
}

analyze_transcript() {
  local file="$1"
  local uuid
  uuid=$(basename "$file" .jsonl)

  [[ -f "$file" ]] || { echo "ERROR: File not found: $file" >&2; return 1; }

  local size_bytes size_human lines
  size_bytes=$(wc -c < "$file" | tr -d ' ')
  size_human=$(du -h "$file" | cut -f1 | tr -d ' ')
  lines=$(wc -l < "$file" | tr -d ' ')

  local skill_reads phase_reads rule_reads shell_calls jira_calls
  local task_dispatches parent_npm_test legacy_phase_reads
  skill_reads=$(count_rg 'dev-helper/SKILL\.md' "$file")
  phase_reads=$(count_rg 'phases/[0-9]' "$file")
  rule_reads=$(count_rg '\.agents/rules/' "$file")
  shell_calls=$(count_rg '"Shell"' "$file")
  jira_calls=$(count_rg 'atlassian\.net' "$file")
  task_dispatches=$(count_rg '"name":"Task"' "$file")
  if [[ "$task_dispatches" -eq 0 ]]; then
    task_dispatches=$(count_rg '"subagent_type"' "$file")
  fi
  parent_npm_test=$(count_rg 'npm (test|run test)' "$file")
  legacy_phase_reads=$(count_rg 'phases/0[0-9]-' "$file")

  local tickets phases
  tickets=$(rg -o 'MTV-[0-9]{4,}' "$file" 2>/dev/null | sort -u | tr '\n' ' ' | sed 's/ $//' || true)
  phases=$(rg -o 'state-cli\.sh phase[^"\\]*MTV-[0-9]+ [a-z-]+' "$file" 2>/dev/null \
    | rg -o '[a-z-]+$' | awk '!seen[$0]++' | tr '\n' ' → ' | sed 's/ → $//' || true)

  if [[ "$JSON_OUTPUT" == "true" ]]; then
    jq -n \
      --arg uuid "$uuid" \
      --arg size "$size_human" \
      --argjson sizeBytes "$size_bytes" \
      --argjson lines "$lines" \
      --argjson skillReads "$skill_reads" \
      --argjson phaseReads "$phase_reads" \
      --argjson ruleReads "$rule_reads" \
      --argjson shellCalls "$shell_calls" \
      --argjson jiraCalls "$jira_calls" \
      --argjson taskDispatches "$task_dispatches" \
      --argjson parentNpmTest "$parent_npm_test" \
      --argjson legacyPhaseReads "$legacy_phase_reads" \
      --arg tickets "$tickets" \
      --arg phases "$phases" \
      '{session: $uuid, size: $size, sizeBytes: $sizeBytes, lines: $lines,
        skillReads: $skillReads, phaseReads: $phaseReads, ruleReads: $ruleReads,
        shellCalls: $shellCalls, jiraCalls: $jiraCalls,
        taskDispatches: $taskDispatches, parentNpmTest: $parentNpmTest,
        legacyPhaseReads: $legacyPhaseReads,
        tickets: $tickets, phases: $phases}'
  else
    echo "Session: ${uuid}"
    echo "Ticket: ${tickets:-none}"
    echo "Size: ${size_human} (${size_bytes} bytes)"
    echo "Lines: ${lines}"
    echo "Task dispatches: ${task_dispatches}"
    echo "Parent npm test hits: ${parent_npm_test}"
    echo "SKILL.md reads: ${skill_reads}"
    echo "Phase file reads: ${phase_reads}"
    echo "Legacy phase reads: ${legacy_phase_reads}"
    echo "Rule file reads: ${rule_reads}"
    echo "Shell calls: ${shell_calls}"
    echo "Jira API calls: ${jira_calls}"
    echo "Phases: ${phases:-none}"
    echo "---"
  fi
}

if [[ "$BATCH_MODE" == "true" ]]; then
  [[ -d "$BATCH_DIR" ]] || { echo "ERROR: Not a directory: $BATCH_DIR" >&2; exit 1; }

  results=()
  count=0
  total_size=0
  total_skill=0
  total_phase=0
  total_rule=0
  total_shell=0
  total_jira=0
  total_tasks=0
  total_npm=0

  for dir in "$BATCH_DIR"/*/; do
    uuid=$(basename "$dir")
    f="${dir}${uuid}.jsonl"
    [[ -f "$f" ]] || continue
    rg -q 'dev-helper/SKILL\.md\|"name":"Task"\|dev-helper' "$f" 2>/dev/null || continue

    if [[ "$JSON_OUTPUT" == "true" ]]; then
      result=$(analyze_transcript "$f")
      results+=("$result")
    else
      analyze_transcript "$f"
    fi

    size_bytes=$(wc -c < "$f" | tr -d ' ')
    total_size=$((total_size + size_bytes))
    total_skill=$((total_skill + $(count_rg 'dev-helper/SKILL\.md' "$f")))
    total_phase=$((total_phase + $(count_rg 'phases/[0-9]' "$f")))
    total_rule=$((total_rule + $(count_rg '\.agents/rules/' "$f")))
    total_shell=$((total_shell + $(count_rg '"Shell"' "$f")))
    total_jira=$((total_jira + $(count_rg 'atlassian\.net' "$f")))
    td=$(count_rg '"name":"Task"' "$f")
    [[ "$td" -eq 0 ]] && td=$(count_rg '"subagent_type"' "$f")
    total_tasks=$((total_tasks + td))
    total_npm=$((total_npm + $(count_rg 'npm (test|run test)' "$f")))
    count=$((count + 1))
  done

  if [[ "$JSON_OUTPUT" == "true" ]]; then
    printf '%s\n' "${results[@]}" | jq -s --argjson count "$count" \
      --argjson totalSize "$total_size" \
      --argjson totalSkill "$total_skill" \
      --argjson totalPhase "$total_phase" \
      --argjson totalRule "$total_rule" \
      --argjson totalShell "$total_shell" \
      --argjson totalJira "$total_jira" \
      --argjson totalTasks "$total_tasks" \
      --argjson totalNpm "$total_npm" \
      '{summary: {sessions: $count, totalSizeBytes: $totalSize,
        avgSkillReads: (if $count > 0 then ($totalSkill / $count | . * 10 | round / 10) else 0 end),
        avgPhaseReads: (if $count > 0 then ($totalPhase / $count | . * 10 | round / 10) else 0 end),
        avgRuleReads: (if $count > 0 then ($totalRule / $count | . * 10 | round / 10) else 0 end),
        avgShellCalls: (if $count > 0 then ($totalShell / $count | . * 10 | round / 10) else 0 end),
        avgJiraCalls: (if $count > 0 then ($totalJira / $count | . * 10 | round / 10) else 0 end),
        avgTaskDispatches: (if $count > 0 then ($totalTasks / $count | . * 10 | round / 10) else 0 end),
        avgParentNpmTest: (if $count > 0 then ($totalNpm / $count | . * 10 | round / 10) else 0 end)},
       sessions: .}'
  else
    echo "=== BASELINE SUMMARY ==="
    echo "Sessions analyzed: ${count}"
    echo "Total size: $((total_size / 1024)) KB"
    if [[ "$count" -gt 0 ]]; then
      echo "Avg Task dispatches: $((total_tasks / count))"
      echo "Avg parent npm test: $((total_npm / count))"
      echo "Avg SKILL.md reads: $((total_skill / count))"
      echo "Avg phase file reads: $((total_phase / count))"
      echo "Avg rule file reads: $((total_rule / count))"
      echo "Avg shell calls: $((total_shell / count))"
      echo "Avg Jira API calls: $((total_jira / count))"
    fi
  fi
else
  [[ -n "${TRANSCRIPT:-}" ]] || usage
  analyze_transcript "$TRANSCRIPT"
fi
