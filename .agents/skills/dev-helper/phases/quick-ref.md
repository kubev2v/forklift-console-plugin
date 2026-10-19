<!-- Read this file ONCE at session start (orchestrator or subagent).
     Do NOT re-read on subsequent messages. Prefer phases/prompts/ for dispatch. -->

# Dev-Helper Quick Reference — All 13 Phases

## Orchestrator note

Parent agent dispatches subagents via Task tool with fresh context. Human-owned:
**reproduce**, and **running** unit/E2E tests after the implement subagent writes
them. See SKILL.md for model routing, persona routing, and lightweight learn.

Default persona paths (project may override via phases-rules):

- Developer: `.agents/rules/agents/developer.md`
- QE: `.agents/rules/agents/qe-agent.md`
- Architect: `.agents/rules/agents/architect.md`
- UX: `.agents/rules/agents/ux-reviewer.md` (+ `.agents/rules/agents/forklift-ux-patterns.md` for layout)
- Forklift Expert: `.agents/rules/agents/forklift-expert.md`

Persona routing: `clear` → Developer + QE; `complicated`/`complex` → all five.

**Artifact paths (mandatory):** Write/read only under
`.agents/skills/dev-helper/state/${TICKET_KEY}/` — never repo-root `state/`.

**Context tiers:** Parent recaps from L0 only; Read L2 only at gates
(reproduce / design review / reevaluate). See `docs/CONTEXT-TIERS.md`.

**Session discipline:** One MTV ticket per parent session. Escalate via Task
handoff + `resolve-model.sh` — never switch parent model mid-chat.

---

## P1: Triage
**Purpose:** Validate ticket, claim it, classify complexity.
**Run:** `scripts/triage-claim.sh ${TICKET_KEY}` → fetch, set component, Bug→ASSIGNED, init state.

**Agent:** Evaluate clarity (problem/expected/actual/area/env). Check repro signal. Verify UI ownership. Search duplicates (JQL). Check backend deps (`gh pr view <PR#> --repo $GH_BACKEND_REPO`). Assess scope. Epic: no branch/PR — suggest child Story.

**Classify:** `clear` (solution obvious: typo, null check, enum, CSS, add field, new provider via checklist) · `complicated` (need investigation: status logic, validation gap, perf regression) · `complex` (shape unknown: new CRD UX, redesign flow, evolving API). Work size: `small`(1-3 files) / `medium`(4-10) / `large`(10+). Default: `complicated`/`medium`.

**State:** `.type`, `.complexity`, `.workSize`. **Write:** `.agents/skills/dev-helper/state/${TICKET_KEY}/triage.md`
**Advance:** Valid→`phase investigate` · Needs info→`wait awaiting-info` · Wrong team/dup/invalid→**gate: user confirm**→`phase done`

---

## P2: Investigate
`[clear: lightweight]` — confirm fix location only, skip blast radius, only check ticket's own `customfield_10875` for backend PRs.
**Purpose:** Root cause, affected files, backend PRs.

**Agent:** Fetch ticket + comments + attachments. **Prior lessons:** `scripts/lessons-grep.sh` with 2–4 keywords; note hits under **Prior lessons** in investigation.md (do not dump full lesson files). Discover backend PRs: `customfield_10875` → `issuelinks` → `parent` → children JQL → recurse child Epics (max 3 levels). `gh pr diff <PR#> --repo kubev2v/forklift`. Search UI codebase. Blast radius: Architect + `.agents/rules/frontend/` when personas include Architect. Domain: Forklift Expert when listed. Gaps → `ask-more-info`.

**State:** `.investigation.findings`, `.rootCause`, `.affectedFiles`, `.backendPRs`, `.completedAt`
**Write:** `.agents/skills/dev-helper/state/${TICKET_KEY}/investigation.md`
**Advance:** Bug→`phase reproduce` (ALWAYS) · Non-bug+UI→`phase reproduce` · Non-bug no UI→`phase jira-track`

---

## P3: Ask More Info
**Purpose:** Optional — post Jira comment requesting missing info, enter waiting.
**Run:** Post comment via Jira REST. `state-cli.sh wait ${TICKET_KEY} awaiting-info`
**Resume:** `state-cli.sh resume` → back to `phase investigate`

---

## P4: Reproduce (HUMAN checklist)
**HARD CONSTRAINT:** Mandatory for bugs — never skippable. If cluster unavailable, document blocker and ASK user.

**Purpose:** Visual evidence. **Orchestrator emits a step checklist; user executes
browser + screenshots.** No Playwright MCP automation by default.

**Orchestrator:**
1. Read investigation.md; build checklist from [phases/prompts/reproduce.md](prompts/reproduce.md).
2. Include: console URL, click path, expected vs actual, save screenshots to
   `~/Downloads/${TICKET_KEY}/` with `repro-` prefix (see `.agents/rules/taking-screenshots.md`
   if present / phases-rules/04-reproduce.md).
