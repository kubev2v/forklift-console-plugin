<!-- FALLBACK REFERENCE: Use phases/quick-ref.md for normal flow.
     Read this file ONLY if a step fails or you need error recovery details. -->

# Phase 7: Implement



**Gate:** Auto-retry 3x on build/lint failure, interrupt only if stuck

Implements the approved design with mechanical verification. **Writes unit
tests here**; the human runs `npm test` in Phase 8.

---

## Prerequisites

- Design plan approved in Phase 6, OR fast-tracked from Phase 2/4
- State file has `design.planFile` and `design.approvedAt`, OR `skippedPhases`
  includes `design` (fast-track -- use investigation findings as guide)

## Rules to Follow

Load project-specific rules defined in `phases-rules/07-implement.md`.
If no phases-rules file exists, follow the project's `AGENTS.md` and any
applicable coding standards.

## Agent Personas

Use orchestrator-injected personas only:
- `clear` → Developer (+ QE when writing tests)
- `complicated` / `complex` → Developer + QE + Architect + UX + domain expert

See `phases-rules/07-implement.md` when present.

## Steps

### 0. Load project rules

**Before doing anything else in this phase**, check if the file
`.agents/skills/dev-helper/phases-rules/07-implement.md` exists. If it does,
read it now. It contains project-specific agent personas, coding standards,
and conventions that MUST be applied during this phase. Do not skip this step.


### 7.0 Branch safety check

Before any code changes, verify the git state is clean:

```bash
current=$(git branch --show-current)
expected=$(.agents/skills/dev-helper/scripts/state-cli.sh field ${TICKET_KEY} '.branch // empty')
if [[ -n "$expected" && "$expected" != "null" && "$current" != "$expected" ]]; then
  echo "WARNING: On branch $current but ticket expects $expected"
fi
```

If a branch already exists in state, checkout that branch instead of creating a new one.

### 7.1 Create branch

```bash
git checkout main
git pull upstream main
```

Determine branch name from ticket type:
- Bug: `bug/MTV-XXXX`
- Story/Feature: `feat/MTV-XXXX`

```bash
git checkout -b ${BRANCH_NAME}
```

Update state:
```bash
.agents/skills/dev-helper/scripts/state-cli.sh set ${TICKET_KEY} \
  --arg branch "${BRANCH_NAME}" '.branch = $branch'
```

### 7.2 Implement the plan

If a design plan exists (`state.design.planFile`), follow it.

If fast-tracked (`skippedPhases` includes `design`), use the investigation
findings from Phase 2 as the implementation guide. The root cause and affected
files are in the state file (`investigation.rootCause`, `investigation.affectedFiles`).

Use the plan's todo list if available. Mark each todo as in_progress / completed
as you work through them.

### 7.3 Verify build

```bash
npm run build
```

Zero errors required. If build fails, fix and retry (up to 3 attempts).

### 7.4 Verify lint

```bash
npm run lint
```

Zero errors in changed files required. Pre-existing lint errors in untouched
files are acceptable. If lint fails in changed files, fix and retry.

### 7.5 Extract i18n strings (if applicable)

If any translated strings were added or changed:

```bash
npm run i18n
```

Stage any locale file changes.

### 7.6 Auto-retry loop

If any verification step (7.3-7.5) fails:

1. Read the error output
2. Fix the errors
3. Re-run the failing check
4. Repeat until clean (max 3 attempts per check)

If still failing after 3 attempts, interrupt the user with the error details
and ask for guidance.

### 7.7 Re-evaluation check

During implementation, if you discover the root cause from Phase 2 was wrong
or the design approach doesn't work:

1. Check the re-evaluation count:
```bash
REEVAL_COUNT=$(.agents/skills/dev-helper/scripts/state-cli.sh field ${TICKET_KEY} '.reevaluation.count // 0')
```

2. If `REEVAL_COUNT < 2`: record the reason and loop back to investigate:
```bash
NEXT_COUNT=$((REEVAL_COUNT + 1))
.agents/skills/dev-helper/scripts/state-cli.sh set ${TICKET_KEY} \
  --argjson count "$NEXT_COUNT" \
  --arg reason "<why the root cause was wrong>" \
  --arg from "implement" \
  '.reevaluation = { count: $count, reason: $reason, from: $from }'

.agents/skills/dev-helper/scripts/state-cli.sh phase --force ${TICKET_KEY} investigate
```
Then read and follow `phases/02-investigate.md` with the new findings.

3. If `REEVAL_COUNT >= 2`: stop and ask the user. Two re-evaluation cycles
   have already failed — a human must decide whether to continue, re-scope,
   or abandon.

If the root cause is confirmed correct, proceed normally.

### 7.8 Write unit tests (do not own the test run)

Write or update unit tests for the change:

- `*.test.ts` / `*.test.tsx` in `__tests__/` adjacent to source
- Mock i18n with project helpers (e.g. `@test-utils/mockI18n`)
- Cover happy path, edge cases from investigation, and the bug scenario

**Do not** run a full `npm test` retry loop here. The orchestrator asks the
human to run tests in Phase 8. Optionally smoke a single focused path once
if helpful, then advance.

### 7.9 Advance phase

```bash
.agents/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} verify
```

Proceed to Phase 8: Verify (human runs tests).
See `phases/08-verify.md` and `phases/prompts/implement-verify.md`.

## Completion Checklist

Before advancing from this phase, `state-cli.sh phase` validates:

- [ ] `.branch` field set in state
- [ ] Unit test files written for the change (when applicable)
- [ ] Code compiles (`npm run build` passes)
- [ ] Lint passes (`npm run lint`)
- [ ] i18n extracted (`npm run i18n`)
