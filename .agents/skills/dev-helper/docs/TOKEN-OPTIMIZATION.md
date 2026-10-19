# Dev-Helper Token Optimization

How we reduced AI cost for the full Jira → merged PR workflow, and the principles
the team can reuse when designing Cursor skills and agent workflows.

**Goal:** bring monthly dev-helper spend from roughly **~$1,500** toward a **~$300**
budget without dropping quality gates (reproduce, design approval, learn, etc.).

---

## The problem

Running an entire ticket in **one long Cursor chat** is expensive for three
reasons:

### 1. Context snowballs on every turn

Each new message re-sends the full conversation history as input. By implement /
verify / monitor, the model is re-processing triage, investigation, design,
code diffs, test logs, and project rules **on every step**.

Rough rule of thumb: a **50-turn** monolithic session can cost on the order of
**~25× more input tokens** than the same work split into several short runs with
fresh context.

Typical “always loaded” overhead in our setup:

| Source | Approx. size |
|--------|----------------|
| `AGENTS.md` | ~23 KB |
| `.agents/rules/project-context.md` | ~9 KB |
| `SKILL.md` + phase docs | ~15–50 KB |
| Persona rule files (all five) | ~37 KB |

In a monolithic session, much of this is re-sent dozens of times.

### 2. Heavy phases burn tokens even when they do not need AI

The old flow treated these as fully agent-automated:

| Phase | Cost driver |
|-------|-------------|
| **Reproduce** | Playwright MCP loops (many tool calls, screenshots, navigation) |
| **Verify / E2E** | Agent runs `npm test` / Playwright with retry loops |
| **Learn** | Full PR diff + all artifacts re-read for rule updates |
| **Design (clear tickets)** | All five persona files loaded for obvious fixes |

Humans are faster and cheaper at clicking the UI and running local test commands.
The agent was paying model tokens for work that does not require reasoning.

### 3. One expensive model for everything

Using a strong model (e.g. Opus-class) for mechanical work — Jira field updates,
`send-pr.sh`, monitor loops — wastes money. Using a cheap model for hard design
or ambiguous investigation wastes time and causes rework.

---

## The solution (three pillars)

These three changes deliver most of the savings. Everything else stacks on top.

### 1. Subagent orchestrator (biggest win)

**Before:** One parent agent reads `SKILL.md`, full phase files (`01-triage.md` …
`12-track-jira-merged.md`), implements code, runs tests, and monitors PR — all in
one growing conversation.

**After:** The **parent is a thin orchestrator only**:

- Read ticket state (`state-cli.sh get`)
- Pick model (`resolve-model.sh`)
- Build a **focused prompt** from `phases/prompts/<phase>.md`
- Dispatch a **`Task` subagent** with **no parent history**
- Check gates, recap briefly, dispatch the next phase

Subagents get a **fresh context window** with only what that phase needs. When
they finish, their context is discarded. The parent stays small (tens of KB, not
hundreds).

```
You: "work on MTV-XXXX"
        │
        ▼
┌───────────────────┐
│ Parent orchestrator│  state, gates, recaps, human checklists
└─────────┬─────────┘
          │ Task (fresh context)
          ├─► triage + investigate subagent
          ├─► jira-track subagent
          ├─► design subagent
          ├─► implement subagent
          ├─► send-pr subagent
          └─► monitor / learn subagent
```

**Principles for the team:**

- **Separate orchestration from execution** — parent coordinates; subagents do
  one phase group.
- **Prompt templates, not encyclopedias** — `phases/prompts/` + `quick-ref.md`
  instead of re-reading multi-page phase files every time.
- **Artifacts in state, not in chat** — subagents write
  `.agents/skills/dev-helper/state/<TICKET>/` (`triage.md`, `investigation.md`,
  …); the parent reads summaries, not full dumps.
- **Scripts for mechanical steps** — `triage-claim.sh`, `jira-track-phase.sh`,
  `send-pr.sh`, `pr-monitor.sh` so the model does not reinvent git/Jira/gh steps.
- **Strict orchestrator rules** — parent must **not** edit product code, run
  `npm test`, or use Playwright MCP. See
  [orchestrator-brief.md](../phases/orchestrator-brief.md).

