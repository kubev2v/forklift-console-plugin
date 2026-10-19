---
name: pr-monitor
description: Monitor open PRs for CI failures, SonarCloud findings, review comments, merge conflicts, and merge readiness. Standalone entry for dev-helper Phase 11 — single PR, batch, or babysit until merge. Use when the user mentions check my PR, monitor PR, monitor my PRs, PR status, scan all PRs, review comments, CI failing, or provides a PR URL/number.
---

# PR Monitor (dev-helper Phase 11)

Part of **dev-helper**. Monitoring logic lives in
[phases/11-monitor-pr.md](../../phases/11-monitor-pr.md). In standalone mode, skip
`state-cli.sh phase` / `wait` and the Learn sub-step.

| You asked for | Read |
|---------------|------|
| One PR / URL / ticket | This file → **Single PR** → phase 11.1–11.7 |
| All tracked PRs | **Batch mode** |
| Loop until merge | **Babysit until merge** |
| Full ticket lifecycle | [dev-helper SKILL.md](../../SKILL.md) → phase `monitor-pr` |

## Single PR

1. Resolve PR number from input, URL, or current branch.
2. Read [phases/11-monitor-pr.md](../../phases/11-monitor-pr.md).
3. Run sections 11.1 through 11.7 in **standalone mode**.
4. Report status and actions taken.

## Batch mode

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

Run the phase 11 loop for each row; summarize in a table.

## Data fetch

```bash
.agents/skills/dev-helper/scripts/pr-monitor.sh ${PR_NUMBER} ${TICKET_KEY}
```

When SonarCloud fails, the script runs
`scripts/sonar-pr-issues.sh` and prints `FLAG: SONAR_ISSUES`. See phase **11.4
SonarCloud Code Analysis**.

```bash
.agents/skills/dev-helper/scripts/sonar-pr-issues.sh ${PR_NUMBER}
```

## Babysit until merge

Pre-check with the single-PR loop, then:

```bash
.agents/skills/dev-helper/scripts/auto-merge-loop.sh ${PR_NUMBER} [INTERVAL_SECONDS]
```

Default interval: 600 seconds. Criteria: approved, CI green, no conflicts, up
to date, zero unresolved threads (learn skipped in standalone mode).

## Lifecycle re-attachment

When dev-helper `state/` exists for the ticket, map monitor `STATUS` to
`state-cli.sh` per [phase 11](../../phases/11-monitor-pr.md) (merge, learn,
wait for CI/review).
