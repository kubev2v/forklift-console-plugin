# Phase 1: Triage

**Gate:** Auto-recap for valid outcomes; gate destructive outcomes (wrong team, duplicate, invalid)

Evaluates ticket validity before investing investigation time. Also performs a
minimal Jira claim (Assigned, component, labels) so others know the ticket is
being looked at.

---

## Steps

### 1.0 Initialize state (if missing)

```bash
.cursor/skills/dev-helper/scripts/state-cli.sh get ${TICKET_KEY} 2>/dev/null || \
  .cursor/skills/dev-helper/scripts/state-cli.sh init ${TICKET_KEY} <TYPE>
```

### 1.1 Minimal claim

Transition to Assigned and set component/labels so the ticket is visibly owned:

```bash
source .cursor/skills/dev-helper/scripts/_config.sh
.cursor/skills/dev-helper/scripts/jira-transition.sh ${TICKET_KEY} "Assigned"
.cursor/skills/dev-helper/scripts/jira-track.sh set-component ${TICKET_KEY} "${JIRA_COMPONENT_ID}"
.cursor/skills/dev-helper/scripts/jira-track.sh set-labels ${TICKET_KEY} "${PR_LABELS}"
```

If already Assigned or In Progress, skip the transition.

### 1.2 Fetch ticket details

```bash
source .cursor/skills/dev-helper/scripts/_config.sh
source ~/.jira-creds

curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
  "${JIRA_BASE_URL}/rest/api/2/issue/${TICKET_KEY}" | jq .

curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
  "${JIRA_BASE_URL}/rest/api/2/issue/${TICKET_KEY}/comment" \
  | jq '.comments[] | {author: .author.displayName, body: .body, created: .created}'
```

Store the ticket type in state:
```bash
.cursor/skills/dev-helper/scripts/state-cli.sh set ${TICKET_KEY} \
  --arg type "<issuetype.name from response>" \
  '.type = $type'
```

### 1.3 Evaluate description clarity

Check if the description has enough detail:

- **Clear problem statement** -- what is wrong or what is requested
- **Expected vs actual behavior** -- what should happen vs what happens
- **Affected area/page** -- which part of the UI is involved
- **Environment info** -- OCP version, Forklift version, provider type

If vague or missing key details, flag for "Needs info" outcome.

### 1.4 Check reproducibility signal

**For bugs:** steps to reproduce, screenshots, frequency.
**For features/stories:** acceptance criteria, mockups.

### 1.5 Verify team ownership

The ticket belongs to the UI team if it involves UI-specific work. If the issue
is **purely backend** (API, controller, operator), it should go to a different
component.

### 1.6 Search for duplicates

```bash
source .cursor/skills/dev-helper/scripts/_config.sh
source ~/.jira-creds
curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
  "${JIRA_BASE_URL}/rest/api/2/search" \
  -G --data-urlencode "jql=project = ${JIRA_PROJECT_KEY} AND component = '${JIRA_COMPONENT_NAME}' AND status not in (Closed, Verified) AND summary ~ '<keywords>' ORDER BY created DESC" \
  --data-urlencode "fields=key,summary,status" \
  --data-urlencode "maxResults=10"
```

### 1.7 Check backend dependencies

Check linked tickets for backend PRs that haven't merged yet:

```bash
gh pr view <PR_NUMBER> --repo kubev2v/forklift --json state,mergeable
```

### 1.8 Assess scope

- **Single fix/feature**: good to proceed
- **Too broad**: recommend splitting
- **Too vague**: needs info

### 1.9 Present triage outcome

Present the result. For **valid** outcomes, proceed automatically. For
**destructive** outcomes (wrong team, duplicate, invalid), **wait for user
confirmation** before closing or transitioning.

```
## Triage Result: ${TICKET_KEY}

**Outcome:** Valid / Needs info / Wrong team / Duplicate / Invalid
**Description clarity:** Sufficient / Insufficient
**Team ownership:** Correct (UI) / Wrong (backend-only)
**Duplicates found:** None / MTV-XXXX
**Backend blockers:** None / MTV-XXXX PR #NNN
**Scope:** Appropriate / Too broad
```

| Outcome | Action |
|---------|--------|
| Valid | Advance to Phase 2: Investigate |
| Needs info | Post Jira comment, mark `waiting` with `awaiting-info` |
| Wrong team | Wait for user confirmation, then close |
| Duplicate | Wait for user confirmation, then close |
| Invalid | Wait for user confirmation, then close |

### 1.10 Save triage artifact

Write the triage recap to the ticket's artifact folder:

```
File: .cursor/skills/dev-helper/state/${TICKET_KEY}/triage.md
```

Content: the triage outcome summary from step 1.9 (outcome, clarity, ownership,
duplicates, blockers, scope). Use the Write tool.

### 1.11 Advance phase

```bash
# Valid
.cursor/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} investigate

# Needs info
.cursor/skills/dev-helper/scripts/state-cli.sh wait ${TICKET_KEY} awaiting-info

# Done (after user confirms destructive outcome)
.cursor/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} done
```
