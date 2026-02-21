# AI Assistant Configuration

This project includes Cursor AI rules that provide consistent coding assistance across the team. When you open this project in Cursor, these rules are automatically loaded.

> **New to the project?** See [GETTING_STARTED_AI.md](./GETTING_STARTED_AI.md) for a comprehensive guide.

---

## Quick Start

1. Open the project in Cursor
2. Start coding -- the AI already knows your project's standards
3. Try these commands:
   - _"Show my Jira tickets"_ -- See your assigned work
   - _"Start working on MTV-1885"_ -- Fetch ticket and begin
   - _"Review this code"_ -- Get multi-perspective feedback
   - _"Test this in the browser"_ -- Interactive testing

---

## What's Included

### Core Configuration

| Source | Description |
| ------ | ----------- |
| `CLAUDE.md` | Project conventions, coding standards, development commands (always active) |
| `project-context` | Forklift domain knowledge: CRDs, provider types, migration flow |
| `team-review` | Multi-perspective review agent (Developer, UX, QE, Security, Forklift Expert) |

### File-Specific Rules (Activate When Relevant Files Open)

| Rule | Triggers On | Description |
| ---- | ----------- | ----------- |
| `react-components` | `*.tsx` | PatternFly usage, Console SDK patterns |
| `typescript` | `*.ts`, `*.tsx` | Advanced type patterns, Forklift API types |
| `testing` | `*.test.ts`, `testing/**` | Jest and Playwright patterns |
| `styles` | `*.scss` | PatternFly v6 variable reference |
| `i18n` | `locales/**` | Translation patterns |

### Agent Personas (Deep-Dive Reviews)

| Agent | Invoke With | Focus |
| ----- | ----------- | ----- |
| `developer` | _"as developer"_ | Code quality, architecture, performance |
| `ux-reviewer` | _"as ux"_ | Accessibility, UX patterns, PatternFly |
| `qe-agent` | _"as qe"_ | Testing, edge cases, race conditions |
| `security-reviewer` | _"as security"_ | Vulnerabilities, XSS, auth |
| `forklift-expert` | _"as forklift expert"_ | Forklift CRDs, migration lifecycle, provider patterns |

### Workflows

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

## MCP Integrations

### Jira

```
"Show my assigned tickets"
"Start working on MTV-1885"
"Add comment to MTV-1885"
```

### Playwright (Browser Testing)

```
"Navigate to the provider list page"
"Click the Create button"
"Take a screenshot"
```

---

## Quick Reference

### Common Commands

| Want To... | Say... |
| ---------- | ------ |
| Get my tickets | _"Show my assigned tickets"_ |
| Start a task | _"Start working on MTV-XXXX"_ |
| Create component | _"Create a component for X"_ |
| Add tests | _"Add tests for this"_ |
| Review code | _"Review my changes"_ |
| Deep review | _"As [role], review this"_ |
| Prepare PR | _"Prepare this for PR"_ |
| Debug issue | _"Help me debug this"_ |
| Test in browser | _"Test this page"_ |

### Agent Quick Reference

| Say | You Get |
| --- | ------- |
| _"as developer"_ | Code quality, architecture analysis |
| _"as ux"_ | Accessibility, UX review |
| _"as qe"_ | Edge cases, test coverage analysis |
| _"as security"_ | Security vulnerability check |
| _"as forklift expert"_ | Forklift domain expertise |

### NPM Commands

```bash
npm start              # Start dev server
npm run console        # Start local OpenShift console
npm run lint           # Lint check
npm run lint:fix       # Auto-fix lint issues
npm test               # Run unit tests
npm run test:e2e       # Run Playwright E2E tests
npm run i18n           # Update translations
npm run validate-commits  # Validate commit format
```

---

## Personal Customization

Create personal rules that aren't shared with the team:

1. Create: `.cursor/rules/personal-<name>.mdc`
2. It's automatically gitignored
3. Add your preferences

Example `.cursor/rules/personal-shortcuts.mdc`:

```markdown
---
description: My personal shortcuts
alwaysApply: true
---

When I say "qc", run: npm run lint && npm test
When I say "fmt", run: npm run lint:fix
```

---

## File Structure

```
.cursor/rules/
  project-context.mdc          # Always active
  team-review.mdc              # Always active
  react-components.mdc         # *.tsx files
  typescript.mdc               # *.ts, *.tsx files
  testing.mdc                  # *.test.ts, testing/**
  styles.mdc                   # *.scss files
  i18n.mdc                     # locales/**
  agents/
    developer.mdc
    ux-reviewer.mdc
    qe-agent.mdc
    security-reviewer.mdc
    forklift-expert.mdc
  workflows/
    new-component.mdc
    pr-preparation.mdc
    debugging.mdc
    jira-workflow.mdc
    ticket-workflow.mdc
    playwright-testing.mdc
    feature-development.mdc
```

---

## Contributing to Rules

1. Edit files in `.cursor/rules/`
2. Keep rules focused and organized
3. Avoid duplicating content from `CLAUDE.md`
4. Include examples where helpful
5. Test that they work as expected
6. Submit a PR with your changes

---

## Troubleshooting

### Rules not loading?
- Ensure you're using Cursor (not VS Code)
- Check that `.cursor/rules/` exists
- Restart Cursor

### MCP not working?
- Jira: Check credentials are configured in `.cursor/mcp.json`
- Playwright: Ensure dev server is running (`npm start`)

### AI not following rules?
- Be explicit: _"Following our coding standards, create..."_
- Reference specific rules if needed
