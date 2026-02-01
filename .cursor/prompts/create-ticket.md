# Ticket Creation Workflow

Use this workflow when the user wants to create a new Jira ticket.

## Trigger Phrases
- "I found a bug"
- "Create a ticket"
- "Report an issue"
- "I want to request a feature"

## Bug Ticket Flow

When user reports a bug, gather the following information by asking one question at a time:

### Required Information

1. **Summary**: "What's a one-line description of the bug?"
   - Keep it concise but descriptive
   - Example: "Provider list doesn't load after page refresh"

2. **Affected Version**: "Which version did you see this in?"
   - Example: "2.6.3" or "main branch"

3. **Environment**: "What platform/browser are you using?"
   - Example: "OpenShift 4.14, Chrome 120"

4. **Steps to Reproduce**: "What steps trigger the bug?"
   - Get numbered list of steps
   - Be specific and detailed

5. **Expected Behavior**: "What should happen?"
   - Brief description of correct behavior

6. **Actual Behavior**: "What actually happens instead?"
   - Include any error messages

7. **Priority**: "How critical is this? (Blocker/Critical/Major/Minor/Trivial)"
   - Blocker: System unusable
   - Critical: Major functionality broken
   - Major: Significant issue with workaround
   - Minor: Small issue, low impact
   - Trivial: Cosmetic or minor inconvenience

8. **Attachments**: "Do you have any screenshots, logs, or YAML files to attach?"
   - Note what attachments are provided

### Create the Ticket

After gathering all information, format and show the user a preview:

```
**Type**: Bug
**Summary**: [summary]
**Priority**: [priority]
**Component**: User Interface
**Affects Version**: [version]

**Description**:
## Environment
- Version: [version]
- Platform: [environment]

## Steps to Reproduce
1. [step 1]
2. [step 2]
...

## Expected Behavior
[expected]

## Actual Behavior
[actual]

## Additional Information
[any attachments or extra context]
```

Ask: "Should I create this ticket in the MTV project?"

If confirmed, use `create_issue` tool with:
- project_key: "MTV"
- issue_type: "Bug"
- summary: [summary]
- description: [formatted description]
- priority: [priority]

## Feature Ticket Flow

When user requests a feature, gather:

1. **Summary**: "What's the feature title?"

2. **User Story**: "Who needs this and why?"
   - Format: "As a [role], I want [capability] so that [benefit]"

3. **Acceptance Criteria**: "What defines 'done' for this feature?"
   - Get a checklist of requirements

4. **Priority**: "How important is this?"

5. **Technical Notes**: "Any technical considerations or constraints?"

### Create the Ticket

Format preview:

```
**Type**: Story
**Summary**: [summary]
**Priority**: [priority]
**Component**: User Interface

**Description**:
## User Story
[user story]

## Acceptance Criteria
- [ ] [criterion 1]
- [ ] [criterion 2]
...

## Technical Notes
[notes if any]
```

Use `create_issue` tool with:
- project_key: "MTV"
- issue_type: "Story"
- summary: [summary]
- description: [formatted description]
- priority: [priority]

## After Creation

After successfully creating the ticket:
1. Provide the ticket URL: https://issues.redhat.com/browse/MTV-XXXX
2. Ask if the user wants to:
   - Start working on it immediately
   - Assign it to someone
   - Add additional labels or components
