# Phase 12: Post-Merge Jira Tracking

**Gate:** Autonomous (final phase before done)

Completes all Jira tracking after the PR is merged.

---

## Prerequisites

- PR merged (Phase 11)
- State file has `pr.mergedAt`

## Steps

### 12.1 Transition status (idempotent)

Check current Jira status before transitioning to avoid duplicate actions
(reconcile.sh may have already transitioned):

```bash
source .cursor/skills/dev-helper/scripts/_config.sh
source ~/.jira-creds

CURRENT_STATUS=$(curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
  "${JIRA_BASE_URL}/rest/api/2/issue/${TICKET_KEY}?fields=status" \
  | jq -r '.fields.status.name')

TYPE=$(.cursor/skills/dev-helper/scripts/state-cli.sh field ${TICKET_KEY} '.type')
```

Only transition if the ticket is not already at a terminal status (target
status, Closed, or Verified). The guard below skips any ticket that has
already reached its destination. Jira may not allow skipping intermediate
states, so chain through them:

| Ticket Type | Target Status | Intermediate Chain |
|-------------|--------------|-------------------|
| Bug | Modified | In Progress -> POST -> Modified |
| Story / Task | Closed | In Progress -> POST -> Closed |
| Epic | Skip | Closed only when all child stories are done (step 12.6) |

```bash
if [[ "$TYPE" == "Bug" && "$CURRENT_STATUS" != "Modified" && "$CURRENT_STATUS" != "Closed" && "$CURRENT_STATUS" != "Verified" ]]; then
  .cursor/skills/dev-helper/scripts/jira-transition.sh ${TICKET_KEY} "In Progress" 2>/dev/null || true
  .cursor/skills/dev-helper/scripts/jira-transition.sh ${TICKET_KEY} "POST" 2>/dev/null || true
  .cursor/skills/dev-helper/scripts/jira-transition.sh ${TICKET_KEY} "Modified"
elif [[ "$TYPE" != "Bug" && "$TYPE" != "Epic" && "$CURRENT_STATUS" != "Closed" && "$CURRENT_STATUS" != "Verified" ]]; then
  .cursor/skills/dev-helper/scripts/jira-transition.sh ${TICKET_KEY} "In Progress" 2>/dev/null || true
  .cursor/skills/dev-helper/scripts/jira-transition.sh ${TICKET_KEY} "POST" 2>/dev/null || true
  .cursor/skills/dev-helper/scripts/jira-transition.sh ${TICKET_KEY} "Closed"
fi
```

Each intermediate transition is attempted and silently ignored if the ticket
is already past that state. Only the final target transition is required to
succeed.

### 12.2 Calculate and set story points (skip for Epics)

**Epics do not get story points, QA contact, or activity type.**

For non-Epic tickets, calculate based on:
- **Elapsed time**: From `startedAt` (Phase 1) to `pr.mergedAt`
- **Complexity**: Investigation depth, files changed, design iterations

| Points | Duration | Complexity |
|--------|----------|------------|
| 2 (XS) | Hours to half a day | Trivial change |
| 5 (S) | 1-2 days | Simple, clear criteria |
| 8 (M) | 2-4 days | Some research, moderate complexity |
| 13 (L) | 4-7 days | Complex, new area, significant research |
| 21 (XL) | >1 week | Should have been broken into smaller tasks |

Present the recommendation, then set:

```bash
.cursor/skills/dev-helper/scripts/jira-track.sh set-story-points ${TICKET_KEY} <POINTS>
```

### 12.3 Set QA Contact

```bash
source .cursor/skills/dev-helper/scripts/_config.sh
.cursor/skills/dev-helper/scripts/jira-track.sh set-qa-contact ${TICKET_KEY} "${QA_CONTACT}"
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
are now done. If so, close the Epic.

```bash
source .cursor/skills/dev-helper/scripts/_config.sh
source ~/.jira-creds

PARENT_EPIC=$(curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
  "${JIRA_BASE_URL}/rest/api/2/issue/${TICKET_KEY}?fields=parent" \
  | jq -r '.fields.parent.key // empty')

if [[ -n "$PARENT_EPIC" ]]; then
  OPEN_CHILDREN=$(curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
    "${JIRA_BASE_URL}/rest/api/2/search" \
    -G --data-urlencode "jql=parent = ${PARENT_EPIC} AND status not in (Closed, Verified, \"Release Pending\")" \
    --data-urlencode "maxResults=0" \
    | jq '.total')

  if [[ "$OPEN_CHILDREN" -eq 0 ]]; then
    .cursor/skills/dev-helper/scripts/jira-transition.sh ${PARENT_EPIC} "Closed" 2>/dev/null || true
    echo "Epic ${PARENT_EPIC}: all children closed -> Epic closed"
  else
    echo "Epic ${PARENT_EPIC}: ${OPEN_CHILDREN} children still open -> skipping"
  fi
fi
```

### 12.7 Advance to done

```bash
.cursor/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} done
```

Present final summary:

```text
## Ticket Complete: ${TICKET_KEY}

**PR:** ${PR_URL}
**Story Points:** <points>
**Jira Status:** Modified/Closed
**Duration:** <elapsed time>
```

### 12.8 What's Next

After completing this ticket, check for other active work:

```bash
.cursor/skills/dev-helper/scripts/state-cli.sh active
```

- If there are **waiting tickets** that may have unblocked (e.g., PR review came in),
  suggest resuming the most relevant one.
- If there are **other active tickets**, suggest resuming the next one.
- If there are **no active tickets**, offer: "Shall I run bug triage to find the
  next ticket to work on?"
