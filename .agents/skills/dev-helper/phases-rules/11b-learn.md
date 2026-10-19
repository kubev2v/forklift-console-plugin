# Forklift: Learning Rules

## Lightweight clear tickets
- If complexity is `clear` and the PR has **zero** review comments, set
  `.learn.status = "reviewed-skipped"` without a learn subagent.
- If `clear` but comments exist, review **comments only** (expand to specific
  files only when a comment requires it).

## Channel 1: Project Rule Update Targets

| Category | Rule update target |
|----------|-------------------|
| New CRD or resource type | `.agents/rules/project-context.md` |
| New provider type or status | `.agents/rules/project-context.md`, `.agents/rules/agents/forklift-expert.md` |
| New shared utility or hook | `AGENTS.md` |
| New convention or anti-pattern | `AGENTS.md` |
| New test pattern or mock | `.agents/rules/workflows/playwright-testing.md` |
| New i18n pattern | `.agents/rules/frontend/*` |
| PatternFly / component pattern | `.agents/rules/frontend/*` |
| Security or trust boundary | `.agents/rules/backend/**` or `AGENTS.md` |
| Backend API insight | `.agents/rules/backend/**` |

## Channel 2: Lesson Theme Routing

| Category | Lesson theme file |
|----------|-------------------|
| CRD / provider / architecture | `lessons/architecture.md` |
| Shared utility / hook / test | `lessons/implementation.md` |
| i18n / PatternFly / component | `lessons/ui-patterns.md` |
| Workflow / PR / CI behavior | `lessons/process.md` |
| Security / trust boundary | `lessons/security.md` |
| PR description / commit style | `lessons/communication.md` |
