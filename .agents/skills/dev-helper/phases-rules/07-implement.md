# Forklift: Implementation Rules

## Rules to Follow
Load and follow these rules during implementation:

- `AGENTS.md` — Project coding standards (always applied)
- `.agents/rules/i18n.md` — Translation patterns
- `.agents/rules/react-components.md` — PatternFly and Console SDK patterns
- `.agents/rules/styles.md` — SCSS guidelines
- `.agents/rules/typescript.md` — TypeScript guidelines
- `.agents/rules/workflows/new-component.md` — If creating new components

Prefer Cursor glob auto-loading; do not force-read all of the above unless needed.

## Agent Personas (complexity-routed)
Orchestrator injects the set to load:

### `clear`
- **Developer** (`.agents/rules/agents/developer.md`): Code quality, patterns
- **QE** (`.agents/rules/agents/qe-agent.md`): When writing unit tests

### `complicated` / `complex`
- **Developer** + **QE** + **UX** (`.agents/rules/agents/ux-reviewer.md`)
  + **Architect** (`.agents/rules/agents/architect.md`)
  + **Forklift Expert** (`.agents/rules/agents/forklift-expert.md`) when
  backend behavior is exposed in the UI

## Tests
Write unit tests during implement; human runs `npm test` in verify.