3. Wait for user: `reproduced` | `not reproduced` | `blocked` (+ notes/errors).
4. Write `reproduction.md`; update `.reproduce.*`; advance `jira-track`.

**Optional:** User may still ask the agent to drive Playwright MCP; treat as
exceptional override, not the default path.

**Write:** `.agents/skills/dev-helper/state/${TICKET_KEY}/reproduction.md` (+ optional `reproduction-script.ts`)
**Advance:** `phase jira-track`

---

## P5: Jira Track
**Purpose:** Set points, sprint, fix version. NO status transitions.
**Run:** `scripts/jira-track-phase.sh ${TICKET_KEY}` → one GET, batch set. Agent only provides `--points` if overriding auto-map (small=2, medium=5, large=8). Points: 2(XS)/5(S)/8(M)/13(L)/21(XL). Note parent Epic (Story only — informational).
**Advance:** Design skipped AND not gated→`phase implement` · Otherwise→`phase design`

---

## P6: Design
`[clear: skip if design not in phases.gates]` — auto-skip with note in skippedPhases.
**Purpose:** Multi-perspective design plan with user approval.

**Personas (orchestrator injects):**
- `clear` → Developer + QE only
- `complicated` / `complex` → Developer + QE + Architect + UX + Forklift Expert

**Agent:** Switch to **Plan mode**. Apply only injected personas. Architect blast
radius for new entity/provider (when Architect listed). Check `@forklift-ui/types`
gaps. `CreatePlan` template: Problem, Approach, **Structural layout** (UI
impact — `phases-rules/06-design-solution.md`), Alternatives, Scope, Test Plan,
Risks. Optional `layout-plan.md` for complicated/complex UI surfaces.
**HARD CONSTRAINT:** If alternatives unresolved → STOP, ask user.
If gated: A) Approve / B) Revise / C) Reject — wait for explicit choice.
**Write:** `.agents/skills/dev-helper/state/${TICKET_KEY}/design.md` (only after approval)
**Post-design:** Switch to **Agent mode** → `phase implement`

---

## P7: Implement
**Purpose:** Code changes on feature branch; write unit tests (do not own test runs).

**Agent:** Branch safety (check `.branch`, checkout if exists). Create: `bug/MTV-XXXX` or `feat/MTV-XXXX` from `upstream/main`. Rely on Cursor glob auto-loading. Follow design plan (or investigation if fast-tracked). Apply injected personas (Developer primary).
**Verify:** `npm run build` (zero errors) → `npm run lint` (zero in changed files) → `npm run i18n` (stage locales). Auto-retry build/lint up to 3x. After 3 fails → interrupt user.
**Tests:** **Write** unit tests in `__tests__/`. Do **not** run the full verify retry loop — orchestrator asks the human to run `npm test`.
**Re-evaluation:** Root cause wrong? `.reevaluation.count` < 2 → `phase --force investigate`. ≥ 2 → stop, ask user.
**Advance:** `phase verify`

---

## P8: Verify (HUMAN runs unit tests)
**Purpose:** Confirm unit tests pass.

**Split:**
1. Implement subagent already wrote tests (P7).
2. **Orchestrator** tells user: run `npm test` (or scoped jest path) and paste output.
3. Pass → advance (UI→`e2e-test`, logic-only→`send-pr`).
4. Fail → dispatch fix subagent with pasted log only (`implement-verify` mode
   `fix-tests`); then human re-runs.

Do not burn tokens on automated 3x test retry loops inside one long context.

**Advance:** UI changed→`phase e2e-test` · Logic-only→`phase send-pr`

---

## P9: E2E Test (write AI / run HUMAN)
**Purpose:** Playwright E2E for UI changes. Skip if no cluster or no UI change.

**Split:**
1. Subagent **writes**/updates tests under `testing/playwright/e2e/upstream/`
   (and downstream if appropriate).
2. **Human runs:** `cd testing && npm run test:upstream` / `test:downstream`.
3. Failures → paste log → fix subagent → human re-runs.

**Advance:** `phase send-pr`

---

## P10: Send PR
**Purpose:** Stage, commit, create PR, update Jira — atomically via script.
**Agent:** Pre-check: ONLY `npm run validate-commits` (lint/build/i18n done in P7). Rebase: `git fetch upstream main && git rebase upstream/main`. Stage ONLY fix files (not state/rule files), commit with `-s` (DCO). Write PR body to `/tmp/pr-body-${TICKET_KEY}.md` using:

```markdown
## 📝 Links

- [${TICKET_KEY}](${JIRA_BASE_URL}/browse/${TICKET_KEY})

## 📝 Description

[One-sentence summary of the change.]

- [Key change 1]
- [Key change 2]

## 🎥 Demo

<!-- Screenshot or video of the fix -->

## Test plan

- [ ] [Test step 1]
- [ ] [Test step 2]
```

