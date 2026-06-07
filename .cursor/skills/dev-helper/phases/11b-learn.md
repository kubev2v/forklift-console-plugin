# Phase 11b: Learn

**Gate:** Hard constraint -- cannot be skipped or bypassed

Reviews the work done on the ticket/PR and captures any learnings as
rule/documentation updates. This phase runs after the PR is merged (or after
the pre-merge learn sub-step in Phase 11 was missed).

**HARD CONSTRAINT:** This phase cannot be added to `phases.skip`. The review
of whether learnings are needed is mandatory for every ticket. It can only be
resolved as `learned` (learnings committed) or `reviewed-skipped` (reviewed,
nothing to capture).

---

## Prerequisites

- PR merged (detected by Phase 11, reconcile, or manual merge)
- State file has `prUrl` and `prNumber`
- State phase is `learn`

## When This Phase Runs

This phase is entered when:
1. Phase 11 Priority 1 detects a merged PR and `learn.status` is `none`/missing
2. Phase 11 Priority 6 auto-merges and `learn.status` is `none`/missing
3. `reconcile.sh` detects a merged PR and `learn.status` is `none`/missing
4. The agent is explicitly asked to run learning for a completed ticket

---

## Steps

### 11b.1 Review the work (mandatory)

Gather all context from the ticket lifecycle. Every item below MUST be
reviewed before making a learn/skip decision:

```bash
STATE_CLI=".cursor/skills/dev-helper/scripts/state-cli.sh"
TICKET_KEY="<ticket>"
PR_NUMBER=$($STATE_CLI field ${TICKET_KEY} '.prNumber')
PR_URL=$($STATE_CLI field ${TICKET_KEY} '.prUrl')

source .cursor/skills/dev-helper/scripts/_config.sh
```

1. **Read the PR diff** (what changed):
```bash
gh pr diff ${PR_NUMBER} --repo $GH_REPO
```

2. **Read review comments** (what reviewers taught):
```bash
gh api repos/${GH_REPO}/pulls/${PR_NUMBER}/comments \
  | jq '.[] | {user: .user.login, body: .body, path: .path}'

gh api repos/${GH_REPO}/pulls/${PR_NUMBER}/reviews \
  | jq '.[] | {user: .author.login, state: .state, body: .body}'
```

3. **Read investigation artifacts** (if they exist):
```bash
STATE_DIR=".cursor/skills/dev-helper/state/${TICKET_KEY}"
cat "${STATE_DIR}/investigation.md" 2>/dev/null || echo "(no investigation artifact)"
cat "${STATE_DIR}/design.md" 2>/dev/null || echo "(no design artifact)"
```

4. **Read the PR description**:
```bash
gh pr view ${PR_NUMBER} --repo $GH_REPO --json body --jq '.body'
```

### 11b.2 Determine if learnings exist

After reviewing all the above, evaluate whether any insights warrant
updates. There are two output channels:

**Channel 1: Project rule updates** (update `.cursor/rules/`, `AGENTS.md`)

These are project-specific changes — new CRDs, conventions, patterns.

**Channel 2: Themed lesson entries** (append to `lessons/*.md`)

These are transferable patterns — what we learned that applies beyond
this one ticket. Each entry uses the format:

```
- [Theme] Pattern observed -> What to do differently -> Why it matters (MTV-XXXX, YYYY-MM-DD)
```

**Routing table** — for each learning, determine both the rule target and
the lesson theme:

| Category | Rule update target | Lesson theme file |
|----------|-------------------|-------------------|
| New CRD or resource type | `.cursor/rules/project-context.mdc` | `lessons/architecture.md` |
| New provider type or status | `.cursor/rules/project-context.mdc`, `agents/forklift-expert.mdc` | `lessons/architecture.md` |
| New shared utility or hook | `AGENTS.md` | `lessons/implementation.md` |
| New convention or anti-pattern | `AGENTS.md` | `lessons/implementation.md` |
| New test pattern or mock | `.cursor/rules/workflows/playwright-testing.mdc` | `lessons/implementation.md` |
| New i18n pattern | `.cursor/rules/frontend/*` | `lessons/ui-patterns.md` |
| PatternFly / component pattern | `.cursor/rules/frontend/*` | `lessons/ui-patterns.md` |
| Skill/workflow improvement | `.cursor/skills/dev-helper/**` | `lessons/process.md` |
| PR review / CI behavior insight | — | `lessons/process.md` |
| Security or trust boundary | `.cursor/rules/backend/**` or `AGENTS.md` | `lessons/security.md` |
| Backend API insight | `.cursor/rules/backend/**` | `lessons/architecture.md` |
| PR description / commit style | — | `lessons/communication.md` |

