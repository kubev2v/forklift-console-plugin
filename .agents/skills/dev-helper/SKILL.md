---
name: dev-helper
description: >-
  Full ticket lifecycle automation from Jira to merged PR. Handles investigation,
  solution design, implementation, testing, PR creation, CI monitoring, and
  post-merge Jira tracking. Use when the user mentions work on a ticket, start
  MTV-XXXX, dev helper, ticket lifecycle, full workflow, provides a Jira URL,
  or work on next.
---

## Codex client adapter

When this skill runs in Codex, read [references/codex-adapter.md](references/codex-adapter.md) before the first phase. It maps client-specific operations while preserving this clone’s phases, rules, configuration, scripts, lessons, and dashboard sources.

# Dev Helper -- Lightweight Subagent Orchestrator

Orchestrates the ticket lifecycle by dispatching **phase-specific subagents**
with fresh context windows. The parent agent stays thin: resolve ticket, read
state, pick model, build a focused prompt, dispatch, check gates, advance.

**Strict rules:** [phases/orchestrator-brief.md](phases/orchestrator-brief.md) — also returned by `work-on-ticket` MCP as `orchestratorInstructions`.

---

## Strict Rules (non-negotiable)

The parent agent **acts as orchestrator only**. This is not optional and not an error path — it is how every ticket runs.

| Phase work | Who |
|------------|-----|
| triage, investigate, jira-track, design, implement, send-pr, monitor, learn, post-merge | **Task subagent** + `phases/prompts/` + `resolve-model.sh` |
| reproduce | **Human** checklist (parent prints; no Task, no Playwright MCP) |
| verify, e2e-test run | **Human** runs `npm test` / Playwright; parent waits for output |
| state init, claim, send-pr, monitor scripts | **Subagent or script** — never parent inline |

**Parent MUST NOT:** edit `src/` or tests, run `npm test`, use Playwright MCP, read full `phases/01-*.md` files, skip gates, `gh pr create` manually, change the parent model mid-session, or run more than one MTV ticket in this session.

**Parent MUST:** call `work-on-ticket` MCP (or follow dashboard prompt), read `orchestratorInstructions`, dispatch Task per phase, apply persona routing, get Opus approval when `needsApproval`, recap from L0 summaries only.

Dashboard and MCP both route here — if you started from the dashboard button, you still follow this table.

- Setup / config / state CLI: [SETUP.md](SETUP.md)
- **PR monitor only (no ticket lifecycle):** [skills/pr-monitor/SKILL.md](skills/pr-monitor/SKILL.md) → phase [11-monitor-pr.md](phases/11-monitor-pr.md)
- First-time install: [SETUP.md](SETUP.md)
- Constants / field IDs: [reference.md](reference.md)
- Phase details (fallback only): [phases/quick-ref.md](phases/quick-ref.md)
- Subagent prompt templates: [phases/prompts/](phases/prompts/)
- Context tiers: [docs/CONTEXT-TIERS.md](docs/CONTEXT-TIERS.md)

---

## Context Tiers (L0 / L1 / L2)

| Tier | Source | Parent use |
|------|--------|------------|
| **L0** | Subagent `summary:` | **Default** for every recap |
| **L1** | `quick-ref.md` phase section | When building a Task prompt |
| **L2** | `state/<TICKET>/*.md` | **Only** at gates (reproduce, design review, reevaluate) |

Do **not** Read L2 between phases. Escalate hard work via a new Task + `resolve-model.sh` — never switch the parent chat model mid-session. One MTV ticket per parent session.

---

## Output Rules

**ELIMINATE:** tool-call narration, phase-transition announcements, script
output echoing, pleasantries, confirming obvious successes.

**CONCISE:** phase recaps, design rationale, errors, status updates.

**FULL DETAIL:** questions to the user; human checklists (reproduce / tests).

Subagents write full artifacts (`triage.md`, `investigation.md`, etc.). The
orchestrator only summarizes what the user needs.

---

## Orchestration Loop

### 1. Resolve ticket

- Named ticket (`MTV-XXXX`) → use it.
- **"work on next"** with no key → ask for a specific ticket.

### 2. Load state + config

```bash
.agents/skills/dev-helper/scripts/state-cli.sh get MTV-XXXX
# source config for gates/skip/models:
source .agents/skills/dev-helper/scripts/_config.sh
jq -r '.phases // {}' .agents/skills/dev-helper/dev-helper.config.json
```

- **No state** → `state-cli.sh init MTV-XXXX <type>` → phase `triage`
- **`learn` / `track-jira-merged`** → dispatch immediately (no gate)
- **`done`** → report summary and stop

### 3. Skip / gate check

- Phase in `phases.skip` → advance (`learn` is NEVER skippable)
- Phase in `phases.gates` → after subagent completes, STOP for user approval
- Otherwise → auto-recap and continue to next dispatch

### 4. Dispatch current phase

