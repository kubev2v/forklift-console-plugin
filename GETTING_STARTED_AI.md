# Getting Started with AI Assistance

Welcome to the Forklift Console Plugin project! This guide will help you get the most out of the AI-powered development environment.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Understanding the System](#understanding-the-system)
3. [Your First Feature](#your-first-feature)
4. [Available Agents](#available-agents)
5. [Common Workflows](#common-workflows)
6. [Jira Integration](#jira-integration)
7. [Interactive Testing](#interactive-testing)
8. [Tips and Best Practices](#tips-and-best-practices)
9. [Cheat Sheet](#cheat-sheet)

---

## Quick Start

### 1. Open the Project

Open this project in Cursor IDE. All AI rules are automatically loaded.

### 2. Set Up Development Environment

```bash
npm install
npm start          # Terminal 1: Start dev server
npm run console    # Terminal 2: Start local OpenShift console
```

### 3. Start Working

Just tell the AI what you want to do:

- _"Show my Jira tickets"_
- _"Start working on MTV-1885"_
- _"Create a new component for provider status"_
- _"Review my changes"_

That's it! The AI knows your project's standards and will guide you.

---

## Understanding the System

### What's Automatically Available

When you open this project, the AI has:

| Knowledge Area | What It Knows |
| -------------- | ------------- |
| **Project Conventions** | TypeScript, React, SCSS standards (from CLAUDE.md) |
| **Domain Context** | Forklift CRDs, provider types, migration flow |
| **Team Perspectives** | Developer, UX, QE, Security, Forklift Expert |
| **Workflows** | How to create components, debug, prepare PRs |

### How Rules Work

Rules are in `.cursor/rules/` and apply automatically:

- **Always Active**: Project context, team review agent
- **File-Specific**: TypeScript rules when editing `.ts`/`.tsx`, SCSS rules for `.scss`
- **On-Demand**: Workflows and agents you invoke explicitly

### MCP Integrations

| Service | What You Can Do |
| ------- | --------------- |
| **Jira** | Get tickets, update status, add comments, create tickets |
| **Playwright** | Test UI interactively in browser |

---

## Your First Feature

### Step-by-Step Guide

#### 1. Find Your Ticket

```
"Show my assigned Jira tickets"
```

or

```
"Start working on MTV-1885"
```

The AI will fetch ticket details, summarize requirements, and suggest where to start.

#### 2. Understand the Codebase

```
"Where should I add this feature?"
"Show me similar components"
"How do we handle provider types in this project?"
```

#### 3. Implement

```
"Create a component for [feature]"
"Add [functionality] to [component]"
```

The AI follows your project's standards automatically.

#### 4. Test

```
"Add tests for my changes"
"Test this in the browser"
"Run all checks"
```

#### 5. Review

```
"Review my code"
```

Get feedback from Developer, UX, QE, Security, and Forklift Expert perspectives.

#### 6. Submit

```
"Prepare this for PR"
```

Generates PR description, runs checks, helps update Jira.

---

## Available Agents

### Team Review (Always Active)

Automatically considers all perspectives when reviewing code.

### Deep-Dive Agents (On-Demand)

| Say This | You Get |
| -------- | ------- |
| _"as developer"_ | Code quality, architecture, performance analysis |
| _"as ux"_ | Accessibility, user experience, PatternFly patterns |
| _"as qe"_ | Edge cases, test coverage, error scenarios |
| _"as security"_ | Vulnerabilities, input validation, auth issues |
| _"as forklift expert"_ | CRD patterns, migration lifecycle, provider handling |

### Example Usage

```
"As QE, what edge cases am I missing?"
"As UX, is this form accessible?"
"As security, review this input handling"
"As forklift expert, is this provider operation correct?"
```

---

## Common Workflows

### Creating a Component

```
"Create a new component for [purpose]"
```

AI creates proper folder structure, files, types, styles, and translations.

### Debugging

```
"Help me debug this issue"
"Why isn't this component updating?"
"This API call is failing, help me fix it"
```

### Code Review

```
"Review this code"             # Quick multi-perspective
"As developer, review this"    # Deep-dive specific
```

### Preparing a PR

```
"Is this ready for PR?"
"Prepare PR description for MTV-1885"
```

---

## Jira Integration

### Get Your Tickets

```
"Show my assigned tickets"
"What's in the current sprint?"
"Find tickets about [topic]"
```

### Work on a Ticket

```
"Start working on MTV-1885"
```

Fetches details and requirements, suggests where to start.

### Update a Ticket

```
"Add comment to MTV-1885: [message]"
"Move MTV-1885 to Code Review"
```

### Create a Ticket

```
"I found a bug"
"Create a feature ticket"
```

---

## Interactive Testing

### Using Playwright MCP

Ensure your dev server is running, then:

```
"Navigate to the provider list page"
"Click on the first provider"
"Take a screenshot"
"Test the creation form"
```

### Debugging with Playwright

```
"The button isn't working, let me see the page"
"Check for console errors"
"Show me the network requests"
```

---

## Tips and Best Practices

### Be Specific

```
Bad:  "Fix this"
Good: "Fix the null pointer error in ProviderList when no providers exist"

Bad:  "Make a component"
Good: "Create a component for displaying migration plan status badges"
```

### Use Agents for Deep Analysis

```
# Quick check
"Review this code"

# Deep dive when needed
"As security, thoroughly review this form handling"
```

### Let AI Know Your Context

```
"I'm working on MTV-1885 which adds bulk VM selection"
"I'm updating the provider details page"
```

### Ask for Explanations

```
"Why does this pattern exist?"
"Explain how useK8sWatchResource works"
"What's the difference between cold and warm migration?"
```

---

## Cheat Sheet

### Quick Commands

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

### Agent Invocations

| Perspective | Say... |
| ----------- | ------ |
| Developer | _"as developer"_ |
| UX | _"as ux"_ |
| QE | _"as qe"_ |
| Security | _"as security"_ |
| Forklift Expert | _"as forklift expert"_ |

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

## Troubleshooting

### AI Not Following Standards

The AI should automatically follow project standards. If not:
- Be explicit: _"Following our coding standards, create..."_
- Reference rules: _"Use the patterns from CLAUDE.md"_

### Jira Not Working

- Ensure Jira MCP is configured with valid credentials in `.cursor/mcp.json`
- Check that you have access to the MTV project

### Playwright Not Working

- Ensure dev server is running (`npm start`)
- Check that the console URL is accessible

### Rules Not Loading

- Verify you're in Cursor (not VS Code)
- Check `.cursor/rules/` directory exists
- Try restarting Cursor

---

## Getting Help

### Within the AI

```
"How do I [task]?"
"What's the best way to [approach]?"
"Explain [concept]"
```

### Documentation

- **GETTING_STARTED_AI.md** -- This guide
- **CLAUDE.md** -- Project coding standards
- **AI_README.md** -- AI configuration overview
- **README.md** -- Project setup and development

### Team

- Jira: MTV project on issues.redhat.com
