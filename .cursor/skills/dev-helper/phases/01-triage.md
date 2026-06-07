# Phase 1: Triage

**Gate:** Auto-recap for valid outcomes; gate destructive outcomes (wrong team, duplicate, invalid)

Evaluates ticket validity before investing investigation time. Also performs a
minimal Jira claim (Assigned, component) so others know the ticket is
being looked at.

---

## Steps

### 1.0 Minimal claim

Transition to Assigned and set component so the ticket is visibly owned:

```bash
source .cursor/skills/dev-helper/scripts/_config.sh
.cursor/skills/dev-helper/scripts/jira-transition.sh ${TICKET_KEY} "Assigned"
.cursor/skills/dev-helper/scripts/jira-track.sh set-component ${TICKET_KEY} "${JIRA_COMPONENT_ID}"
```

If already Assigned or In Progress, skip the transition.

### 1.1 Fetch ticket details

```bash
source .cursor/skills/dev-helper/scripts/_config.sh
source ~/.jira-creds

curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
  "${JIRA_BASE_URL}/rest/api/2/issue/${TICKET_KEY}" | jq .

curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
  "${JIRA_BASE_URL}/rest/api/2/issue/${TICKET_KEY}/comment" \
  | jq '.comments[] | {author: .author.displayName, body: .body, created: .created}'
```

### 1.2 Initialize state (if missing)

Now that the ticket type is known from the response above, initialize state:

```bash
TYPE="<issuetype.name from response>"

.cursor/skills/dev-helper/scripts/state-cli.sh get ${TICKET_KEY} 2>/dev/null || \
  .cursor/skills/dev-helper/scripts/state-cli.sh init ${TICKET_KEY} "${TYPE}"

.cursor/skills/dev-helper/scripts/state-cli.sh set ${TICKET_KEY} \
  --arg type "${TYPE}" \
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

### 1.8b Classify complexity

Assess two independent dimensions and store in state:

**Certainty** -- how confident are you about the solution path?

| Level | Definition | Signal |
|-------|-----------|--------|
| `clear` | Solution obvious from the ticket. Known pattern, done before. | Agent can describe the fix after reading the ticket, before any code search. |
| `complicated` | Need investigation first, but solution will be deterministic once understood. | Agent needs to read code, trace data flows, or understand behavior before proposing a fix. |
| `complex` | Solution shape unknown. Requirements may shift as we build. May need prototyping. | Agent cannot predict the solution even after investigation. Multiple experts would disagree on approach. |

Examples:
- **clear**: Fix typo in i18n key. Missing null check. PatternFly enum update. Add a new provider type (12-step checklist in providers.mdc). Add a field to storage map details (known pattern).
- **complicated**: Plan status shows Ready but migration fails -- need to trace getPlanStatus. Validation doesn't catch duplicates -- need to find where checks live. Performance regression -- need to profile.
- **complex**: New conversion/inspection UX for an unfamiliar CRD. Redesign wizard for a new migration type. Integrate with a system whose API is still evolving.

**Work size** -- estimated implementation scope (independent of certainty):

| Level | Definition |
|-------|-----------|
| `small` | 1-3 files, single component/area |
| `medium` | 4-10 files, crosses component boundaries |
| `large` | 10+ files, multiple features affected |

Default to `complicated` / `medium` when uncertain.

```bash
.cursor/skills/dev-helper/scripts/state-cli.sh set ${TICKET_KEY} \
  --arg c "<clear|complicated|complex>" \
  --arg w "<small|medium|large>" \
  '.complexity = $c | .workSize = $w'
```

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
**Certainty:** clear / complicated / complex
**Work size:** small / medium / large
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

## Completion Checklist

Before advancing from this phase, `state-cli.sh phase` validates:

- [ ] `state/${TICKET_KEY}/triage.md` artifact written (step 1.10)
- [ ] `.type` field set in state (step 1.2)

### 1.11 Advance phase

```bash
# Valid
.cursor/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} investigate

# Needs info
.cursor/skills/dev-helper/scripts/state-cli.sh wait ${TICKET_KEY} awaiting-info

# Done (after user confirms destructive outcome)
.cursor/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} done
```