(`JIRA_BASE_URL` from `dev-helper.config.json` → `.jira.baseUrl`)

**Title:** `Resolves: ${TICKET_KEY} | short description`
**Run:** `scripts/send-pr.sh ${TICKET_KEY} --title "Resolves: ${TICKET_KEY} | short description" --body-file /tmp/pr-body-${TICKET_KEY}.md`
→ push, PR create, state, Jira (Bug→POST, Story→In Progress + parent Epic), PR link, Ready flag, phase→monitor-pr, wait.
**HARD CONSTRAINT:** Do NOT run sub-steps manually. Re-run script on failure.
**Advance:** handled by script → `phase monitor-pr`

---

## P11: Monitor PR
**Purpose:** Handle CI, reviews, rebase, learn, merge in priority order.
**Run:** `scripts/pr-monitor.sh ${PR_NUMBER} ${TICKET_KEY}` → read ACTION line and execute:

- `rebase` → `git rebase upstream/main`, force-push, wait for CI. **NEVER auto-resolve conflicts** — abort + alert user.
- `fix-ci` → If our code: fix, commit `-s`, push. If flaky: `/retest` (max 3). If SonarCloud (`FLAG: SONAR_ISSUES`): run `scripts/sonar-pr-issues.sh ${PR_NUMBER}` (from dev-helper), fix listed issues, push, wait. See `11-monitor-pr.md` §11.4 SonarCloud.
- `reply-to-comments` → Reply to EVERY comment individually: `gh api repos/${GH_REPO}/pulls/${PR_NUMBER}/comments -X POST -f body="..." -F in_reply_to=<ID>`. Fix, push, wait.
- `learn` → Review PR diff + reviewer comments, propose rule updates.
- `merge` → Verify ALL 6 criteria (CI passing, approved, no conflicts, up to date, no unresolved threads, learn done) → `gh pr merge --squash --delete-branch`
- `none` → Mark waiting, inform user.

**HARD CONSTRAINTS:** Never merge without all 6 criteria. Never skip learn. After rebase/force-push, re-verify ALL on new HEAD.
**Advance:** Merged+learn done→`phase track-jira-merged` · Merged+learn missing→`phase learn`

---

## P11b: Learn
`[clear: lightweight]` — comments-only or skip.
**Purpose:** Review ticket lifecycle, capture learnings as rule updates and/or lesson entries.
**HARD:** Never in `phases.skip`.

**Orchestrator pre-check (clear tickets):**
1. Count PR review comments via gh api.
2. **0 comments** → `.learn.status = "reviewed-skipped"`; advance `track-jira-merged`
   (**no subagent**).
3. **Has comments** → dispatch learn with **comments only** (no full diff unless a
   comment requires a specific file).

**Standard (complicated/complex):** Read PR diff, review comments, investigation.md, design.md. Determine if rules need updating.

**Before appending a lesson:** `scripts/lessons-grep.sh` for theme keywords — skip duplicates; surface conflicts to the user. Prefer rule PRs for team-wide truth; keep lesson bullets minimal (see `docs/LESSONS.md`).

**Rule targets:** CRD/resource→`.agents/rules/project-context.md` · Provider/status→`.agents/rules/project-context.md`+`.agents/rules/agents/forklift-expert.md` · Utility/hook→`AGENTS.md` · Convention→`AGENTS.md` · Test/mock→`.agents/rules/workflows/playwright-testing.md` · i18n/PF/component→`.agents/rules/frontend/*` · Security→`.agents/rules/backend/**` or `AGENTS.md`

**Lesson themes:** Architecture→`lessons/architecture.md` · Implementation→`lessons/implementation.md` · UI patterns→`lessons/ui-patterns.md` · Process→`lessons/process.md` · Security→`lessons/security.md` · Communication→`lessons/communication.md`

**Batch catch-up:** For merged PRs across the repo (not just this ticket), use
`repo-pr-lessons` skill — complements P11b when learn was skipped after manual merge.

**If learnings:** Branch `chore/learn-${TICKET_KEY}` from `upstream/main`, update rules, append lessons, commit `-s`, create PR. `.learn.status = "learned"`.
**If none:** `.learn.status = "reviewed-skipped"`.
**Advance:** `phase track-jira-merged`

---

## P12: Track Jira (Post-Merge)
**Purpose:** Final Jira updates after merge.
**Run:** `scripts/post-merge.sh ${TICKET_KEY}` → status (Bug→MODIFIED, Story→Done), QA contact, activity type, release note type, parent Epic Done check, summary generation.
**Agent:** Only write release note text. Bug: activity=Quality/Stability/Reliability, note=Bug Fix. Story: activity=Product/Portfolio Work, note=Enhancement/Feature. Epic→Done only when ALL children Done (JQL).
**Write:** `.agents/skills/dev-helper/state/${TICKET_KEY}/summary.md`
**Advance:** `state-cli.sh phase ${TICKET_KEY} done`
