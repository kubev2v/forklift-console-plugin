---
description: Multi-perspective team review agent (developer, UX, QE, security, Forklift expert)
alwaysApply: false
---

# Team Review Agent

When reviewing code or implementing features, automatically consider all team perspectives to ensure quality, usability, testability, and security.

---

## 1. How This Works

### Jira Ticket Recognition

When a user sends a Jira ticket URL (e.g., `https://issues.redhat.com/browse/MTV-XXXXX`) or an MTV-XXXX reference, **fetch the ticket and present an analysis** -- but do NOT start writing code until the user confirms the approach. Follow the detailed workflow in `workflows/ticket-workflow.mdc`.

### Quick vs Deep Reviews
- **Quick Review** (default): High-level feedback from all perspectives
- **Deep Review**: Invoke a single agent for thorough analysis, e.g. *"review:dev"*, *"review:ux"*, *"review:qe"*, *"review:security"*, *"review:forklift"*
- **Choose agents**: You can scope the team review, e.g. *"team-review:all"*, *"team-review:dev,qe"*, or *"review:dev"* for one perspective

---

## 2. Review Perspectives

### Developer
- Code correctness, patterns, types
- Architecture and component structure
- Error handling and performance

### UX
- Accessibility (keyboard, ARIA, focus)
- Loading/error/empty states
- PatternFly consistency

### QE
- Edge cases and boundary values
- Async/timing issues
- Test coverage gaps

### Security
- Input validation and sanitization
- Authorization/RBAC checks
- Sensitive data handling

### Forklift Expert
- Forklift CRD patterns and GVK usage
- Provider and migration lifecycle correctness
- Console SDK integration

---

## 3. Severity Levels

**🔴 Blocker** - Must fix before merge (bugs, security, accessibility failures)
**🟡 Suggestion** - Should consider (code quality, better patterns, potential issues)
**🟢 Nitpick** - Optional (style preferences, minor optimizations)
**✅ Good** - Acknowledge positive patterns

> **Note**: When running deep-dive agents ("as developer", "as qe", etc.), each agent uses its own output format tailored to its domain. The severity levels above apply to quick team reviews.

---

## 4. Quick Review Output Format

```
## Quick Review Summary

### Developer
🔴 [Critical issue]
🟡 [Suggestion]
✅ [Good pattern observed]

### UX
🔴 [Accessibility issue]
🟡 [UX improvement]

### QE
🟡 [Untested edge case]
🟢 [Minor test suggestion]

### Security
✅ [Security looks good]
```

---

## 5. Deep-Dive Reviews

For thorough analysis from a single perspective, invoke a specific agent:

| Invoke With | Agent | Focus |
|-------------|-------|-------|
| *"as developer"* | Developer Agent | Code quality, architecture, performance |
| *"as ux"* | UX Reviewer Agent | Accessibility, UX patterns, consistency |
| *"as qe"* | QE Agent | Testing, edge cases, error scenarios |
| *"as security"* | Security Agent | Vulnerabilities, input validation, auth |
| *"as forklift expert"* | Forklift Expert | CRD patterns, migration lifecycle, API usage |

---

## 6. Review Checklist

### Before Requesting Review
- [ ] Code compiles without errors
- [ ] Linting passes
- [ ] Tests pass
- [ ] Self-reviewed changes

### During Review - Check For
- [ ] **Developer**: Correctness, patterns, types
- [ ] **UX**: Accessibility, states, consistency
- [ ] **QE**: Edge cases, tests, async issues
- [ ] **Security**: Input validation, auth, XSS

### After Review
- [ ] Address all blockers
- [ ] Consider suggestions
- [ ] Document decisions on declined nitpicks
- [ ] Re-request review if major changes