**Measured impact:** A session that followed this pattern (MTV-6297) used **6 Task
dispatches** and a ~44 KB parent transcript. A monolithic session on a similar
ticket (MTV-6336) used **0 Task dispatches** and a **76 KB** parent that did
everything inline — the regression we fixed by aligning dashboard + MCP entry
points with orchestrator mode.

---

### 2. Model routing (cheapest model that fits)

**Before:** One default model (often a mid-tier or strong model) for all phases.

**After:** Three tiers in `dev-helper.config.json`, resolved by
`scripts/resolve-model.sh`:

| Tier | Default slug | When |
|------|----------------|------|
| **default** | `composer-2.5` | Mechanical phases; `clear` creative work |
| **medium** | `cursor-grok-4.6-high` | `complicated` investigate / design / implement |
| **strong** | `claude-4.6-opus-max-thinking` | `complex` tickets only — **with user approval** |

| Phase type | Model rule |
|------------|------------|
| Mechanical: jira-track, send-pr, monitor-pr, learn, post-merge | always **default** |
| Creative: triage+investigate, design, implement, fix-tests | tier from ticket **complexity** (`clear` / `complicated` / `complex`) |

**Approval gate:** Opus is **never** dispatched without an explicit A/B/C/D choice
in chat (Opus / Grok / Composer / other). No silent escalation mid-ticket.

**Principles for the team:**

- **Start cheap; escalate with consent** — complexity from triage drives tier,
  not habit.
- **Mechanical work never needs a reasoning model** — scripts + Composer are enough.
- **Make routing deterministic** — shell script + config, not “the agent decides
  which model feels right.”

---

### 3. Human-in-the-loop (reproduce + test runs)

**Before:** Agent drives Playwright for reproduce; agent runs `npm test` in retry
loops until green.

**After:**

| Phase | Who does the work |
|-------|-------------------|
| **Reproduce** | Orchestrator prints a **checklist**; **human** navigates UI, screenshots under `~/Downloads/<TICKET>/` |
| **Verify** | Implement subagent **writes** tests; **human** runs `npm test` and pastes failures |
| **E2E** | Subagent **writes** Playwright tests; **human** runs upstream/downstream suite |

The agent only re-enters on **fix-tests** — a small subagent prompt with pasted
log output, not another full-session retry loop.

**Principles for the team:**

- **AI writes; human executes** when the step is execution-bound (browser, local
  test runner, cluster access).
- **Checklists over MCP loops** for reproduce — same quality gate, far fewer tokens.
- **Paste failures, don’t re-run** — parent waits for user output instead of
  burning tokens on repeated test runs.

---

## Additional optimizations (smaller but real)

### Persona routing

Load **only the agent rule files the ticket needs**:

| Complexity | Personas |
|------------|----------|
| `clear` | Developer + QE (~12 KB) |
| `complicated` / `complex` | Developer + QE + Architect + UX + Forklift Expert (~37 KB) |

The orchestrator injects an explicit path list into `{{PERSONAS}}` in subagent
prompts — never “read all personas” or load Security Reviewer by mistake.

**Why it helps:** Obvious bugs do not need Architect blast-radius and Forklift
Expert domain passes. Hard tickets still get full multi-perspective review.

### Lightweight learn (P11b)

Learn stays **mandatory** (never in `phases.skip`) but cost scales with complexity:

| Case | Behavior |
|------|----------|
| **clear + zero PR review comments** | Orchestrator sets `reviewed-skipped`; **no learn subagent** |
| **clear + has comments** | `learn-comments-only` — review comments JSON, not full PR diff |
| **complicated / complex** | Full learn subagent (diff + comments + artifacts) |

**Why it helps:** Most small PRs merge with no review feedback; skipping a full
diff review saves a large context load for no benefit.

### Output and context hygiene

- Subagents: **never** read `SKILL.md`, `SETUP.md`, `AGENTS.md` when the
  orchestrator already scoped the task.
- Orchestrator: **concise recaps**; full detail lives in state artifacts.
- Subagents: read `phases/quick-ref.md` **once** for their phase section only.

These rules overlap with good prompt discipline; we did **not** adopt a separate
“Caveman”-style skill because the marginal savings (~3–8%) did not justify another
layer of conventions.

