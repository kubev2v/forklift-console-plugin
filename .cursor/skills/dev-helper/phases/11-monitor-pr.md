# Phase 11: Monitor PR

**Gate:** Auto-fix CI/review issues; learn on approval; advance on merge

Monitors the PR for CI failures, review comments, and merge readiness. Uses
an ordered action loop to handle all fixable criteria before marking as
waiting. Includes a Learn sub-step on approval.

---

## Prerequisites

- PR created and Jira updated (Phase 10)
- State file has `prUrl` and `prNumber`

## Monitoring Modes

### Manual trigger
User says "check my PR" or "monitor MTV-XXXX" -- agent reads this phase and
runs the action loop once.

### Babysit (recommended for active monitoring)
Start a polling loop that checks the PR periodically:
```bash
.cursor/skills/dev-helper/scripts/state-cli.sh babysit
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

## Action Loop

For each PR, fetch all data then work through each criterion in priority
order. The agent handles everything it can, then marks as waiting for
whatever requires external action (reviewer, CI).

### 11.1 Fetch PR data

```bash
.cursor/skills/dev-helper/scripts/pr-monitor.sh ${PR_NUMBER}
```

The script outputs:
- CI check status (passing/failing/pending)
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
.cursor/skills/dev-helper/scripts/state-cli.sh set ${TICKET_KEY} \
  '.pr.mergedAt = (now | todate) | .pr.ciStatus = "merged"'

.cursor/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} track-jira-merged
```

Proceed to Phase 12. Read and follow `phases/12-track-jira-merged.md`.

**Done with this PR.**

### 11.3 Priority 2: Rebase if behind main

**HARD CONSTRAINT: The agent must NEVER auto-resolve merge conflicts.**
Only clean rebases (no conflicts) are safe to perform autonomously.

If the monitor reports `FLAG: NEEDS_REBASE` or the branch is behind main:

1. **Attempt rebase:**
```bash
BRANCH=$(.cursor/skills/dev-helper/scripts/state-cli.sh field ${TICKET_KEY} '.branch')
git fetch upstream main
git checkout ${BRANCH}
git rebase upstream/main
```

2. **Clean rebase (no conflicts)** -- force push and continue the loop:
```bash
git push origin ${BRANCH} --force-with-lease
```
CI will re-run on the new base. Continue to check remaining priorities.

3. **Conflicts** -- abort, alert user, stop processing this PR:
```bash
git rebase --abort
.cursor/skills/dev-helper/scripts/state-cli.sh wait ${TICKET_KEY} rebase-conflicts
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

```bash
gh pr comment ${PR_NUMBER} --repo $GH_REPO --body "/retest"
```

Maximum 3 retests. After 3 failures, alert the user.

After fixing CI or posting `/retest`, CI needs to re-run.
Mark as waiting and **stop processing this PR:**

```bash
.cursor/skills/dev-helper/scripts/state-cli.sh wait ${TICKET_KEY} pr-ci-pending
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
git add -A
git commit -s -m "Address review comments

<brief description>

Resolves: ${TICKET_KEY}"
git push origin ${BRANCH_NAME}
```

Update PR description if review feedback meaningfully expanded the scope.

After pushing, the PR needs reviewer re-review and CI re-run.
Mark as waiting and **stop processing this PR:**

```bash
.cursor/skills/dev-helper/scripts/state-cli.sh wait ${TICKET_KEY} pr-review-pending
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
   | `.cursor/rules/project-context.mdc` | New CRD, provider type, architecture concept |
   | `AGENTS.md` | New shared utility, convention, or anti-pattern |
   | `.cursor/rules/testing.mdc` | New test pattern or mock strategy |
   | `.cursor/rules/typescript.mdc` | New type guard or workaround |

3. **Add a commit** to the PR with the rule updates:
   ```bash
   git add <changed-rule-files>
   git commit -s -m "chore: update rules with learnings from ${TICKET_KEY}

   Resolves: None"
   git push origin ${BRANCH_NAME}
   ```

4. **Notify user** the PR is ready to merge (with learnings included).

#### Not ready (no action possible)

If the PR is not ready and no fixable actions remain (waiting for approval
or CI), mark as waiting:

```bash
# Waiting for reviewer
.cursor/skills/dev-helper/scripts/state-cli.sh wait ${TICKET_KEY} pr-review-pending

# Waiting for CI
.cursor/skills/dev-helper/scripts/state-cli.sh wait ${TICKET_KEY} pr-ci-pending
```

Inform the user this ticket is waiting. They can work on another ticket.
