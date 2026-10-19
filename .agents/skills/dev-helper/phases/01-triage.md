<!-- FALLBACK REFERENCE: Use phases/quick-ref.md for normal flow.
     Read this file ONLY if a step fails or you need error recovery details. -->

# Phase 1: Triage



**Gate:** Auto-recap for valid outcomes; gate destructive outcomes (wrong team, duplicate, invalid)

Evaluates ticket validity before investing investigation time. Also performs a
minimal Jira claim (Assigned, component) so others know the ticket is
being looked at.

---

## Steps

### 0. Load project rules

**Before doing anything else in this phase**, check if the file
`.agents/skills/dev-helper/phases-rules/01-triage.md` exists. If it does,
read it now. It contains project-specific agent personas, coding standards,
and conventions that MUST be applied during this phase. Do not skip this step.


### 0b. Use provided scripts for all external operations

All Jira API calls MUST use the scripts in `scripts/`:
- `jira-transition.sh` for status changes
- `jira-track.sh` for field updates (component, sprint, points, etc.)
- `_config.sh` for credentials and config (source it, don't parse creds manually)

Do NOT use raw `curl` for Jira or raw `gh` commands for operations that have
a dedicated script. The scripts handle auth, error recovery, and state updates.

### 1.0 Minimal claim

Set the component so the ticket is visibly owned. Status transition depends on ticket type:

- **Bug**: transition to `ASSIGNED` — this is how the developer picks up the bug. All subsequent status changes are PR-lifecycle driven.
- **Story**: stay `New` — no status change at triage. `In Progress` happens at Phase 10 when the PR is posted.
- **Epic**: stay `New` — no status change. `In Progress` is triggered automatically when the first child Story goes `In Progress` (Phase 10).
- **Feature Request**: stay `New` — dev-helper does not auto-transition Feature Requests.

Since the ticket type is not known until step 1.1 fetches the ticket, set the component first, then apply the conditional transition after 1.1:

**Part A — run immediately (component only):**

```bash
source .agents/skills/dev-helper/scripts/_config.sh
.agents/skills/dev-helper/scripts/jira-track.sh set-component ${TICKET_KEY} "${JIRA_COMPONENT_ID}"
```

**Part B — run after step 1.1 reveals the type (Bug only):**

```bash
source ~/.jira-creds

ISSUE_INFO=$(curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
  "${JIRA_BASE_URL}/rest/api/2/issue/${TICKET_KEY}?fields=status,issuetype")
CURRENT_TYPE=$(echo "$ISSUE_INFO" | jq -r '.fields.issuetype.name')
CURRENT_STATUS=$(echo "$ISSUE_INFO" | jq -r '.fields.status.name')

if [[ "$CURRENT_TYPE" == "Bug" && "$CURRENT_STATUS" == "New" ]]; then
  .agents/skills/dev-helper/scripts/jira-transition.sh ${TICKET_KEY} "ASSIGNED"
  echo "Bug ${TICKET_KEY}: New -> ASSIGNED"
else
  echo "${CURRENT_TYPE} ${TICKET_KEY}: stays at ${CURRENT_STATUS} (no triage transition)"
fi
```

### 1.1 Fetch ticket details

```bash
source .agents/skills/dev-helper/scripts/_config.sh
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

.agents/skills/dev-helper/scripts/state-cli.sh get ${TICKET_KEY} 2>/dev/null || \
  .agents/skills/dev-helper/scripts/state-cli.sh init ${TICKET_KEY} "${TYPE}"

.agents/skills/dev-helper/scripts/state-cli.sh set ${TICKET_KEY} \
  --arg type "${TYPE}" \
  '.type = $type'
```

### 1.2b Epic handling

If the ticket type is **Epic**:
- Epics are containers for child Stories — they do NOT get branches or PRs
- After triage and investigation, suggest working on a specific child Story
- Skip Phases 4 (Reproduce), 7-10 (Implement through Send PR) for the Epic
- The Epic's Jira status follows its children: In Progress when any child
  starts, Closed when all children are done (Phase 12 step 12.6 handles this)
- If the user wants to plan the Epic's child Stories, proceed to Phase 6
  (Design) to create a breakdown, then create child Stories on Jira

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
source .agents/skills/dev-helper/scripts/_config.sh
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
gh pr view <PR_NUMBER> --repo $GH_BACKEND_REPO --json state,mergeable
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
- **clear**: Fix a typo (wrong i18n key). Missing null check. Enum update. Add a new entity type following an existing documented checklist. Add a field to a details page (known pattern).
- **complicated**: Status logic bug -- need to trace evaluation order. Validation gap -- need to find where checks live (form vs submit vs API). Performance regression -- need to profile before knowing the fix.
- **complex**: Build UX for an unfamiliar CRD or API. Redesign a multi-step flow where which steps apply is unclear. Integrate with a system whose API contract is still evolving.

For project-specific examples, see `phases-rules/01-triage.md`.

**Work size** -- estimated implementation scope (independent of certainty):

| Level | Definition |
|-------|-----------|
| `small` | 1-3 files, single component/area |
| `medium` | 4-10 files, crosses component boundaries |
| `large` | 10+ files, multiple features affected |

Default to `complicated` / `medium` when uncertain.

```bash
.agents/skills/dev-helper/scripts/state-cli.sh set ${TICKET_KEY} \
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
File: .agents/skills/dev-helper/state/${TICKET_KEY}/triage.md
```

Content: the triage outcome summary from step 1.9 (outcome, clarity, ownership,
duplicates, blockers, scope). Use the Write tool.

## Completion Checklist

Before advancing from this phase, `state-cli.sh phase` validates:

- [ ] `.agents/skills/dev-helper/state/${TICKET_KEY}/triage.md` artifact written (step 1.10)
- [ ] `.type` field set in state (step 1.2)

### 1.11 Advance phase

```bash
# Valid
.agents/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} investigate

# Needs info
.agents/skills/dev-helper/scripts/state-cli.sh wait ${TICKET_KEY} awaiting-info

# Done (after user confirms destructive outcome)
.agents/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} done
```
