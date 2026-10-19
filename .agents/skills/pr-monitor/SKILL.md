---
name: pr-monitor
description: Monitor open PRs for CI failures, SonarCloud findings, review comments, merge conflicts, and merge readiness. Supports single-PR mode (given a PR number/URL) or batch mode (scans all PRs in the dev-helper monitoring list). Addresses review feedback by replying to each comment individually, fixes CI issues, rebases when behind main, and captures learnings on approval. Use when the user mentions check my PR, monitor PR, monitor my PRs, PR status, scan all PRs, review comments, CI failing, or provides a PR URL/number.
---

# PR Monitor

Thin wrapper around dev-helper Phase 11. All monitoring logic lives in
`.agents/skills/dev-helper/phases/11-monitor-pr.md` — read that file and
follow its action loop in **Standalone Mode** (skip state phase advancement
and waiting state commands, skip the Learn sub-step).

## Modes

### Single PR

Activated by: "check PR #2428", "monitor MTV-5354", or a PR URL.

1. Determine the PR number from user input, URL, or current branch
2. Read `.agents/skills/dev-helper/phases/11-monitor-pr.md`
3. Run sections 11.1 through 11.7 in standalone mode (skip `state-cli.sh
   phase`, `state-cli.sh wait`, and the Learn sub-step)
4. Report status and any actions taken

### Batch mode

Activated by: "monitor my PRs", "scan all PRs", or when no specific PR given.

1. Discover tracked PRs from state directory:
   ```bash
   for f in .agents/skills/dev-helper/state/*/state.json; do
     phase=$(jq -r '.phase' "$f")
     pr=$(jq -r '.prNumber // empty' "$f")
     ticket=$(jq -r '.ticket' "$f")
     if [[ "$phase" == "monitor-pr" && -n "$pr" ]]; then
       echo "${ticket} ${pr}"
     fi
   done
   ```
2. For each PR, run the Phase 11 action loop in standalone mode
3. Present a summary table:
   ```
   | Ticket    | PR    | Status             | Action Taken          |
   |-----------|-------|--------------------|-----------------------|
   | MTV-5354  | #2428 | WAITING_FOR_REVIEW | Skipped               |
   | MTV-5535  | #2435 | ACTION_NEEDED      | Replied to 2 comments |
   ```

### Re-attachment to dev-helper lifecycle

When monitoring detects a status change on a ticket with active dev-helper
state, update state accordingly:

| Status | Action |
|--------|--------|
| **MERGED** (learn done) | `state-cli.sh phase $TICKET track-jira-merged`, then read and follow `phases/12-track-jira-merged.md` |
| **MERGED** (learn not done) | `state-cli.sh phase $TICKET learn`, then read and follow `phases/11b-learn.md` |
| **READY_TO_MERGE** | Auto-merge via `gh pr merge --squash --delete-branch`, then advance to `learn` |
| **ACTION_NEEDED** | Follow Phase 11 action loop for the relevant priority |
| **WAITING_FOR_REVIEW** | `state-cli.sh wait $TICKET pr-review-pending` |
| **CI_PENDING** / **CI_FAILING** | Handle per Phase 11 Priority 3 |

## Data Fetch

Use `pr-monitor.sh` for structured PR data:

```bash
.agents/skills/dev-helper/scripts/pr-monitor.sh ${PR_NUMBER} ${TICKET_KEY}
```

When CI is failing, the script output includes failing check names, assessment
(`STATUS` / `ACTION`), and review threads.

### SonarCloud findings

If **SonarCloud Code Analysis** is failing, `pr-monitor.sh` automatically runs:

```bash
.agents/skills/pr-monitor/scripts/sonar-pr-issues.sh ${PR_NUMBER}
```

and prints `FLAG: SONAR_ISSUES`. Use that list during **Phase 11.4** (fix CI):
address each file/line/rule, commit, push, then wait for Sonar to re-run.

Fetch issues only (without full PR monitor):

```bash
.agents/skills/pr-monitor/scripts/sonar-pr-issues.sh ${PR_NUMBER}
```

Browser view:
`https://sonarcloud.io/project/issues?pullRequest=${PR_NUMBER}&resolved=false&id=kubev2v_forklift-console-plugin`

Full workflow: `.agents/skills/dev-helper/phases/11-monitor-pr.md` → **11.4 SonarCloud Code Analysis**.

## Babysit until merge

Activated by: "babysit PR #2488", "loop until merge", "auto-merge when ready",
or any request to keep monitoring a PR until it merges.

This mode launches a background polling loop that checks the PR at a fixed
interval and auto-merges (squash via merge queue) when all standalone-mode
criteria pass.

### Criteria (all must be true)

1. Approved (at least one human approval)
2. CI passing
3. No merge conflicts
4. Up to date with base branch (no rebase needed)
5. Zero unresolved review threads

Learn is skipped (standalone mode).

### Steps

1. **Pre-check**: Run the normal single-PR action loop first (sections 11.1
   through 11.5) to handle any immediate fixable issues (rebase, reply to
   comments, fix CI). This gives the PR the best chance of passing on the
   first loop iteration.

2. **Launch the loop** as a background shell:
   ```
   Start the script in a persistent background process supported by the current client. Capture its PID and log location, confirm the first iteration ran, and report how to stop it. If this client cannot keep a process alive, explain that limitation and use bounded status checks instead.
   ```

3. **Verify startup**: Do a quick status check of the background shell output
   to confirm the first iteration ran successfully.

4. **Report** to the user that the loop is running, what the current blockers
   are, and that they will be notified on merge.

### Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| PR_NUMBER | required | The PR number to monitor |
| INTERVAL  | 600 (10 min) | Seconds between polling iterations |

### Script location

```
.agents/skills/pr-monitor/scripts/auto-merge-loop.sh
```