---

## What we did not do (and why)

| Idea | Why we skipped it |
|------|-------------------|
| **Manual per-phase conversations** (user opens a new chat for each phase) | **`Task` subagents already isolate context** — same savings without manual handoffs. Resume via `state/` artifacts + `work-on-ticket` MCP. |
| **`discover-backend-prs.sh`** (automated Jira hierarchy traversal) | **Reliability risk** for nested Epic/Story/link shapes; marginal ~5% token savings vs agent reasoning with clear traversal rules in the investigate prompt. |
| **Caveman skill** (ultra-terse output enforcement) | **Overlaps existing output rules** in `SKILL.md`; estimated ~3–8% extra savings — not worth a second skill to maintain. |
| **Gitignore repo-root `state/`** as a safety net | **Wrong fix** — agents must write only to `.agents/skills/dev-helper/state/`. We fixed prompt paths instead of hiding mis-placed files. |
| **Removing gates** (reproduce, design, learn) | **Quality and process** — savings come from *how* work runs, not from skipping accountability. |

---

## Principles summary (for any Cursor workflow)

1. **Fresh context beats long context** — subagents or new chats; don’t grow one thread through 13 phases.
2. **Orchestrate, don’t monolith** — parent coordinates; workers do one job with minimal prompt surface.
3. **Right model, right phase** — cheap default; escalate only with complexity and user approval.
4. **Human runs; AI reasons** — browser repro and test execution stay with the developer.
5. **Persist outside the chat** — state files and scripts; chat holds decisions and summaries only.
6. **Load rules on demand** — persona and phase docs proportional to ticket complexity.
7. **Deterministic mechanics** — shell scripts for Jira/git/gh; models for judgment and code.

---

## Context tiers (L0 / L1 / L2)

Parent stays on **L0** (subagent summaries). Subagents use **L1** (`quick-ref`) and
write **L2** state artifacts. Parent Reads L2 only at gates (reproduce checklist,
design review, reevaluate). Full table: [CONTEXT-TIERS.md](CONTEXT-TIERS.md).

## Industry patterns we already match

| Pattern | Dev-helper |
|---------|------------|
| Cheap-model pipeline | `resolve-model.sh` — Composer → Grok → Opus with approval |
| Model router (not mid-chat switch) | Model chosen **per Task**; never upgrade parent mid-session |
| Handoffs vs switches | Task subagents = fresh context + tailored model |
| Context minimalism | Orchestrator + L0/L1/L2 + one ticket per session |
| Structured handovers | `state/<TICKET>/*.md` + subagent `summary:` |
| Avoid unnecessary MCPs | Human reproduce/verify; bash scripts for Jira/gh |

**Do not** change the parent chat’s model mid-session. Escalate via a new Task
with `resolve-model.sh` output.

## References in this repo

| Topic | Location |
|-------|----------|
| Context tiers | [CONTEXT-TIERS.md](CONTEXT-TIERS.md) |
| Gold eval | [GOLD-EVAL.md](GOLD-EVAL.md) |
| Lessons | [LESSONS.md](LESSONS.md) |
| Orchestrator rules | [phases/orchestrator-brief.md](../phases/orchestrator-brief.md) |
| Full orchestration loop | [SKILL.md](../SKILL.md) |
| Phase one-pager | [phases/quick-ref.md](../phases/quick-ref.md) |
| Subagent prompt templates | [phases/prompts/](../phases/prompts/) |
| Model resolution | [scripts/resolve-model.sh](../scripts/resolve-model.sh) |
| Repo PR lessons | [repo-pr-lessons/SKILL.md](../repo-pr-lessons/SKILL.md) |
| Config example | [examples/config.full.json](../examples/config.full.json) |

---

## Expected outcome

Combined, the three pillars (orchestrator + model routing + human-in-the-loop)
target **~60–80% cost reduction** depending on ticket mix. Clear, small tickets
benefit most from persona trimming and lightweight learn; complex tickets still
get Opus when approved, but only for the phases that need it.

If a session grows large with **zero `Task` dispatches**, the orchestrator was
bypassed — check dashboard / MCP entry points and
[orchestrator-brief.md](../phases/orchestrator-brief.md), not the model tier.
