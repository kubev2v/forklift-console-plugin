# Phase 2: Investigate

**Gate:** Auto-recap (present findings, continue unless user interrupts)

Deeply investigates the ticket to understand the issue and identify root cause.

---

## Prerequisites

- Triage complete (Phase 1)
- State file exists with ticket metadata

## Steps

### 2.1 Read the Jira ticket

Fetch full details (self-contained for session restarts):

```bash
source .cursor/skills/dev-helper/scripts/_config.sh
source ~/.jira-creds

curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
  "${JIRA_BASE_URL}/rest/api/2/issue/${TICKET_KEY}" | jq .

curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
  "${JIRA_BASE_URL}/rest/api/2/issue/${TICKET_KEY}/comment" \
  | jq '.comments[] | {author: .author.displayName, body: .body, created: .created}'
```

### 2.1.1 Analyze attachments

Fetch and analyze ticket attachments from the response:

- **Screenshots/images**: Download and examine. Look for error messages,
  UI state, highlighted areas. Note what page/component is shown.
- **Log files**: Read and search for errors, stack traces, relevant timestamps.
- **YAML/JSON files**: Parse and check for CRD definitions, config samples,
  or API responses that show the issue.
- **Recordings/videos**: Note their existence but skip analysis (not supported).
  Ask the user to describe what the recording shows if relevant.

```bash
source .cursor/skills/dev-helper/scripts/_config.sh
source ~/.jira-creds

curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
  "${JIRA_BASE_URL}/rest/api/2/issue/${TICKET_KEY}?fields=attachment" \
  | jq '.fields.attachment[] | {filename, mimeType, content}'
```

Save attachment analysis to the investigation artifact.

### 2.2 Discover backend PRs via Jira hierarchy

Traverse the Jira ticket graph to find backend PRs that implement the feature
or fix. Link structures vary -- the agent must reason about each case.

#### Fields to check

- `customfield_10875` (Git Pull Request) -- may contain one or more PR URLs
- `issuelinks` -- related tickets
- `parent` -- the parent ticket
- Children -- via JQL: `parent = <KEY>`

#### Traversal procedure

1. Check the ticket itself for `customfield_10875`
2. Check all linked issues
3. Check the parent ticket
4. For Epics/Feature Requests, find children and prioritize `[Dev]` stories
5. Recurse into child Epics (max 3 levels)
6. Track visited tickets to avoid cycles

#### What to do with results

- **Backend PR found:** Fetch diff, study the changes
- **Only UI PRs:** Proceed with UI-only investigation
- **No PRs found:** Ask the user or consult `forklift-expert` agent

#### Save to state

```bash
.cursor/skills/dev-helper/scripts/state-cli.sh set ${TICKET_KEY} \
  --argjson backendPRs '["https://github.com/kubev2v/forklift/pull/XXXX"]' \
  --argjson visitedTickets '["MTV-XXXX", "MTV-YYYY"]' \
  '.investigation.backendPRs = $backendPRs | .investigation.visitedTickets = $visitedTickets'
```

### 2.3 Search the UI codebase

Use `Grep`, `SemanticSearch`, and `Glob` to find related code. Trace the code
flow for the affected functionality.

### 2.3.1 Blast radius analysis

Apply the **Architect** persona (`.cursor/rules/agents/architect.mdc`) to map
the full blast radius of the change. Load the relevant frontend knowledge files
and identify ALL pages, components, and data flows that touch the affected code
-- not just the directly modified files. This surfaces cross-feature dependencies
that are easy to overlook.

### 2.4 Search the backend repo

When the issue involves backend behavior, fetch backend PRs or browse the repo:

```bash
gh pr view <PR_NUMBER> --repo kubev2v/forklift
gh pr diff <PR_NUMBER> --repo kubev2v/forklift
```

### 2.5 Assess completeness

**If enough info** -- proceed to 2.6
**If gaps remain** -- advance to `ask-more-info` (Phase 3):

```bash
.cursor/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} ask-more-info
```

### 2.6 Save investigation findings

```bash
.cursor/skills/dev-helper/scripts/state-cli.sh set ${TICKET_KEY} \
  --arg findings "SUMMARY_OF_FINDINGS" \
  --arg rootCause "ROOT_CAUSE_OR_FEATURE_APPROACH" \
  --argjson files '["file1.ts", "file2.ts"]' \
  '.investigation.findings = $findings | .investigation.rootCause = $rootCause | .investigation.affectedFiles = $files | .investigation.completedAt = (now | todate)'
```

### 2.7 Present findings

```
## Investigation Findings: ${TICKET_KEY}

**Type:** Bug / Story / Epic
**Root Cause / Approach:** ...
**Backend PRs:** (list or "None found")
**Affected Files:**
- file1.ts
- file2.ts
```

### 2.8 Save investigation artifact

Write the investigation recap to the ticket's artifact folder:

```
File: .cursor/skills/dev-helper/state/${TICKET_KEY}/investigation.md
```

Content: the findings summary from step 2.7 plus attachment analysis results,
backend PRs discovered, affected files, and root cause. Use the Write tool.

### 2.9 Advance phase

The investigate phase ALWAYS leads to `reproduce` for bugs, regardless of
whether ask-more-info was visited in between. If the agent went through
ask-more-info (Phase 3) and returned here, the same routing applies.

**For Bug tickets:** ALWAYS advance to `reproduce` (visual evidence is mandatory):
```bash
.cursor/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} reproduce
```

**For Story/Feature tickets with UI manifestation:** advance to `reproduce`.
**For Story/Feature tickets without UI:** advance to `jira-track`:
```bash
.cursor/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} jira-track
```
