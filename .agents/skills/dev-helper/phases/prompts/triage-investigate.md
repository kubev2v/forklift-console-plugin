# Subagent prompt: Triage + Investigate

Orchestrator fills `{{TICKET_KEY}}`, `{{TYPE}}` (if known), then dispatches.

---

You are a **dev-helper phase worker**. Complete **triage** then **investigate**
for `{{TICKET_KEY}}`. Fresh context only — do not assume prior chat history.

## Token rules (mandatory)

- **NEVER read** `SKILL.md`, `SETUP.md`, `reference.md`, or `AGENTS.md`.
- Read only this prompt, `phases/quick-ref.md` (P1 + P2), and phase-rules if listed.

## Rules

- Read `.agents/skills/dev-helper/phases/quick-ref.md` ONCE (P1 + P2 sections).
- Do NOT read other phase full files unless stuck (then use
  `phases/01-triage.md` / `phases/02-investigate.md` as fallback).
- If `phases-rules/01-triage.md` or `02-investigate.md` exist, read them.
- Output: terse bullets. Write full detail into artifact files.
- Use scripts under `.agents/skills/dev-helper/scripts/` for mechanical work.

## Triage

1. Run `scripts/triage-claim.sh {{TICKET_KEY}}` (fetch, component, Bug→ASSIGNED).
2. If no state: `scripts/state-cli.sh init {{TICKET_KEY}} <type>`.
3. Evaluate clarity; classify complexity (`clear` / `complicated` / `complex`)
   and workSize (`small` / `medium` / `large`).
4. Search duplicates; verify UI ownership; note backend deps lightly.
5. Write `.agents/skills/dev-helper/state/{{TICKET_KEY}}/triage.md`.
6. Set state fields: `.type`, `.complexity`, `.workSize`.
7. Advance: valid → `investigate`; needs info → `ask-more-info` + wait;
   invalid/dup → stop and report for user gate.

## Investigate

1. Fetch ticket + comments + attachments (analyze images/logs/YAML).
2. Derive 2–4 keywords from the ticket summary (component, provider, feature).
   Run `scripts/lessons-grep.sh "<keywords>"`. If hits: note under **Prior lessons**
   in investigation.md (L1 — do not load full lesson files into chat).
3. Discover backend PRs via Jira hierarchy (customfield_10875, links, parent,
   children; max 3 levels). Use `gh pr view/diff` on backend repo from config.
4. Search UI codebase; for non-clear tickets run blast radius (Architect if
   personas include it — see PERSONAS below).
5. Write `.agents/skills/dev-helper/state/{{TICKET_KEY}}/investigation.md`.
   Download attachments to `.agents/skills/dev-helper/state/{{TICKET_KEY}}/attachments/` if needed.
6. Set `.investigation.findings`, `.rootCause`, `.affectedFiles`, `.backendPRs`,
   `.completedAt`.
7. Advance: Bug → `reproduce`; Story with UI → `reproduce`; else → `jira-track`.

## PERSONAS

{{PERSONAS}}

## Return to orchestrator

```
summary:
- complexity / workSize
- root cause (1-2 lines)
- affected files (paths)
- next phase
- blockers (if any)
```
