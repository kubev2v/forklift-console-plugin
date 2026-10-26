---
name: bug-report
description: Create Jira bug tickets for the MTV project with User Interface component. Use when the user mentions file a bug, create a bug, report a bug, open a ticket, jira bug, new bug ticket, or bug report.
---

# Bug Report

Creates a Jira bug ticket in the MTV project with the User Interface component,
`user-interface` label, and **QA Contact** (QE contact) set to **Pedro Abreu**
(`pabreu@redhat.com`). Assignment is optional and uses a locally configured
account ID supplied for this invocation or in `JIRA_ASSIGNEE_ACCOUNT_ID`.

## Prerequisites

Credentials in `~/.jira-creds` (source it to get `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`).

## Workflow

### 1. Gather information

Collect from the user or infer from context:

| Field | Required | Notes |
|-------|----------|-------|
| Title | Yes | Short, descriptive summary |
| Description | Yes | **Brief** Jira wiki markup (see [Description format](#description-format)) |
| Priority | Yes | Ask user. Map to Jira ID (see below) |
| Severity | No | Map to Jira ID (see below). Use when different from Priority |
| Assignee | No | Optional; set `JIRA_ASSIGNEE_ACCOUNT_ID` locally or provide an account ID when running the script |
| Labels | No | Default: `["user-interface"]` |
| Fix Version | No | Only if specified by user |

**QE contact** is applied automatically by `create-bug.sh` (not a separate question).
Override only when the user asks for someone else: `JIRA_QE_CONTACT_ACCOUNT_ID`.

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
calls the Jira REST API. It sets **QA Contact** (`customfield_10470`) to Pedro
Abreu immediately after create. It outputs the created ticket key.

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

Write for a busy engineer: **short, factual, scannable**. The summary line
should carry the headline; the description adds only what is needed to reproduce
and fix. Avoid long narratives, repeated context, and large file dumps.

**Target length:** about 5–12 lines total (excluding blank lines).

Use Jira wiki markup sparingly:

- `h3.` only for section breaks (at most 3–4 sections)
- `{{code}}` for paths, selectors, or API fields — not whole paragraphs
- `*` for bullets; keep lists to 3 items unless the user provided more essentials
- Skip tables unless comparing two concrete values

**Required content (keep each section to 1–3 lines):**

1. **Problem** — what is wrong and where (page, flow, or component).
2. **Expected vs actual** — one line each, or a single sentence if obvious.
3. **Repro** — only when not obvious from the title (numbered steps, minimal).
4. **Fix hint** — optional; point to the likely area (file or behavior), not a design essay.
5. **Verify** — one line: test name, command, or quick manual check.

**Do not include:** impact essays, duplicate title text, full stack traces (link or
trim), or "fix instructions" that restate the problem.

**Example (good):**

```
h3. Problem
Plan Settings tab shows Convertor scheduling for plans that should hide it.

h3. Expected vs actual
*Expected:* Section hidden when convertor scheduling does not apply.
*Actual:* Section is visible and empty.

h3. Verify
{{npm test -- planSettingsVisibility}} and open Plan → Settings on a cold-migration plan.
```
