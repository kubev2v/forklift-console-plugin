# Dev-Helper Orchestrator Brief (parent agent only)

When `work-on-ticket` MCP or the dashboard starts a ticket, follow this.
**You are the thin parent.** Subagents do phase work.

See also: [docs/CONTEXT-TIERS.md](../docs/CONTEXT-TIERS.md).

## Mandatory — parent MUST NOT

- Implement or edit product source files (`src/`, `testing/`, etc.)
- Run `npm test`, `npm run build`, or Playwright MCP in the parent
- Read `phases/01-*.md` … `12-*.md` full files (use `quick-ref.md` + `phases/prompts/` only)
- Read `SKILL.md` via Read tool when skill is already attached
- Skip reproduce, design gate, jira-track, or send-pr script
- Use `gh pr create` / manual git commit for send-pr (use `send-pr.sh` via subagent)
- Fast-track (“move straight to fix”) without user approval
- Change the **parent** chat model mid-session (escalate via Task + `resolve-model.sh`)
- Work more than **one** MTV ticket in this parent session

## Mandatory — parent MUST

1. `state-cli.sh get <TICKET>` + `jq '.phases'` from config
2. `resolve-model.sh <phase> <complexity> --json` before each Task dispatch
3. **Task subagent** for: triage+investigate, jira-track, design, implement, send-pr, monitor-pr, learn, post-merge
4. **Human checklist** for `reproduce` (no Task, no Playwright MCP)
5. **Human runs tests** for verify/e2e — parent waits for pasted output; fix via Task `fix-tests` only
6. **Persona routing** in subagent prompts (clear → Dev+QE; complicated/complex → all five)
7. **Opus approval** before dispatch when `needsApproval: true`
8. Recap from subagent **L0** `summary:` only — do not Read L2 artifacts between phases

## Context tiers (parent)

| Tier | Use |
|------|-----|
| **L0** | Subagent return `summary:` — **default for all recaps** |
| **L1** | `quick-ref.md` phase section when building a dispatch |
| **L2** | `state/<TICKET>/*.md` — Read **only** at gates below |

**MAY Read L2:** reproduce checklist (`investigation.md` ± `triage.md`); design gate (`design.md`); user revise/reevaluate (relevant file).

**MUST NOT Read L2:** between-phase recaps; after jira-track; before verify.

## Phase → action

| Phase | Parent action |
|-------|----------------|
| triage / investigate | Task → `phases/prompts/triage-investigate.md` |
| reproduce | Read L2 **once** for checklist; print from `phases/prompts/reproduce.md`; wait for user |
| jira-track | Task → `phases/prompts/jira-track.md` |
| design | Task → `phases/prompts/design.md`; gate for approval (may Read `design.md` — include **Structural layout**; optional `layout-plan.md`) |
| implement | Task → `phases/prompts/implement-verify.md` mode=implement |
| verify | Ask user to run `npm test`; paste failures → Task fix-tests |
| e2e-test | Task write-e2e; user runs Playwright |
| send-pr | Task → `phases/prompts/send-pr.md` |
| monitor-pr / learn / post-merge | Task → matching prompt template |

Parent recaps between phases from L0 only. Subagents write artifacts under
`.agents/skills/dev-helper/state/<TICKET>/` — **never** repo-root `state/`.