| Phase | How | Prompt template |
|-------|-----|-----------------|
| `triage` | Subagent → continues into investigate | [triage-investigate.md](phases/prompts/triage-investigate.md) |
| `investigate` | Subagent (or already covered by triage group) | same |
| `ask-more-info` | Orchestrator posts Jira comment + `wait` | (inline) |
| `reproduce` | **HUMAN checklist** (no subagent) | [reproduce.md](phases/prompts/reproduce.md) |
| `jira-track` | Subagent (script-heavy) | [jira-track.md](phases/prompts/jira-track.md) |
| `design` | Subagent (persona-routed) | [design.md](phases/prompts/design.md) |
| `implement` | Subagent → writes code + unit tests | [implement-verify.md](phases/prompts/implement-verify.md) |
| `verify` | **HUMAN runs tests**; subagent only if failures pasted | [implement-verify.md](phases/prompts/implement-verify.md) |
| `e2e-test` | Subagent writes E2E if needed; **HUMAN runs** | [implement-verify.md](phases/prompts/implement-verify.md) |
| `send-pr` | Subagent | [send-pr.md](phases/prompts/send-pr.md) |
| `monitor-pr` | Subagent | [monitor-pr-learn.md](phases/prompts/monitor-pr-learn.md) |
| `learn` | Subagent (or skip for clear+no comments) | [monitor-pr-learn.md](phases/prompts/monitor-pr-learn.md) |
| `track-jira-merged` | Subagent | [post-merge.md](phases/prompts/post-merge.md) |

### 5. Build subagent prompt

1. Read the prompt template for the phase group.
2. Inject: `TICKET_KEY`, complexity, workSize, type, paths to state artifacts.
3. Inject **persona list** (see Persona Routing).
4. Prepend to every subagent prompt (all phases):
   `CRITICAL: Do NOT read SKILL.md, SETUP.md, reference.md, or AGENTS.md.`
5. Tell the subagent: read `phases/quick-ref.md` once for its phase(s) only;
   write artifacts; advance state with `state-cli.sh`; return a short bullet
   summary (findings / next phase / blockers).

### 6. Select model

Read `phases.models` from config. Resolve with:

```bash
.agents/skills/dev-helper/scripts/resolve-model.sh <phase> <complexity> --json
```

Also read `.complexity` from state (`state-cli.sh field MTV-XXXX '.complexity // "clear"'`).

**Default config:**

```json
"models": {
  "default": "composer-2.5",
  "medium": "cursor-grok-4.6-high",
  "strong": "claude-4.6-opus-max-thinking"
}
```

**Tier policy (cheapest first):**

| Tier | Slug | When |
|------|------|------|
| **default** | `composer-2.5` | All mechanical phases; `clear` creative phases |
| **medium** | `cursor-grok-4.6-high` | `complicated` creative phases |
| **strong** | `claude-4.6-opus-max-thinking` | `complex` design / implement / investigate |

| Phase group | Model rule |
|-------------|------------|
| Mechanical: jira-track, send-pr, monitor-pr, learn, post-merge | always `default` |
| Creative: triage+investigate, design, implement, verify fix-tests | tier from `.complexity` |

**Approval gate (HARD):**

- **Opus (`strong`)** — NEVER dispatch without explicit user approval in this
  chat. Stop and ask:
  ```
  Subagent model for <phase> (complexity=complex):
  Recommended: claude-4.6-opus-max-thinking — big feature / hard design or implement
  A) Approve Opus
  B) Use Grok (medium)
  C) Stay on Composer (cheapest)
  D) Other slug (you specify)
  ```
- After approval, store in state:
  ```bash
  state-cli.sh set MTV-XXXX \
    --arg phase design --arg model claude-4.6-opus-max-thinking \
    '.models.approved[$phase] = $model'
  ```
- Reuse stored approval for the same ticket+phase in this session unless the
  user overrides.

**Escalation mid-ticket:** If a subagent fails or you want a stronger model
on a `clear`/`complicated` ticket, STOP and ask the same A/B/C/D menu — do
not auto-upgrade to Grok or Opus.

**Composer + Grok** on `clear` / `complicated` dispatch automatically (no gate).
Always mention the chosen model in the phase recap: `model=<slug> tier=<tier>`.

If a slug is unavailable in Cursor, fall back to `composer-2.5` and note it.

### 7. Launch Task

```
Task:
  subagent_type: generalPurpose
  model: <selected>
  run_in_background: false
  description: "<phase> MTV-XXXX"
  prompt: <built prompt>
```

Do **not** pass parent conversation history. Subagents start fresh.

### 8. After subagent returns

1. Re-read state (`state-cli.sh get`).
2. Present a short recap from the subagent **L0** `summary:` — do **not** Read
   L2 artifacts unless a gate below applies.
3. If current phase is gated → ask A) Approve / B) Revise / C) Reject; wait
   (may Read `design.md` for the user’s review).
