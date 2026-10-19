<!-- FALLBACK REFERENCE: Use phases/quick-ref.md for normal flow.
     Read this file ONLY if a step fails or you need error recovery details. -->

# Phase 11: Monitor PR



**Gate:** Auto-fix CI/review issues; learn before merge; advance on merge

Monitors the PR for CI failures, review comments, and merge readiness. Uses
an ordered action loop to handle all fixable criteria before marking as
waiting. Includes a Learn sub-step on approval.

---

## Prerequisites

- PR created and Jira updated (Phase 10)
- State file has `prUrl` and `prNumber`

## Standalone Mode

This phase can be invoked standalone (outside the dev-helper lifecycle) via
the **pr-monitor** skill (`.agents/skills/dev-helper/skills/pr-monitor/SKILL.md`).
In standalone mode:

- **Skip** all `state-cli.sh phase` and `state-cli.sh wait` commands
- **Skip** the Learn sub-step (Priority 5) and Learn gate in merge criteria
- **Run** the action loop (sections 11.1 through 11.7) for monitoring, rebase,
  CI fix, and review reply actions
- **Report** the status and actions taken to the user without advancing state

Standalone mode is useful for ad-hoc "check my PR" requests and for batch
monitoring without requiring a full dev-helper ticket lifecycle.

## Monitoring Modes

### Manual trigger
User says "check my PR" or "monitor MTV-XXXX" -- agent reads this phase and
runs the action loop once.

### Babysit (recommended for active monitoring)
Start a polling loop that checks the PR periodically:
```bash
.agents/skills/dev-helper/scripts/state-cli.sh babysit
```
Marks tickets for periodic monitoring. The agent checks status when prompted
or on session start via reconcile.

### Reconcile (session start)
`reconcile.sh` runs automatically on session start via hooks and detects:
- Merged PRs (auto-transitions Jira)
- Jira status changes (external closes)
- New Jira comments on `awaiting-info` tickets (auto-resumes)
- Stale waiting states (flags for follow-up)
- Untracked PRs (adds to monitoring)

---

## Steps

### 0. Load project rules

**Before doing anything else in this phase**, check if the file
`.agents/skills/dev-helper/phases-rules/11-monitor-pr.md` exists. If it does,
read it now. It contains project-specific agent personas, coding standards,
and conventions that MUST be applied during this phase. Do not skip this step.

---

## Action Loop

For each PR, fetch all data then work through each criterion in priority
order. The agent handles everything it can, then marks as waiting for
whatever requires external action (reviewer, CI).

### 11.1 Fetch PR data

```bash
.agents/skills/dev-helper/scripts/pr-monitor.sh ${PR_NUMBER}
```

The script outputs:
- CI check status (passing/failing/pending)
- SonarCloud open issues when the SonarCloud check is failing (`FLAG: SONAR_ISSUES`)
- Review decisions (approved, changes requested)
- Unresolved review threads and comments
- Merge conflicts and behind-main count
- Overall status assessment

Also fetch review comment details for replying:

```bash
gh api repos/${GH_REPO}/pulls/${PR_NUMBER}/comments \
  | jq '.[] | {id: .id, user: .user.login, body: .body, path: .path}'
```

### 11.2 Priority 1: Check if merged

If the PR is merged:

```bash
.agents/skills/dev-helper/scripts/state-cli.sh set ${TICKET_KEY} \
  '.pr.mergedAt = (now | todate) | .pr.ciStatus = "merged"'
```

Check learn status before advancing:

```bash
LEARN_STATUS=$(.agents/skills/dev-helper/scripts/state-cli.sh field ${TICKET_KEY} '.learn.status // "none"')
```

- If `LEARN_STATUS` is `learned`, `reviewed-skipped`, or `skipped` (legacy):
  advance to `track-jira-merged` and proceed to Phase 12.
- If `LEARN_STATUS` is `none` or missing: advance to `learn` phase.

