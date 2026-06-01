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

After reviewing all the above, evaluate whether any of these warrant
rule or documentation updates:

| Category | Update target | Example |
|----------|--------------|---------|
| New CRD or resource type | `.cursor/rules/project-context.mdc` | New Conversion CRD added |
| New provider type or status | `.cursor/rules/project-context.mdc`, `agents/forklift-expert.mdc` | New provider phase |
| New shared utility or hook | `AGENTS.md` | New `useMyHook` pattern |
| New convention or anti-pattern | `AGENTS.md` | Discovered footgun to document |
| New test pattern or mock | `.cursor/rules/workflows/playwright-testing.mdc` | New page object pattern |
| New i18n pattern | `.cursor/rules/frontend/*` | Translation edge case |
| Skill/workflow improvement | `.cursor/skills/dev-helper/**` | Workflow gap discovered |
| Backend insight | `.cursor/rules/backend/**` | API behavior clarification |

### 11b.3 Act on determination

#### 11b.3a Learnings exist -- create a learning PR

When learnings are identified:

1. **Create a branch from upstream main:**
```bash
git fetch upstream main
git checkout -b chore/learn-${TICKET_KEY} upstream/main
```

2. **Make the rule/doc updates** (edit the relevant files).

3. **Commit and push:**
```bash
git add <changed-rule-files>
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

State files with `learn.status = "skipped"` (old value) are treated as
`reviewed-skipped` for routing purposes. The old value should not be written
by new code.

## Completion Checklist

Before advancing from this phase, `state-cli.sh phase` validates:

- [ ] `.learn.status` is `learned` or `reviewed-skipped`
- [ ] PR diff was reviewed (step 11b.1)
- [ ] Review comments were reviewed (step 11b.1)
- [ ] If learnings exist: learning PR created and `.learn.prNumber` set
- [ ] If no learnings: `.learn.reviewedAt` timestamp set
