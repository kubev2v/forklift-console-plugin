# Forklift Console Plugin

## Coding Standards & Conventions

See [AGENTS.md](AGENTS.md) for comprehensive coding standards, best practices, and development guidelines.

## Project Context & Domain Knowledge

**Canonical rule bodies** live under `.agents/rules/`. **Cursor** loads thin generated wrappers from `.cursor/rules/*.mdc` (`npm run agent-rules:generate`). **Codex** uses `.codex/` plus the `forklift-rules` skill to select canonical `.md` files.

### Core Context
- **Project Context:** `.agents/rules/project-context.md`
- **Code Style:** `.agents/rules/styles.md`

### Specialized Agents (Load when needed)
- **Forklift Expert:** `.agents/rules/agents/forklift-expert.md`
- **Developer:** `.agents/rules/agents/developer.md`
- **QE Agent:** `.agents/rules/agents/qe-agent.md`
- **UX Reviewer:** `.agents/rules/agents/ux-reviewer.md`
- **Security Reviewer:** `.agents/rules/agents/security-reviewer.md`

### Backend Knowledge (For backend questions)
See routing table in `.agents/rules/agents/forklift-expert.md`. Key files under `.agents/rules/backend/`.

### Workflows (Reference for process questions)
Under `.agents/rules/workflows/` (e.g. `pr-preparation.md`, `feature-development.md`, `playwright-testing.md`).

### Language-Specific Rules (Load based on file type)
Under `.agents/rules/` (`typescript.md`, `react-components.md`, `testing.md`, `i18n.md`).

## Workflows & Skills

Shared skills live in `.agents/skills/` (Cursor may symlink or copy from `.cursor/skills/`).

### Team/Shared Skills (tracked in Git)
- **i18n/Translation:** `.agents/skills/i18n-memsource/SKILL.md`
- **Backend Analysis:** `.agents/skills/backend-analyzer/SKILL.md`
- **Type Updates:** `.agents/skills/types-update/SKILL.md`
- **Build Tracking:** `.agents/skills/waiting-for-build/SKILL.md`
- **Rule routing (Codex):** `.agents/skills/forklift-rules/SKILL.md` — run `npm run agent-setup:validate` after rule/skill changes

For full workflow details, read the relevant SKILL.md file.

## Usage Guidelines

**For Claude Code:**
1. Always load `AGENTS.md` first for core standards
2. Load `.agents/rules/project-context.md` for Forklift domain knowledge
3. Edit canonical `.agents/rules/**/*.md` only; run `npm run agent-rules:generate` to refresh Cursor wrappers
4. Load specialized agent files when their expertise is needed
5. Reference workflow files under `.agents/rules/workflows/` for process questions
6. Adapt skill workflows to Claude Code tools as needed

**On-Demand Loading Pattern:**
- User asks migration question → Read `.agents/rules/agents/forklift-expert.md`
- Working on SCSS → Read `.agents/rules/styles.md`
- Backend question about providers → Read `.agents/rules/backend/providers/*.md`
- Preparing a PR → Read `.agents/rules/workflows/pr-preparation.md`
