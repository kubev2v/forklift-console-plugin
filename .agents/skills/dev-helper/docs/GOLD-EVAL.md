# Gold Eval — Orchestrator Regression Checks

Frozen pass/fail contract for **subagent orchestrator** compliance. Run after a
dev-helper session (or after skill / dashboard / MCP changes). This is a
**manual audit** of a finished transcript — it does not run during a ticket.

## When to run

- After pulling a new `dev-helper` skill revision
- After rebuilding the dashboard extension / MCP `work-on-ticket` responses
- After a suspicious large parent transcript (few or zero `Task` dispatches)
- Optional: after a **large/complex** ticket — pair with `measure-session.sh`

Daily quota monitoring stays in the **Cursor dashboard**; this script does not
estimate dollar cost.

## Profiles

| Profile | Rules |
|---------|--------|
| **strict** (default) | ≥4 `Task` dispatches; 0 parent `npm test`; 0 `SKILL.md` Read; 0 legacy `phases/01-*.md` routing; 0 Playwright MCP; 0 repo-root `state/MTV-` writes |
| **minimal** | ≥1 `Task`; 0 parent `npm test` |

Thresholds: [gold-strict.json](gold-strict.json).

## Frozen reference pattern

**Task-dispatch reference (MTV-6297 `e693c205-…`):** ≥4–6 `Task` dispatches;
human reproduce checklist; no Playwright MCP. May still FAIL strict overall if
the parent ran `npm test` (human-verify regression) or wrote repo-root `state/`
(path bug, since fixed). Use it to confirm **Task** detection.

**Monolith anti-pattern (MTV-6336 `f65ca76c-…`):** 0 `Task` dispatches; parent
runs `npm test` inline — must **FAIL** strict and minimal Task check.

**Ideal strict PASS:** Task handoffs + human verify (parent Shell never runs
`npm test`) + artifacts only under `.agents/skills/dev-helper/state/`.

Example UUID paths live under your local Cursor project
`agent-transcripts/` — do not commit transcripts to the skill repo.

## How to run

```bash
# Strict (default)
.agents/skills/dev-helper/scripts/eval-orchestrator.sh \
  ~/.cursor/projects/<project>/agent-transcripts/<uuid>/<uuid>.jsonl \
  --profile strict

# Minimal smoke
.agents/skills/dev-helper/scripts/eval-orchestrator.sh \
  path/to/transcript.jsonl --profile minimal

# JSON for tooling
.agents/skills/dev-helper/scripts/eval-orchestrator.sh \
  path/to/transcript.jsonl --profile strict --json
```

Exit code **0** = PASS, **1** = FAIL.

## Optional metrics (large sessions)

```bash
.agents/skills/dev-helper/scripts/measure-session.sh path/to/transcript.jsonl
```

Reports size, Task dispatches, parent npm test hits, SKILL/phase/rule reads.
Use for heavy tickets — not as a daily cost dashboard.

## On FAIL

1. Check [phases/orchestrator-brief.md](../phases/orchestrator-brief.md)
2. Check MCP `orchestratorInstructions` in `dashboard/src/mcp/tools.ts` /
   `dashboard/src/orchestratorPrompt.ts`
3. Confirm the chat attached the **dev-helper** skill and called `work-on-ticket`
4. Re-run a short ticket through triage and re-eval

## Related

- [CONTEXT-TIERS.md](CONTEXT-TIERS.md)
- [TOKEN-OPTIMIZATION.md](TOKEN-OPTIMIZATION.md)
