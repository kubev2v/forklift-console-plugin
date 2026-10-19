<!-- FALLBACK REFERENCE: Use phases/quick-ref.md for normal flow.
     Read this file ONLY if a step fails or you need error recovery details. -->

# Phase 12: Post-Merge Jira Tracking



**Gate:** Autonomous (final phase before done)

Completes all Jira tracking after the PR is merged.

---

## Prerequisites

- PR merged (Phase 11)
- State file has `pr.mergedAt`

## Steps

### 0. Load project rules

**Before doing anything else in this phase**, check if the file
`.agents/skills/dev-helper/phases-rules/12-track-jira-merged.md` exists. If it does,
read it now. It contains project-specific agent personas, coding standards,
and conventions that MUST be applied during this phase. Do not skip this step.


### 0b. Use provided scripts

All Jira operations in this phase MUST use the provided scripts:
- `jira-transition.sh` for status changes
- `jira-track.sh` for field updates (story points, QA contact, sprint, etc.)
- `_config.sh` for credentials (source it, don't parse creds manually)
Do NOT use raw `curl` for Jira API calls.

### 12.1 Transition status (idempotent)

Check current Jira status before transitioning to avoid duplicate actions
(reconcile.sh may have already transitioned):

```bash
source .agents/skills/dev-helper/scripts/_config.sh
source ~/.jira-creds

CURRENT_STATUS=$(curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
  "${JIRA_BASE_URL}/rest/api/2/issue/${TICKET_KEY}?fields=status" \
  | jq -r '.fields.status.name')

TYPE=$(.agents/skills/dev-helper/scripts/state-cli.sh field ${TICKET_KEY} '.type')
```

Only transition if the ticket is not already at a terminal status.
Expected state at Phase 12 depends on ticket type (set by Phase 10):

| Ticket Type | Expected state at Phase 12 | Target | Transition |
|-------------|---------------------------|--------|------------|
| Bug | `POST` (Phase 10 set it) | `MODIFIED` | `POST` → `MODIFIED` |
| Story | `In Progress` (Phase 10 set it) | `Done` | `In Progress` → `Done` |
| Epic | skip | — | `Done` only when all children `Done` (step 12.6) |
| Feature Request | skip | — | no auto-transition |

```bash
TERMINAL_STATUSES=("MODIFIED" "Done" "Closed" "Verified" "Release Pending")

is_terminal() {
  local status="$1"
  for s in "${TERMINAL_STATUSES[@]}"; do [[ "$status" == "$s" ]] && return 0; done
  return 1
}

if [[ "$TYPE" == "Bug" ]] && ! is_terminal "$CURRENT_STATUS"; then
  # Bug: POST (Phase 10) -> MODIFIED
  .agents/skills/dev-helper/scripts/jira-transition.sh ${TICKET_KEY} "POST" 2>/dev/null || true
  .agents/skills/dev-helper/scripts/jira-transition.sh ${TICKET_KEY} "MODIFIED"
elif [[ "$TYPE" == "Story" ]] && ! is_terminal "$CURRENT_STATUS"; then
  # Story: In Progress (Phase 10) -> Done
  .agents/skills/dev-helper/scripts/jira-transition.sh ${TICKET_KEY} "Done"
elif [[ "$TYPE" != "Bug" && "$TYPE" != "Epic" && "$TYPE" != "Story" \
      && "$TYPE" != "Feature Request" && "$TYPE" != "Feature" ]] \
      && ! is_terminal "$CURRENT_STATUS"; then
  # Other types (Task, etc.): legacy path POST -> Closed
  .agents/skills/dev-helper/scripts/jira-transition.sh ${TICKET_KEY} "POST" 2>/dev/null || true
  .agents/skills/dev-helper/scripts/jira-transition.sh ${TICKET_KEY} "Closed"
fi
```

Each intermediate is silently ignored if the ticket is already past it.
Only the final target transition is required to succeed.

### 12.2 Story points

Story points are set in Phase 5 (Jira Track) and are NEVER recalculated here.
Phase 5 is the single source of truth for story points.

### 12.3 Set QA Contact

```bash
source .agents/skills/dev-helper/scripts/_config.sh
.agents/skills/dev-helper/scripts/jira-track.sh set-qa-contact ${TICKET_KEY} "${QA_CONTACT}"
```

### 12.4 Set Activity Type

| Ticket Type | Activity Type |
|-------------|---------------|
| Bug | Quality / Stability / Reliability |
| Story / Epic / Task | Product / Portfolio Work |

### 12.5 Populate release notes fields

Key fields:
- Release Note Type (Bug Fix / Enhancement / Feature)
- Release Note Text (user-facing description)
- Doc Impact (whether documentation needs updating)

### 12.6 Check parent epic (stories only)

If this was a Story under an Epic, check if all child stories of the Epic
are now `Done`. If so, transition the Epic to `Done`.

Uses JQL to query all children. If the query fails (permissions, API version),
log the error and continue — do not block the phase.

```bash
source .agents/skills/dev-helper/scripts/_config.sh
source ~/.jira-creds

if [[ "$TYPE" == "Story" ]]; then
  PARENT_EPIC=$(.agents/skills/dev-helper/scripts/state-cli.sh field ${TICKET_KEY} '.parentEpic // empty' 2>/dev/null)

  if [[ -n "$PARENT_EPIC" ]]; then
    OPEN_CHILDREN=$(curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
      "${JIRA_BASE_URL}/rest/api/2/search" \
      -G --data-urlencode "jql=parent = ${PARENT_EPIC} AND status not in (Done, Closed, Verified, \"Release Pending\")" \
      --data-urlencode "maxResults=0" \
      2>/dev/null | jq '.total // -1')

    if [[ "$OPEN_CHILDREN" == "-1" ]]; then
      echo "Epic ${PARENT_EPIC}: could not query children (permissions?) — skipping Epic Done check"
    elif [[ "$OPEN_CHILDREN" -eq 0 ]]; then
      .agents/skills/dev-helper/scripts/jira-transition.sh ${PARENT_EPIC} "Done" 2>/dev/null || true
      echo "Epic ${PARENT_EPIC}: all children Done -> Epic Done"
    else
      echo "Epic ${PARENT_EPIC}: ${OPEN_CHILDREN} children still open -> skipping"
    fi
  fi
fi
```

### 12.7 Generate consolidated report

Write a summary of the entire ticket lifecycle to disk. This makes
retrospectives, standups, and handoffs easier — one file per ticket.

```bash
STATE_CLI=".agents/skills/dev-helper/scripts/state-cli.sh"
STATE_DIR=".agents/skills/dev-helper/state/${TICKET_KEY}"

TYPE=$($STATE_CLI field ${TICKET_KEY} '.type')
STARTED=$($STATE_CLI field ${TICKET_KEY} '.startedAt')
MERGED=$($STATE_CLI field ${TICKET_KEY} '.pr.mergedAt')
PR_NUM=$($STATE_CLI field ${TICKET_KEY} '.prNumber')
PR_URL=$($STATE_CLI field ${TICKET_KEY} '.prUrl')
ROOT_CAUSE=$($STATE_CLI field ${TICKET_KEY} '.investigation.rootCause // "N/A"')
LEARN_STATUS=$($STATE_CLI field ${TICKET_KEY} '.learn.status // "none"')
COMPLEXITY=$($STATE_CLI field ${TICKET_KEY} '.complexity // "N/A"')
WORK_SIZE=$($STATE_CLI field ${TICKET_KEY} '.workSize // "N/A"')
SKIPPED=$($STATE_CLI field ${TICKET_KEY} '.skippedPhases // [] | join(", ")')
PHASES=$($STATE_CLI field ${TICKET_KEY} '[.history[].phase] | join(" → ")')
```

Write the summary using the template below:

```text
File: .agents/skills/dev-helper/state/${TICKET_KEY}/summary.md
```

Template:

```markdown
# ${TICKET_KEY} Summary

**Type:** ${TYPE} | **Complexity:** ${COMPLEXITY} | **Work size:** ${WORK_SIZE}
**Started:** ${STARTED} | **Merged:** ${MERGED}
**PR:** #${PR_NUM} (${PR_URL})

## Root Cause
${ROOT_CAUSE}

## Phases
${PHASES}

## Skipped Phases
${SKIPPED or "None"}

## Learn Status
${LEARN_STATUS}
```

### 12.8 Advance to done

```bash
.agents/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} done
```

Present the summary from step 12.7 in chat as the final ticket report.

### 12.9 What's Next

After completing this ticket, check for other active work:

```bash
.agents/skills/dev-helper/scripts/state-cli.sh active
```

- If there are **waiting tickets** that may have unblocked (e.g., PR review came in),
  suggest resuming the most relevant one.
- If there are **other active tickets**, suggest resuming the next one.
- If there are **no active tickets**, offer: "Shall I run bug triage to find the
  next ticket to work on?"

## Completion Checklist

Before advancing to `done`, `state-cli.sh phase` validates:

- [ ] Previous phase was `track-jira-merged`
- [ ] `.learn.status` is `learned` or `reviewed-skipped`
- [ ] Jira status transitioned: `MODIFIED` for Bugs; `Done` for Stories; skipped for Epics and Feature Requests
- [ ] Story points set (non-Epic tickets)
- [ ] QA contact set
