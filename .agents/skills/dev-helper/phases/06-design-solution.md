<!-- FALLBACK REFERENCE: Use phases/quick-ref.md for normal flow.
     Read this file ONLY if a step fails or you need error recovery details. -->

# Phase 6: Design Solution



**Gate:** GATED by default (configurable via `phases.gates` in config)

Designs the solution using multiple agent perspectives and creates a comprehensive
implementation plan.

---

## Prerequisites

- Investigation complete (Phase 2)
- State file has `investigation.findings` and `investigation.rootCause`

## Agent Personas

**Orchestrator injects personas by complexity** (do not load all by default):

- **`clear`**: Developer + QE only
- **`complicated` / `complex`**: Developer + QE + Architect + UX + domain expert
  (e.g. Forklift Expert)

Apply only the personas listed in the subagent prompt. Project paths live in
`phases-rules/06-design-solution.md` when present.

## Steps

### 0. Load project rules

**Before doing anything else in this phase**, check if the file
`.agents/skills/dev-helper/phases-rules/06-design-solution.md` exists. If it does,
read it now. It contains project-specific agent personas, coding standards,
and conventions that MUST be applied during this phase. Do not skip this step.

### 6.0 Switch to Plan mode

Call `SwitchMode` with `target_mode_id: "plan"` and explanation:
"Switching to plan mode for design phase -- all design work should be
read-only until the plan is approved."

If already in plan mode, skip this step.

### 6.1 Search for similar patterns

Before designing, search the codebase for:
- How similar issues were solved before
- Existing components/utilities that can be reused
- Patterns that the solution should follow for consistency

Use `SemanticSearch` and `Grep` to find relevant code.

### 6.2 Consider UX implications

From the UX perspective (see `.agents/rules/agents/ux-reviewer.md` and
`.agents/rules/agents/forklift-ux-patterns.md`):
- What would be the most intuitive behavior for the user?
- Are there loading/error/empty states to handle?
- Does the change affect keyboard navigation or accessibility?
- Are there PatternFly components that fit this use case?
- Draft the **Structural layout** section (and `layout-plan.md` when required).

**Feature completeness check** (for features that add a new entity or provider):
Apply the **Architect** persona (`.agents/rules/agents/architect.md`) to run a
full blast radius analysis. The Architect loads frontend knowledge files and
maps every page, component, and data flow affected by the new feature -- wizard,
details page, tips panel, icons, lists, filters, mappings, plans, etc.

### 6.3 Consider development limitations

- Are there TypeScript type constraints (e.g., `@forklift-ui/types` gaps)?
- Are there backend API limitations that constrain the UI?
- Are there performance implications (large lists, frequent re-renders)?
- Does the change affect multiple provider types?

### 6.4 Consider testing approach

- What unit tests are needed?
- Are E2E tests appropriate for this change?
- What edge cases should be covered?
- Are there existing test patterns to follow?

### 6.5 Create the plan

Call Cursor's `CreatePlan` tool with the design content. The `plan` parameter
**must** follow this template -- do not deviate from the section structure:

```markdown
# Design: ${TICKET_KEY} -- [short title]

## Problem (2-3 sentences)
[What is wrong or what is being added. Not the solution -- the problem.]

## Approach
[What will change and why this approach was chosen over alternatives.
 Reference specific file paths and code snippets.
 Include a mermaid diagram if the change involves new data flows,
 component hierarchies, or multi-step processes.]

## Structural layout

Required when the ticket has **UI impact** (see `phases-rules/06-design-solution.md`).
Omit only for backend-only or non-UI changes.

**Screen type:** list | details | wizard | modal | inline panel | other

**Reference screens in plugin:** (paths to closest existing MTV pages)

**Component tree:** (indented markdown or mermaid — PatternFly components by name)

**Regions:** (title, alerts, toolbar, main, side panel, footer actions)

**Primary action / secondary actions:**

**Navigation & wayfinding:** (tabs, breadcrumbs, links, empty paths)

**States by region:** loading | empty | error | success | partial data

**Content notes:** (labels, helper text, error copy — English keys for i18n)

**A11y notes:** (focus order, modal focus trap, live regions, keyboard path)

For **complicated** or **complex** tickets with UI impact that add a new surface
or change navigation, also write an expanded
`.agents/skills/dev-helper/state/${TICKET_KEY}/layout-plan.md` (same headings;
optional ASCII wireframe) and reference it from this section.

## Alternatives Considered
[Options considered. For each: what it is, pros, cons, chosen/rejected.
 If any option is unresolved -- STOP and ask the user.]

## Scope
**In scope:** [explicit list]
**Out of scope:** [explicit list]

## Test Plan
[What tests to write. What they verify. Edge cases to cover.]

## Risks / Trade-offs
[What are we giving up? What could go wrong?]
```

