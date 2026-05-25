# Forklift Console Plugin

## Coding Standards & Conventions

See [AGENTS.md](AGENTS.md) for comprehensive coding standards, best practices, and development guidelines.

## Project Context & Domain Knowledge

Additional specialized knowledge is available in `.cursor/rules/`:

### Core Context
- **Project Context:** `.cursor/rules/project-context.mdc` - Forklift domain, CRDs, migration flow, architecture
- **Code Style:** `.cursor/rules/styles.mdc` - SCSS conventions and PatternFly variables

### Personal Rules (local only, gitignored)
- **Screenshots:** `.cursor/rules/personal-taking-screenshots.mdc` - Personal screenshot workflow

### Specialized Agents (Load when needed)
- **Forklift Expert:** `.cursor/rules/agents/forklift-expert.mdc` - Deep domain knowledge, migration patterns
- **Developer:** `.cursor/rules/agents/developer.mdc` - Development best practices
- **QE Agent:** `.cursor/rules/agents/qe-agent.mdc` - Testing and quality patterns
- **UX Reviewer:** `.cursor/rules/agents/ux-reviewer.mdc` - UI/UX guidelines
- **Security Reviewer:** `.cursor/rules/agents/security-reviewer.mdc` - Security review checklist

### Backend Knowledge (For backend questions)
See routing table in `.cursor/rules/agents/forklift-expert.mdc` for complete backend file reference.
Key files:
- Architecture: `.cursor/rules/backend/architecture.mdc`
- API Types: `.cursor/rules/backend/api-types.mdc`
- Providers: `.cursor/rules/backend/providers/*.mdc`
- Plans: `.cursor/rules/backend/plans/*.mdc`

### Workflows (Reference for process questions)
- PR Preparation: `.cursor/rules/workflows/pr-preparation.mdc`
- Feature Development: `.cursor/rules/workflows/feature-development.mdc`
- Debugging: `.cursor/rules/workflows/debugging.mdc`
- Playwright Testing: `.cursor/rules/workflows/playwright-testing.mdc`
- Jira Workflow: `.cursor/rules/workflows/jira-workflow.mdc`
- Ticket Workflow: `.cursor/rules/workflows/ticket-workflow.mdc`

### Language-Specific Rules (Load based on file type)
- TypeScript: `.cursor/rules/typescript.mdc` (glob: `**/*.ts`)
- React Components: `.cursor/rules/react-components.mdc` (glob: `**/*.tsx`)
- Testing: `.cursor/rules/testing.mdc` (glob: `**/*.test.ts`, `**/*.test.tsx`)
- i18n: `.cursor/rules/i18n.mdc` - Translation utilities and patterns

## Workflows & Skills

Cursor skills in `.cursor/skills/` contain executable workflows.

### Team/Shared Skills (tracked in Git)
- **i18n/Translation:** `.cursor/skills/i18n-memsource/SKILL.md` - Memsource upload/download workflow
- **Backend Analysis:** `.cursor/skills/backend-analyzer/SKILL.md` - Analyze Go backend codebase
- **Type Updates:** `.cursor/skills/types-update/SKILL.md` - Update @forklift-ui/types

### Personal Skills (local only, gitignored)
- **Development Helper:** `.cursor/skills/personal-dev-helper/SKILL.md` - Personal dev workflow automation
- **Bug Workflows:** `.cursor/skills/personal-bug-report/`, `.cursor/skills/personal-bug-triage/`
- **Issue Triage:** `.cursor/skills/personal-issue-triage/`
- **PR Monitoring:** `.cursor/skills/personal-monitor-pr/`, `.cursor/skills/personal-track-jira-merged/`
- **Calendar Integration:** `.cursor/skills/personal-agent-calendar/`
- **Security:** `.cursor/skills/personal-cve-remediation/`
- **Utilities:** `.cursor/skills/personal-ask-more-info/`, `.cursor/skills/personal-grill-me/`

**Note:** Personal skills are gitignored but exist on your local machine - Claude Code can read them from disk.

For full workflow details, read the relevant SKILL.md file.

## Usage Guidelines

**For Claude Code:**
1. Always load `AGENTS.md` first for core standards
2. Load `.cursor/rules/project-context.mdc` for Forklift domain knowledge
3. Load specialized agent files when their expertise is needed (e.g., forklift-expert for migration questions)
4. Load language-specific rules based on file globs
5. Reference workflow files when user asks about processes (PR prep, debugging, etc.)
6. Adapt skill workflows to Claude Code tools as needed

**On-Demand Loading Pattern:**
- User asks migration question → Read `.cursor/rules/agents/forklift-expert.mdc`
- Working on SCSS → Read `.cursor/rules/styles.mdc`
- Backend question about providers → Read `.cursor/rules/backend/providers/*.mdc`
- Preparing a PR → Read `.cursor/rules/workflows/pr-preparation.mdc`
