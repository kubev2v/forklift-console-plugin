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

Only transition if the ticket is still in a pre-merge state (POST, In Progress, Assigned):

| Ticket Type | Transition To | Condition |
|-------------|--------------|-----------|
| Bug | Modified | Status is POST or In Progress |
| Story / Task | Closed | Status is POST or In Progress |
| Epic | Skip | Epics are managed separately |

```bash
if [[ "$TYPE" == "Bug" && "$CURRENT_STATUS" != "Modified" && "$CURRENT_STATUS" != "Closed" ]]; then
  .cursor/skills/dev-helper/scripts/jira-transition.sh ${TICKET_KEY} "Modified"
elif [[ "$TYPE" != "Bug" && "$TYPE" != "Epic" && "$CURRENT_STATUS" != "Closed" ]]; then
  .cursor/skills/dev-helper/scripts/jira-transition.sh ${TICKET_KEY} "Closed"
fi
```

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

If this was a Story under an Epic, check if all stories in the Epic are now
Modified/Closed. If so, consider transitioning the Epic too.

### 12.7 Advance to done

```bash
.cursor/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} done
```

Present final summary:

```
## Ticket Complete: ${TICKET_KEY}

**PR:** ${PR_URL}
**Story Points:** <points>
**Jira Status:** Modified/Closed
**Duration:** <elapsed time>
```