```bash
if [[ "$LEARN_STATUS" == "learned" || "$LEARN_STATUS" == "reviewed-skipped" ]]; then
  .agents/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} track-jira-merged
  # Proceed to Phase 12. Read and follow phases/12-track-jira-merged.md.
else
  .agents/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} learn
  # Proceed to Phase 11b. Read and follow phases/11b-learn.md.
fi
```

**Done with this PR.**

### 11.3 Priority 2: Rebase if behind main

**HARD CONSTRAINT: The agent must NEVER auto-resolve merge conflicts.**
Only clean rebases (no conflicts) are safe to perform autonomously.

If the monitor reports `FLAG: NEEDS_REBASE` or the branch is behind main:

1. **Attempt rebase:**
```bash
BRANCH=$(.agents/skills/dev-helper/scripts/state-cli.sh field ${TICKET_KEY} '.branch')
git fetch upstream main
git checkout ${BRANCH}
git rebase upstream/main
```

2. **Clean rebase (no conflicts)** -- force push:
```bash
git push origin ${BRANCH} --force-with-lease
```
CI will re-run on the new base. **STOP processing this PR.** Mark as waiting
for CI and do NOT proceed to merge until all checks pass on the new HEAD:
```bash
.agents/skills/dev-helper/scripts/state-cli.sh wait ${TICKET_KEY} pr-ci-pending
```

3. **Conflicts** -- abort, alert user, stop processing this PR:
```bash
git rebase --abort
.agents/skills/dev-helper/scripts/state-cli.sh wait ${TICKET_KEY} rebase-conflicts
```

Alert the user with:
- Which files have conflicts
- The PR number and branch name
- Ask them to resolve manually and say "resume" when done

Do NOT attempt to read conflict markers, resolve conflicts, or continue
the rebase. The user must handle this.

**Stop processing this PR.**

### 11.4 Priority 3: Fix CI failures

If CI checks are failing (after rebase, if one was needed):

1. **Determine if it's our code**: Check the failing test/check name against
   files we changed
2. **If our code caused it**: Investigate the failure, propose a fix, implement
   it, commit (`-s`) and push to the PR branch
3. **If it's a flaky test (Konflux)**: Post `/retest` comment to re-trigger

#### SonarCloud Code Analysis

When `pr-monitor.sh` lists **SonarCloud** among failing checks, it also prints
the SonarCloud issues block (and `FLAG: SONAR_ISSUES`) by calling:

```bash
.agents/skills/dev-helper/scripts/sonar-pr-issues.sh ${PR_NUMBER}
```

Re-run manually if you need a fresh list after pushing fixes:

```bash
.agents/skills/dev-helper/scripts/sonar-pr-issues.sh ${PR_NUMBER}
```

Optional overrides:

| Variable | Default | Purpose |
|----------|---------|---------|
| `SONAR_PROJECT_KEY` | `kubev2v_forklift-console-plugin` | Sonar component key |
| `SONAR_ISSUES_PAGE_SIZE` | `50` | Max issues per API page |

Human UI (same PR filter):

`https://sonarcloud.io/project/issues?pullRequest=${PR_NUMBER}&resolved=false&id=kubev2v_forklift-console-plugin`

**Agent workflow for Sonar findings:**

1. Work through each line from `sonar-pr-issues.sh` (severity, file, line, rule, message).
2. Fix in the PR branch using project conventions (shell `shelldre:*`, JS complexity/type rules, etc.).
3. Run local checks that apply (`npm run agent-setup:validate`, `npm run test:agent-rules`, targeted tests).
4. Commit (`-s`), push, then **stop** — wait for SonarCloud to re-analyze the new commit before treating CI as fixed.
5. Do not close Sonar issues in the UI manually; new analysis should clear them when fixed.

Direct API (if the script is unavailable):

```bash
curl -s "https://sonarcloud.io/api/issues/search?pullRequest=${PR_NUMBER}&componentKeys=kubev2v_forklift-console-plugin&resolved=false&ps=50" \
  | jq -r '.issues[] | "[\(.severity)] \(.component | split(\":\")[1]):\(.line) \(.rule) — \(.message)"'
```