4. Else if next phase is human (`reproduce`, or verify/e2e awaiting run) → emit
   the human checklist and wait (reproduce may Read `investigation.md` once).
5. Else dispatch the next phase (or stop if waiting / done).

---

## Persona Routing

When building design / implement / verify prompts:

| Complexity | Personas to load |
|------------|------------------|
| `clear` | Developer + QE only |
| `complicated` / `complex` | Developer + QE + Architect + UX + Forklift Expert |

Paths come from `phases-rules/` (project) or prompt template defaults.
Instruct the subagent to Read only the listed persona files.

**Orchestrator must replace `{{PERSONAS}}` with a copy-paste block** (never
“read all personas”, never “read 5 persona files”, never omit paths). Subagents
must not substitute other agent files (e.g. Security Reviewer ≠ Architect).

**`clear` — paste into `{{PERSONAS}}`:**
```
- `.agents/rules/agents/developer.md`
- `.agents/rules/agents/qe-agent.md`
```

**`complicated` / `complex` — paste into `{{PERSONAS}}`:**
```
- `.agents/rules/agents/developer.md`
- `.agents/rules/agents/qe-agent.md`
- `.agents/rules/agents/ux-reviewer.md`
- `.agents/rules/agents/architect.md`
- `.agents/rules/agents/forklift-expert.md`
```

Return summary must list **exactly** these paths — no additions, no substitutions.

**Design phase (UI impact):** Subagent must still read
`.agents/rules/agents/ux-reviewer.md` and
`.agents/rules/agents/forklift-ux-patterns.md` for the **Structural layout** section when
`phases-rules/06-design-solution.md` applies — even on `clear` tickets.

---

## Human Phases (orchestrator-owned)

### Reproduce (`reproduce`)

1. **Once** Read L2 `.agents/skills/dev-helper/state/${TICKET}/investigation.md`
   (and `triage.md` only if needed for URLs/steps) — allowed gate for checklist.
2. Follow [phases/prompts/reproduce.md](phases/prompts/reproduce.md).
3. Output a numbered checklist (URLs, clicks, expected vs actual, screenshot
   paths under `~/Downloads/${TICKET}/repro-*.png`).
4. Wait for: `reproduced` / `not reproduced` + optional errors/notes.
5. Write `.agents/skills/dev-helper/state/${TICKET}/reproduction.md`, update state, advance to `jira-track`.
6. Bugs: NEVER skip. If blocked, ask the user — do not auto-advance.

### Verify / E2E (after implement subagent)

1. Implement subagent writes tests; does **not** run the full retry loop.
2. Orchestrator tells the user exactly which commands to run (`npm test`,
   upstream/downstream E2E if applicable).
3. **Wait** for the user to paste pass/fail output — do **not** run tests
   yourself unless the user explicitly asks you to.
4. On failure → dispatch a small fix subagent with the pasted log only.
5. On pass → advance (`e2e-test` or `send-pr` per quick-ref).

---

## Lightweight Learn

Before dispatching `learn`:

1. Read `.complexity` and PR number from state.
2. If complexity is `clear`:
   ```bash
   gh api repos/${GH_REPO}/pulls/${PR_NUMBER}/comments --jq 'length'
   ```
   - **0 comments** → set `.learn.status = "reviewed-skipped"`, advance to
     `track-jira-merged` (no subagent).
   - **Has comments** → dispatch learn subagent with **comments only** (no full
     PR diff / no investigation+design unless needed).
3. If `complicated` / `complex` → full learn subagent per quick-ref.

---

## Fast-track Rules

| Certainty | Design | Investigation |
|-----------|--------|---------------|
| `clear` | Skippable if not gated | Minimal |
| `complicated` | Per config (default gated) | Full |
| `complex` | Always mandatory | Full + Architect |

Bugs always require reproduce (human checklist). Fast-track never skips
reproduce or jira-track. Gated phases need user approval.

---

## Waiting / Branch Safety

Mark waiting: `state-cli.sh wait MTV-XXXX <reason>`. Suggest another ticket.

Before implement/send-pr: verify git branch matches state `.branch`.

Re-evaluation: implement/verify root-cause wrong → `--force investigate`
(max 2 cycles).

---

## Phase Routing Table

| Phase | Description |
|-------|-------------|
| `triage` | Validate, claim, classify |
| `investigate` | Root cause, blast radius |
| `ask-more-info` | External wait |
| `reproduce` | Human visual evidence |
| `jira-track` | Sprint / points / fix version |
| `design` | Multi-perspective plan |
| `implement` | Code + write unit tests |
| `verify` | Human runs unit tests |
| `e2e-test` | Write E2E; human runs |
| `send-pr` | Push + PR + Jira link |
| `monitor-pr` | CI / reviews / merge |
| `learn` | Capture learnings |
| `track-jira-merged` | Post-merge Jira |
| `done` | Complete |
