# Phase 7: Implement

**Gate:** Auto-retry 3x on build/lint failure, interrupt only if stuck

Implements the approved design with mechanical verification. Code changes only --
testing is a separate phase.

---

## Prerequisites

- Design plan approved in Phase 6, OR fast-tracked from Phase 2/4
- State file has `design.planFile` and `design.approvedAt`, OR `skippedPhases`
  includes `design` (fast-track -- use investigation findings as guide)

## Rules to Follow

Load and follow these rules during implementation:

- `AGENTS.md` -- Project coding standards (always applied)
- `.cursor/rules/i18n.mdc` -- Translation patterns
- `.cursor/rules/react-components.mdc` -- PatternFly and Console SDK patterns
- `.cursor/rules/styles.mdc` -- SCSS guidelines
- `.cursor/rules/typescript.mdc` -- TypeScript guidelines
- `.cursor/rules/workflows/new-component.mdc` -- If creating new components

## Agent Personas

Apply these perspectives during implementation:

- **Developer** (`.cursor/rules/agents/developer.mdc`): Code quality, patterns, architecture
- **UX** (`.cursor/rules/agents/ux-reviewer.mdc`): Loading/error/empty states, accessibility

## Steps

### 7.0 Branch safety check

Before any code changes, verify the git state is clean:

```bash
current=$(git branch --show-current)
expected=$(.cursor/skills/dev-helper/scripts/state-cli.sh field ${TICKET_KEY} '.branch // empty')
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
.cursor/skills/dev-helper/scripts/state-cli.sh set ${TICKET_KEY} \
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
REEVAL_COUNT=$(.cursor/skills/dev-helper/scripts/state-cli.sh field ${TICKET_KEY} '.reevaluation.count // 0')
```

2. If `REEVAL_COUNT < 2`: record the reason and loop back to investigate:
```bash
NEXT_COUNT=$((REEVAL_COUNT + 1))
.cursor/skills/dev-helper/scripts/state-cli.sh set ${TICKET_KEY} \
  --argjson count "$NEXT_COUNT" \
  --arg reason "<why the root cause was wrong>" \
  --arg from "implement" \
  '.reevaluation = { count: $count, reason: $reason, from: $from }'

.cursor/skills/dev-helper/scripts/state-cli.sh phase --force ${TICKET_KEY} investigate
```
Then read and follow `phases/02-investigate.md` with the new findings.

3. If `REEVAL_COUNT >= 2`: stop and ask the user. Two re-evaluation cycles
   have already failed — a human must decide whether to continue, re-scope,
   or abandon.

If the root cause is confirmed correct, proceed normally.

### 7.8 Advance phase

```bash
.cursor/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} verify
```

Proceed to Phase 8: Verify.
Read and follow `phases/08-verify.md`.

## Completion Checklist

Before advancing from this phase, `state-cli.sh phase` validates:

- [ ] `.branch` field set in state
- [ ] Code compiles (`npm run build` passes)
- [ ] Lint passes (`npm run lint`)
- [ ] i18n extracted (`npm run i18n`)