```bash
gh pr comment ${PR_NUMBER} --repo $GH_REPO --body "/retest"
```

Maximum 3 retests. After 3 failures, alert the user.

After fixing CI or posting `/retest`, CI needs to re-run.
Mark as waiting and **stop processing this PR:**

```bash
.agents/skills/dev-helper/scripts/state-cli.sh wait ${TICKET_KEY} pr-ci-pending
```

### 11.5 Priority 4: Address review comments

If there are unresolved review comments (human or CodeRabbit) that we
haven't replied to:

For each new comment:

| Source | Action |
|--------|--------|
| **Team reviewer** | Fix if actionable, reply explaining the fix. If not fixable, reply explaining why. |
| **CodeRabbit** | Fix if valid. If not applicable, reply explaining why. |

**CRITICAL: Reply to EVERY comment individually.** Each comment must get its
own reply. Never batch-reply or leave comments without a response.

#### Reply format per comment

| Situation | Reply pattern |
|-----------|---------------|
| Fixed the issue | "Fixed -- \<brief explanation of what changed\>" |
| Won't fix (disagree) | "Keeping as-is -- \<rationale why current approach is correct\>" |
| Won't fix (out of scope) | "Out of scope for this PR -- \<reason\>. Filed \<ticket\> to track." |
| Clarification needed | "\<answer to the question\>" |

#### Reply using REST API

Use the `in_reply_to` parameter to thread replies under the original comment:

```bash
gh api repos/${GH_REPO}/pulls/${PR_NUMBER}/comments \
  | jq '.[] | {id: .id, user: .user.login, body: .body, path: .path}'

gh api repos/${GH_REPO}/pulls/${PR_NUMBER}/comments -X POST \
  -f body="Fixed -- <brief explanation>" \
  -F in_reply_to=<COMMENT_ID>
```

#### Resolve threads via GraphQL (after replying)

```bash
gh api graphql -f query='mutation {
  resolveReviewThread(input: { threadId: "<THREAD_NODE_ID>" }) {
    thread { isResolved }
  }
}'
```

#### After addressing all comments

Commit and push fixes (always use `-s` for DCO sign-off):
```bash
git add <changed-source-files>
git commit -s -m "Address review comments

<brief description>

Resolves: ${TICKET_KEY}"
git push origin ${BRANCH}
```

Update PR description if review feedback meaningfully expanded the scope.

After pushing, the PR needs reviewer re-review and CI re-run.
Mark as waiting and **stop processing this PR:**

```bash
.agents/skills/dev-helper/scripts/state-cli.sh wait ${TICKET_KEY} pr-review-pending
```

### 11.6 Priority 5: Check merge readiness

If none of the above actions were needed, check if the PR is ready to merge.

The PR is ready to merge when ALL of:
- At least one approval
- All required CI checks pass
- No merge conflicts
- No unresolved `CHANGES_REQUESTED`
- Branch is up to date with upstream main

If the branch is behind main, run step 11.3 first to bring it up to date.

Note: GitHub Actions workflows from `.github/workflows/pr-commands.yaml` may
fail -- that's OK, they're not blocking.

#### Ready to merge -- Learn sub-step

When the PR is ready to merge (all criteria pass):

1. **Review what was learned** during this ticket:
   - Investigation findings and root cause
   - Reviewer comments and what they taught
   - Patterns discovered during implementation
   - Any gaps in project rules or documentation

2. **Propose rule/doc updates** if any learnings should be captured:

   | File | Update if... |
   |------|-------------|
   | `.agents/rules/project-context.md` | New CRD, provider type, architecture concept |
   | `AGENTS.md` | New shared utility, convention, or anti-pattern |
   | `.agents/rules/testing.md` | New test pattern or mock strategy |
   | `.agents/rules/typescript.md` | New type guard or workaround |

