# Jira Ticket Templates

This document defines the standard structure for creating Jira tickets that can be easily parsed and processed by AI workflows.

---

## Bug Ticket Template

When creating a bug ticket in Jira, use this structure in the Description field:

```markdown
## Environment
- **Version**: [Product version, e.g., MTV 2.6.3]
- **Platform**: [OpenShift version, e.g., 4.14]
- **Browser**: [Browser and version, e.g., Chrome 120]
- **Deployment**: [dev/staging/production]

## Steps to Reproduce
1. [First step - be specific]
2. [Second step]
3. [Continue until bug manifests]

## Expected Behavior
[Clear description of what should happen]

## Actual Behavior
[Clear description of what actually happens]

## Error Messages
```
[Paste exact error messages, console logs, or stack traces here]
```

## Screenshots/Recordings
[Attach screenshots or screen recordings]

## Related Logs
[Attach pod logs, network traces, or YAML files]

## Additional Context
[Any other relevant information, workarounds discovered, etc.]
```

### Required Jira Fields for Bugs

| Field | Required | Description |
|-------|----------|-------------|
| Summary | Yes | One-line description of the bug |
| Type | Yes | "Bug" |
| Priority | Yes | Blocker/Critical/Major/Minor/Trivial |
| Affects Version | Yes | Version where bug was found |
| Component | Yes | e.g., "User Interface" |
| Description | Yes | Use template above |
| Assignee | No | Who will fix it |
| Labels | No | Additional categorization |

---

## Feature/Story Ticket Template

When creating a feature ticket in Jira, use this structure:

```markdown
## User Story
As a [role/persona],
I want [capability/feature],
So that [benefit/value].

## Background
[Context and motivation for this feature]

## Acceptance Criteria
- [ ] [Criterion 1 - specific and testable]
- [ ] [Criterion 2]
- [ ] [Criterion 3]
- [ ] [Add more as needed]

## Technical Requirements
- [Technical constraint or requirement 1]
- [Technical constraint or requirement 2]

## UI/UX Requirements
- [Design requirements if applicable]
- [Link to mockups/wireframes]

## Out of Scope
- [What this ticket explicitly does NOT cover]
- [Helps prevent scope creep]

## Dependencies
- [Link to related tickets]
- [External dependencies]

## Definition of Done
- [ ] Code complete and reviewed
- [ ] Unit tests passing
- [ ] E2E tests added (if applicable)
- [ ] Documentation updated
- [ ] Acceptance criteria verified
```

### Required Jira Fields for Features

| Field | Required | Description |
|-------|----------|-------------|
| Summary | Yes | Feature title |
| Type | Yes | "Story" or "Task" |
| Priority | Yes | Blocker/Critical/Major/Minor/Trivial |
| Component | Yes | e.g., "User Interface" |
| Description | Yes | Use template above |
| Epic Link | Recommended | Parent epic if applicable |
| Story Points | Recommended | Complexity estimate |

---

## Quick Reference: Priority Levels

| Priority | When to Use | Response Time |
|----------|-------------|---------------|
| **Blocker** | System completely unusable, no workaround | Immediate |
| **Critical** | Major functionality broken, severe impact | Same day |
| **Major** | Significant issue, workaround exists | This sprint |
| **Minor** | Small issue, low user impact | Next sprint |
| **Trivial** | Cosmetic, nice-to-have | Backlog |

---

## Examples

### Good Bug Summary Examples
- ✅ "Migration plan wizard crashes when selecting more than 50 VMs"
- ✅ "Provider list shows infinite spinner after token expiration"
- ✅ "Network mapping dropdown empty for VMware providers"

### Bad Bug Summary Examples
- ❌ "It doesn't work"
- ❌ "Bug in migration"
- ❌ "Error"

### Good Feature Summary Examples
- ✅ "Add dark mode toggle to user settings"
- ✅ "Implement bulk VM selection for migration plans"
- ✅ "Display storage usage statistics on provider details page"

### Bad Feature Summary Examples
- ❌ "Improve UI"
- ❌ "Make it better"
- ❌ "New feature"
