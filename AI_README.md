# AI Assistant Guide

This project includes Cursor AI rules that provide consistent coding assistance across the team. When you open this project in Cursor, these rules are automatically loaded.

**CLAUDE.md** is the source of truth for conventions; `.cursor/rules/` supplements it.

---

## Quick Start

1. Open the project in Cursor
2. Set up your environment:

```bash
npm install
npm start          # Terminal 1: Start dev server
npm run console    # Terminal 2: Start local OpenShift console
```

3. Start coding -- the AI already knows your project's standards
4. Try: _"Show my Jira tickets"_, _"Start working on MTV-1885"_, _"Review this code"_, _"Test this in the browser"_

---

## How Rules Work

Rules are in `.cursor/rules/` and apply automatically:

- **Always Active**: Project context only (`project-context.mdc`)
- **File-Specific**: TypeScript rules when editing `.ts`/`.tsx`, SCSS rules for `.scss`, etc.
- **On-Demand**: Workflows and agents you invoke explicitly

| Knowledge Area | What It Knows |
| -------------- | ------------- |
| **Project Conventions** | TypeScript, React, SCSS standards (from CLAUDE.md) |
| **Domain Context** | Forklift CRDs, provider types, migration flow |
| **Team Perspectives** | Developer, UX, QE, Security, Forklift Expert |
| **Workflows** | How to create components, debug, prepare PRs |

---

## Your First Feature

1. **Find your ticket**: _"Show my assigned Jira tickets"_ or _"Start working on MTV-1885"_
2. **Understand the codebase**: _"Where should I add this feature?"_, _"Show me similar components"_
3. **Implement**: _"Create a component for [feature]"_
4. **Test**: _"Add tests for my changes"_, _"Test this in the browser"_
5. **Review**: _"Review my code"_ (multi-perspective feedback)
6. **Submit**: _"Prepare this for PR"_

---

## Agents

### Team Review (Invoked)

Invoke with _"Review my code"_ or _"review:dev"_ (or _review:ux_, _review:qe_, _review:security_, _review:forklift_). Considers all perspectives when reviewing code.

### Deep-Dive Agents

| Say This | You Get |
| -------- | ------- |
| _"as developer"_ | Code quality, architecture, performance |
| _"as ux"_ | Accessibility, UX patterns, PatternFly |
| _"as qe"_ | Edge cases, test coverage, error scenarios |
| _"as security"_ | Vulnerabilities, input validation, auth |
| _"as forklift expert"_ | CRD patterns, migration lifecycle, provider handling |

---

## Workflows

| Workflow | Invoke With | Purpose |
| -------- | ----------- | ------- |
| `new-component` | _"create component"_ | Component creation with proper structure |
| `pr-preparation` | _"prepare PR"_ | Pre-PR checklist and description |
| `debugging` | _"help debug"_ | Systematic debugging approach |
| `jira-workflow` | _"my tickets"_, _"search jira"_ | Jira search, update, create tickets |
| `ticket-workflow` | _"MTV-XXX"_, Jira URL | Full agent tracking for ticket work |
| `playwright-testing` | _"test in browser"_ | Interactive UI testing |
| `feature-development` | _"full workflow"_ | End-to-end: Jira to Code to PR |

---

## Jira Integration

**Setup:** Jira MCP requires `.cursor/mcp.json` (gitignored). Configure it with your Jira credentials before using Jira commands.

```
"Show my assigned tickets"
"Start working on MTV-1885"
"Add comment to MTV-1885: [message]"
"Move MTV-1885 to Code Review"
"I found a bug"
```

---

## Interactive Testing (Playwright)

Ensure your dev server is running, then:

```
"Navigate to the provider list page"
"Click on the first provider"
"Take a screenshot"
"Test the creation form"
```

---

## Tips

- **Be specific**: _"Fix the null pointer error in ProviderList when no providers exist"_ beats _"Fix this"_
- **Use agents for deep analysis**: _"As security, review this form handling"_
- **Give context**: _"I'm working on MTV-1885 which adds bulk VM selection"_
- **Ask for explanations**: _"Why does this pattern exist?"_, _"What's the difference between cold and warm migration?"_

---

## Cheat Sheet

| Want To... | Say... |
| ---------- | ------ |
| Get my tickets | _"Show my assigned tickets"_ |
| Start a task | _"Start working on MTV-XXXX"_ |
| Create component | _"Create a component for X"_ |
| Add tests | _"Add tests for this"_ |
| Review code | _"Review my changes"_ |
| Prepare PR | _"Prepare this for PR"_ |
| Debug issue | _"Help me debug this"_ |
| Test in browser | _"Test this page"_ |

### NPM Scripts

| Command | Purpose |
| ------- | ------- |
| `npm start` | Start dev server |
| `npm run console` | Start local OpenShift console |
| `npm run lint` | Lint check |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run i18n` | Update translations |

---

## Personal Customization

Create `.cursor/rules/personal-<name>.mdc` -- it's gitignored. Add your preferences (e.g., shortcuts, conventions).

---

## Troubleshooting

- **Rules not loading?** Ensure you're in Cursor (not VS Code); check `.cursor/rules/` exists; restart Cursor.
- **Jira not working?** Ensure Jira MCP is configured in `.cursor/mcp.json` with valid credentials.
- **Playwright not working?** Ensure dev server is running (`npm start`).
- **AI not following standards?** Be explicit: _"Following our coding standards, create..."_

---

## Contributing to Rules

Edit files in `.cursor/rules/`, keep them focused, avoid duplicating CLAUDE.md, and submit a PR.