A learning may produce a rule update, a lesson entry, or both. Some
learnings (process patterns, communication insights) produce only a
lesson entry with no rule file change.

**HARD CONSTRAINT:** Lesson entries must NOT contain verbatim code,
business logic, data models, or ticket-specific implementation details.
Lessons are generic, transferable patterns.

**Superseding:** If a new lesson contradicts an existing entry in the
same theme file, move the old entry to the `## Superseded` section with
a `[Superseded by MTV-XXXX]` tag.

### 11b.3 Act on determination

#### 11b.3a Learnings exist -- create a learning PR

When learnings are identified:

1. **Create a branch from upstream main:**
```bash
git fetch upstream main
git checkout -b chore/learn-${TICKET_KEY} upstream/main
```

2. **Make the rule/doc updates** (edit the relevant `.cursor/rules/` or
   `AGENTS.md` files per the routing table).

3. **Append lesson entries** to the appropriate themed files in
   `.cursor/skills/dev-helper/lessons/`. Each entry follows the format:
```
- [Theme] Pattern observed -> What to do differently -> Why it matters (MTV-XXXX, YYYY-MM-DD)
```

4. **Commit and push:**
```bash
git add <changed-rule-files> .cursor/skills/dev-helper/lessons/
git commit -s -m "chore: update rules with learnings from ${TICKET_KEY}

Resolves: None"
git push origin chore/learn-${TICKET_KEY}
```

4. **Open a PR:**
```bash
gh pr create --repo $GH_REPO \
  --title "chore: learnings from ${TICKET_KEY}" \
  --body "$(cat <<EOF
## Summary

Rule/documentation updates based on learnings from ${TICKET_KEY} (PR #${PR_NUMBER}).

## Changes

<list what was updated and why>

## Context

Original ticket: ${TICKET_KEY}
Original PR: #${PR_NUMBER}
EOF
)"
```

5. **Update state:**
```bash
LEARN_PR_NUMBER=$(gh pr view --repo $GH_REPO --json number --jq '.number')

$STATE_CLI set ${TICKET_KEY} \
  ".learn.status = \"learned\" | .learn.committedAt = (now | todate) | .learn.prNumber = ${LEARN_PR_NUMBER}"
```

6. **Advance to next phase:**
```bash
$STATE_CLI phase ${TICKET_KEY} track-jira-merged
```

#### 11b.3b No learnings needed -- mark as reviewed-skipped

When the review is complete and no rule/doc updates are warranted:

1. **Update state** (the `reviewed-skipped` value signals that review happened):
```bash
$STATE_CLI set ${TICKET_KEY} \
  '.learn.status = "reviewed-skipped" | .learn.reviewedAt = (now | todate)'
```

2. **Advance to next phase:**
```bash
$STATE_CLI phase ${TICKET_KEY} track-jira-merged
```

---

## Backward Compatibility

State files with `learn.status = "skipped"` (old value from earlier versions)
are no longer accepted by `validate_transition()`. If you encounter an old
state file with this value, update it manually using:

```bash
.cursor/skills/dev-helper/scripts/state-cli.sh set MTV-XXXX '.learn.status = "reviewed-skipped"'
```

Or use `--force` to advance past the validation.

## Completion Checklist

Before advancing from this phase, `state-cli.sh phase` validates:

- [ ] `.learn.status` is `learned` or `reviewed-skipped`
- [ ] PR diff was reviewed (step 11b.1)
- [ ] Review comments were reviewed (step 11b.1)
- [ ] If learnings exist: learning PR created and `.learn.prNumber` set
- [ ] If no learnings: `.learn.reviewedAt` timestamp set
