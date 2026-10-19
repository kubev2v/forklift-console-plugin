# Forklift: Design Rules

## Agent Personas (complexity-routed)

The orchestrator injects which personas to load. Subagents must read **only**
the injected set:

### `clear` tickets

- **Developer** (`.agents/rules/agents/developer.md`): Architecture, code
  quality, patterns
- **QE** (`.agents/rules/agents/qe-agent.md`): Testability, edge cases,
  coverage

### `complicated` / `complex` tickets

- **Developer** (`.agents/rules/agents/developer.md`)
- **QE** (`.agents/rules/agents/qe-agent.md`)
- **UX** (`.agents/rules/agents/ux-reviewer.md`): User experience,
  accessibility, structural layout
- **Architect** (`.agents/rules/agents/architect.md`): Blast radius analysis,
  component maps, cross-feature impact
- **Forklift Expert** (`.agents/rules/agents/forklift-expert.md`): When the
  ticket exposes backend functionality in the UI

## UX files (structural layout)

Whenever the design includes a **## Structural layout** section (see UI impact
below), the subagent must read:

- `.agents/rules/agents/ux-reviewer.md` (design-phase template and PF6 bar)
- `.agents/rules/agents/forklift-ux-patterns.md` (MTV reference screens)

This applies even on `clear` tickets if UI impact is true — personas may still
be Developer + QE only, but those two UX files are mandatory for the layout
section.

## UI impact trigger

Treat investigation/triage as UI-impacting when the change adds or materially
alters any of:

- List or details page, tab, or section
- Wizard step or footer actions
- Modal, drawer, or overlay
- Table columns, toolbar, filters, or bulk actions
- Alert, banner, or empty-state region

When **UI impact** is true:

1. The `CreatePlan` / `design.md` content **must** include **## Structural layout**
   (full template in `phases/06-design-solution.md` §6.5).
2. For **`complicated` or `complex`** tickets that add a new surface or change
   navigation, also write an expanded artifact:
   `.agents/skills/dev-helper/state/${TICKET_KEY}/layout-plan.md`
   (same headings as the section; optional ASCII wireframe).
3. After approval, set state:
   - `.design.planFile` — always `design.md`
   - `.design.layoutPlanFile` — path to `layout-plan.md` when that file exists;
     otherwise leave null (section-only layout is valid).

## Feature Completeness

Apply the **Architect** persona (when listed) to run a full blast radius
analysis for features that add a new entity or provider type. The Architect
loads frontend knowledge files and maps every page, component, and data flow
affected.

## TypeScript Constraints

- Check for `@forklift-ui/types` gaps when working with CRD types