3. **Add a commit** to the PR with the rule updates:
   ```bash
   git add <changed-rule-files>
   git commit -s -m "chore: update rules with learnings from ${TICKET_KEY}

   Resolves: None"
   git push origin ${BRANCH}
   ```

4. **Record learn status** in state:
   ```bash
   # If learnings were captured and committed:
   .agents/skills/dev-helper/scripts/state-cli.sh set ${TICKET_KEY} \
     '.learn.status = "learned" | .learn.committedAt = (now | todate)'

   # If no learnings needed (nothing new to capture):
   .agents/skills/dev-helper/scripts/state-cli.sh set ${TICKET_KEY} \
     '.learn.status = "reviewed-skipped"'
   ```

5. **Notify user** the PR is ready to merge (with learnings included).

#### Not ready (no action possible)

If the PR is not ready and no fixable actions remain (waiting for approval
or CI), mark as waiting:

```bash
# Waiting for reviewer
.agents/skills/dev-helper/scripts/state-cli.sh wait ${TICKET_KEY} pr-review-pending

# Waiting for CI
.agents/skills/dev-helper/scripts/state-cli.sh wait ${TICKET_KEY} pr-ci-pending
```

Inform the user this ticket is waiting. They can work on another ticket.

### 11.7 Priority 6: Auto-merge

**HARD CONSTRAINT: NEVER submit a PR to the merge queue unless ALL 6 merge
criteria below are verified as passing.** Every single criterion is a hard
gate -- if even one is not met, merging is FORBIDDEN. No exceptions.

After a rebase or force-push, the commit SHA changes. CI must re-run and
approval may be reset. You MUST re-verify ALL 6 criteria on the new HEAD
before merging. Submitting with pending/running checks is FORBIDDEN -- even
if the code is identical, the new commit is unvalidated.

**Merge criteria (ALL 6 required):**

| # | Criterion | Verified by |
|---|-----------|-------------|
| 1 | **CI Passing** -- all required checks show SUCCESS on the **current HEAD** | `ci_passing == true` in pr-monitor output |
| 2 | **Approved** -- at least one human approval, not reset by new commits | `is_approved == true` |
| 3 | **No Conflicts** -- PR mergeable state is not CONFLICTING | `has_conflicts == false` |
| 4 | **Up to Date** -- branch is not behind upstream/main | `needs_rebase == false` |
| 5 | **No Unresolved Threads** -- all review threads resolved | `unresolved == 0` |
| 6 | **Learn Done** -- learn status is `learned` or `reviewed-skipped` | `learn_ready == true` |

If ANY criterion is not met, DO NOT MERGE. Handle the blocking criterion
first (rebase, fix CI, address comments, run learn, etc.) and re-verify
ALL criteria afterward.

**Auto-merge:**

```bash
gh pr merge ${PR_NUMBER} --repo $GH_REPO --squash --delete-branch
```

On merge success:

```bash
.agents/skills/dev-helper/scripts/state-cli.sh set ${TICKET_KEY} \
  '.pr.mergedAt = (now | todate) | .pr.ciStatus = "merged"'
```

Check learn status before advancing (same logic as Priority 1):

```bash
LEARN_STATUS=$(.agents/skills/dev-helper/scripts/state-cli.sh field ${TICKET_KEY} '.learn.status // "none"')

if [[ "$LEARN_STATUS" == "learned" || "$LEARN_STATUS" == "reviewed-skipped" ]]; then
  .agents/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} track-jira-merged
  # Proceed to Phase 12. Read and follow phases/12-track-jira-merged.md.
else
  .agents/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} learn
  # Proceed to Phase 11b. Read and follow phases/11b-learn.md.
fi
```

**If learn status is `none`:** Do NOT merge. Run the Learn sub-step (Priority 5)
first, then re-check merge criteria.

## Completion Checklist

Before merging or advancing from this phase, verify:

- [ ] All 6 merge criteria pass (approved, CI, no conflicts, up to date, no unresolved threads, learn done)
- [ ] `.learn.status` is `learned` or `reviewed-skipped` (not `none`)
- [ ] `.prNumber` field set in state
