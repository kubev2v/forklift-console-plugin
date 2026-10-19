# Context Tiers (L0 / L1 / L2)

Dev-helper uses **tiered context** so the parent orchestrator stays thin and
subagents load only what their phase needs. Same idea as gradual RAG detail
levels — implemented with files and summaries, not a vector store.

| Tier | Source | Typical size | Who uses it |
|------|--------|--------------|-------------|
| **L0** | Subagent `summary:` return block | ~5–15 lines | Parent orchestrator (**default**) |
| **L1** | One phase section in [phases/quick-ref.md](../phases/quick-ref.md) | ~0.5–2 KB | Subagents; parent only when building a dispatch |
| **L2** | [state/\<TICKET\>/\*.md](../) under `.agents/skills/dev-helper/state/` | 2–20 KB each | Subagents for their phase; parent **only at gates** |

## Parent default (L0)

After each Task subagent returns:

1. Recap from the subagent `summary:` only.
2. Do **not** Read L2 artifacts just to restate what the subagent already said.
3. Advance or wait for a human gate.

## When the parent MAY Read L2

| Trigger | Files allowed |
|---------|----------------|
| Reproduce checklist | `investigation.md` (+ `triage.md` if needed for URLs/steps) |
| Design gate (user reviewing) | `design.md` only |
| User asks to revise / reevaluate | Relevant artifact for that phase |
| Learn orchestrator pre-check | None (subagent owns L2) |

## When the parent MUST NOT Read L2

- Between phases for recap
- After jira-track
- Before verify (wait for human test output)
- After implement (use L0 summary + human commands)

## Subagents

- Read L1 (`quick-ref.md` section for their phase) once.
- Write L2 artifacts under `.agents/skills/dev-helper/state/<TICKET>/`.
- Return L0 `summary:` to the parent.

See also: [TOKEN-OPTIMIZATION.md](TOKEN-OPTIMIZATION.md), [orchestrator-brief.md](../phases/orchestrator-brief.md).
