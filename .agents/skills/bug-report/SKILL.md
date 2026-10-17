---
name: bug-report
description: Create Jira bug tickets for the MTV project with User Interface component. Use when the user mentions file a bug, create a bug, report a bug, open a ticket, jira bug, new bug ticket, or bug report.
---

# Bug Report

Creates a Jira bug ticket in the MTV project with the User Interface component
and `user-interface` label. Assignment is optional and uses a locally configured
account ID supplied for this invocation or in `JIRA_ASSIGNEE_ACCOUNT_ID`.

## Prerequisites

Credentials in `~/.jira-creds` (source it to get `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`).

## Workflow

### 1. Gather information

Collect from the user or infer from context:

| Field | Required | Notes |
|-------|----------|-------|
| Title | Yes | Short, descriptive summary |
| Description | Yes | Jira wiki markup. Include problem, impact, and fix instructions |
| Priority | Yes | Ask user. Map to Jira ID (see below) |
| Severity | No | Map to Jira ID (see below). Use when different from Priority |
| Assignee | No | Optional; set `JIRA_ASSIGNEE_ACCOUNT_ID` locally or provide an account ID when running the script |
| Labels | No | Default: `["user-interface"]` |
| Fix Version | No | Only if specified by user |

### 2. Priority mapping

| Name | Jira ID |
|------|---------|
| Blocker | 10000 |
| Critical | 10001 |
| Major | 10002 |
| Normal | 10003 |
| Minor | 10004 |

### 2b. Severity mapping

| Name | Jira ID |
|------|---------|
| Critical | 19917 |
| Important | 19918 |
| Moderate | 19919 |
| Low | 19920 |
| Informational | 19921 |

### 3. Create the ticket

```bash
source ~/.jira-creds
.agents/skills/bug-report/scripts/create-bug.sh \
  "SUMMARY" \
  "DESCRIPTION" \
  "PRIORITY_ID" \
  "ASSIGNEE_ACCOUNT_ID" (optional) \
  "LABEL1,LABEL2" \
  "SEVERITY_ID"
```

The script writes the payload to a temp file to avoid shell quoting issues, then
calls the Jira REST API. It outputs the created ticket key.

Omit `SEVERITY_ID` (pass empty string `""`) if not needed.

### 4. Report back

Return the ticket key and link: `https://redhat.atlassian.net/browse/<KEY>`

### 5. Offer to start work

After reporting the ticket key, ask:

"Would you like to start working on this now?"

If yes, initialize the dev-helper state and begin the ticket lifecycle:

```bash
.agents/skills/dev-helper/scripts/state-cli.sh init <KEY> Bug
```

Then follow the dev-helper skill starting from Phase 1 (triage).

### Note on Regression field

A Jira automation sends an email reminder asking to set the "Regression" field
after Bug creation. This field (`customfield_10623`) is **not configured on any
MTV project screen** (create, edit, or view) and cannot be set via the REST API
or the web UI. The automation email can be safely ignored until a Jira admin adds
the field to the project's screen scheme.

## Description format

Use Jira wiki markup:

- `h3.` for headings
- `*bold*` for emphasis
- `{{code}}` for inline code
- `{code}...{code}` for code blocks
- `||col1||col2||` for table headers, `|val1|val2|` for rows
- `#` for ordered lists, `*` for unordered lists

Structure descriptions with:
1. **Problem** -- what's wrong
2. **Details** -- specific findings, tables, lists of affected files
3. **Fix instructions** -- clear steps for whoever picks up the ticket
4. **Verification** -- how to confirm the fix (commands, tests)