Pass implementation tasks via the `todos` parameter of `CreatePlan`. Each todo
should be a concrete step listing the target files and what changes. This
replaces a separate "Files Affected" section -- the todos carry that
information implicitly:

```
todos: [
  { id: "1", content: "Add WAIT_FOR_GUEST_REBOOTS_NAME constant to utils/utils.ts" },
  { id: "2", content: "Create PostMigrationAlert component in components/" },
  { id: "3", content: "Wire PostMigrationAlert into MigrationProgressTable.tsx" },
  { id: "4", content: "Add unit tests for getVMMigrationStatus in utils.test.ts" },
]
```

**HARD CONSTRAINT**: If "Alternatives Considered" has unresolved options (the
agent is uncertain which path to take), the plan MUST stop and ask the user
before proceeding. Do not assume the answer.

### 6.6 Present for approval

`CreatePlan` presents the design to the user for approval. If findings were
identified during the design review, classify each one:

- **REQUIRED** -- must be resolved before implementation begins
- **SUGGESTED** -- advisory, user decides
- **POSITIVE** -- something done well (reinforces good patterns)

If this phase is gated (in `phases.gates` config), present the approval prompt:

```
A) Approve -- proceed to implement
B) Revise -- provide specific feedback; design will be updated
C) Reject -- return to investigate or re-scope the ticket
```

Do not interpret silence as approval. Wait for an explicit choice.

If not gated, present the design as FYI (with any findings) and auto-advance.

### 6.7 Save design artifact and advance phase

After the plan is approved, persist the design and advance:

1. **Save design.md** -- Write the same content passed to `CreatePlan` to:

   ```text
   .agents/skills/dev-helper/state/${TICKET_KEY}/design.md
   ```

   Use the Write tool. The `design.md` is a persisted copy of the approved
   plan -- do NOT write it before approval.

2. **Switch back to Agent mode** -- Call `SwitchMode` with
   `target_mode_id: "agent"` before advancing to the implement phase.

3. **Update state and advance:**

   If `layout-plan.md` was written, persist its path; otherwise leave
   `.design.layoutPlanFile` null (structural layout section-only is valid).

   ```bash
   .agents/skills/dev-helper/scripts/state-cli.sh set ${TICKET_KEY} \
     --arg planFile ".agents/skills/dev-helper/state/${TICKET_KEY}/design.md" \
     '.design.planFile = $planFile | .design.approvedAt = (now | todate)'

   # When layout-plan.md exists:
   .agents/skills/dev-helper/scripts/state-cli.sh set ${TICKET_KEY} \
     --arg layoutPlanFile ".agents/skills/dev-helper/state/${TICKET_KEY}/layout-plan.md" \
     '.design.layoutPlanFile = $layoutPlanFile'

   .agents/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} implement
   ```

## Completion Checklist

Before advancing from this phase, `state-cli.sh phase` validates:

- [ ] `.investigation.completedAt` field set (investigation was done before design)
- [ ] `.agents/skills/dev-helper/state/${TICKET_KEY}/design.md` artifact written (step 6.7)
