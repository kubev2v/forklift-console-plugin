---
description: Workflow for working with Jira tickets using MCP
alwaysApply: false
---

# Jira Workflow

Invoke with: *"get my tickets"*, *"show sprint issues"*, *"update ticket"*, *"search jira"*, *"create a ticket"*, *"report a bug"*

This workflow covers Jira MCP operations. For the full development workflow (ticket to PR), see `feature-development.mdc`.

---

## Prerequisites

Jira MCP tools require **`.cursor/mcp.json`** (gitignored). Configure it with your Jira credentials before using Jira commands. Without it, Jira-related invocations will not work.

---

## 1. Finding Tickets

**Get My Assigned Tickets**
```
"Show my assigned tickets"
```
Uses `jira_search` with JQL: `assignee = currentUser() AND status != Done AND project = MTV`

**Get Current Sprint Tickets**
```
"Show current sprint tickets"
```
Uses `jira_get_sprint_issues`

**Search for Specific Tickets**
```
"Find open bugs in MTV project"
```
Uses `jira_search` with appropriate JQL

**Get Ticket Details**
```
"Get details for MTV-1885"
```
Uses `jira_get_issue` + `jira_get_issue_comments`

---

## 2. Common JQL Queries

### By Status
```jql
assignee = currentUser() AND status = "In Progress" AND project = MTV
status = "Ready for Dev" AND project = MTV
status = "Code Review" AND assignee = currentUser() AND project = MTV
```

### By Type
```jql
issuetype = Bug AND project = MTV AND status != Done
issuetype = Story AND assignee = currentUser() AND project = MTV
```

### By Time
```jql
updated >= -7d AND assignee = currentUser() AND project = MTV
created >= startOfWeek() AND project = MTV
```

### By Component
```jql
component = "User Interface" AND project = MTV AND status != Done
```

---

## 3. Updating Tickets

**Add a Comment**
```
"Add comment to MTV-1885: Started investigating the issue"
```
Uses `jira_add_comment`

**Update Status**
```
"Move MTV-1885 to Code Review"
```
Uses `jira_transition_issue`

---

## 4. Creating Tickets

### Bug Ticket Flow

When reporting a bug, gather:
1. **Summary**: One-line description (e.g., "Provider list doesn't load after page refresh")
2. **Affected Version**: Which version (e.g., "2.7.0")
3. **Steps to Reproduce**: Numbered list
4. **Expected vs Actual Behavior**
5. **Priority**: Blocker/Critical/Major/Minor/Trivial

#### Bug Template
```markdown
## Environment
- **Version**: MTV [version]
- **Platform**: OpenShift [version]
- **Browser**: [browser and version]

## Steps to Reproduce
1. [step 1]
2. [step 2]

## Expected Behavior
[what should happen]

## Actual Behavior
[what actually happens]

## Additional Context
[screenshots, logs, YAML files]
```

Use `create_issue` with project_key: "MTV", issue_type: "Bug"

### Feature Ticket Flow

When requesting a feature, gather:
1. **Summary**: Feature title
2. **User Story**: As a [role], I want [capability] so that [benefit]
3. **Acceptance Criteria**: Checklist of requirements
4. **Priority**

#### Feature Template
```markdown
## User Story
As a [role], I want [capability], so that [benefit].

## Acceptance Criteria
- [ ] [criterion 1]
- [ ] [criterion 2]

## Technical Notes
[any constraints or considerations]
```

Use `create_issue` with project_key: "MTV", issue_type: "Story"

---

## 5. Priority Levels

| Priority | When to Use | Response Time |
|----------|-------------|---------------|
| **Blocker** | System completely unusable | Immediate |
| **Critical** | Major functionality broken | Same day |
| **Major** | Significant issue, workaround exists | This sprint |
| **Minor** | Small issue, low user impact | Next sprint |
| **Trivial** | Cosmetic, nice-to-have | Backlog |

---

## 6. MCP Tool Reference

| Tool | Purpose |
|------|---------|
| `jira_search` | Find tickets with JQL |
| `jira_get_issue` | Get ticket details |
| `jira_get_issue_comments` | Read ticket comments |
| `jira_add_comment` | Add comments |
| `jira_transition_issue` | Change status |
| `jira_create_issue` | Create new tickets |

### Security Note
Jira MCP uses your account permissions. Use it only to **create** and **fetch** tickets. Review carefully before allowing status transitions or updates.

---

## 7. Tips

- Be specific: "Show bugs assigned to me in MTV" vs "show issues"
- Use project codes: "MTV-1885" not just "1885"
- Check ticket comments before starting work
- Add comments when starting/finishing work
- Document blockers in ticket comments
