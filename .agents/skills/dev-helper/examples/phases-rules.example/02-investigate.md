# Forklift: Investigation Rules

## Agent Personas
- **Forklift Expert** (`.agents/rules/agents/forklift-expert.md`): Migration
  patterns, provider behavior, CRD semantics, domain-specific constraints

## Blast Radius
- Apply the **Architect** persona (`.agents/rules/agents/architect.md`)
- Load frontend knowledge files from `.agents/rules/frontend/`
- Use the blast-radius checklist from `.agents/rules/frontend/providers.md` when the ticket touches
  provider types

## Backend PR Discovery
- Backend repo: configured in `github.backendRepo` (kubev2v/forklift)
- Check `customfield_10875` (Git Pull Request field), linked issues, parent
  ticket, children via JQL — up to 3 levels deep
