# Phase 6: Design Solution

**Gate:** GATED by default (configurable via `phases.gates` in config)

Designs the solution using multiple agent perspectives and creates a comprehensive
implementation plan.

---

## Prerequisites

- Investigation complete (Phase 2)
- State file has `investigation.findings` and `investigation.rootCause`

## Agent Personas

Apply these perspectives during design:

- **Developer** (`.cursor/rules/agents/developer.mdc`): Architecture, code quality, patterns
- **UX** (`.cursor/rules/agents/ux-reviewer.mdc`): User experience, accessibility, states
- **QE** (`.cursor/rules/agents/qe-agent.mdc`): Testability, edge cases, coverage
- **Architect** (`.cursor/rules/agents/architect.mdc`): Blast radius analysis,
  component maps, cross-feature impact. Ensures the design accounts for all
  affected pages and data flows, not just the primary component.
- **Forklift Expert** (`.cursor/rules/agents/forklift-expert.mdc`): Apply when the
  ticket is a Story/Feature that exposes backend functionality in the UI (not pure
  UX enhancements). Use for migration patterns, provider behavior, CRD semantics,
  and domain-specific constraints.

## Steps

### 6.1 Search for similar patterns

Before designing, search the codebase for:
- How similar issues were solved before
- Existing components/utilities that can be reused
- Patterns that the solution should follow for consistency

Use `SemanticSearch` and `Grep` to find relevant code.

### 6.2 Consider UX implications

From the UX perspective:
- What would be the most intuitive behavior for the user?
- Are there loading/error/empty states to handle?
- Does the change affect keyboard navigation or accessibility?
- Are there PatternFly components that fit this use case?

**Feature completeness check** (for features that add a new entity or provider):
Apply the **Architect** persona (`.cursor/rules/agents/architect.mdc`) to run a
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

Use Cursor's `CreatePlan` tool (or markdown in chat if unavailable) with this
structure:

1. **Issue summary**: Clear, concise description of the problem or feature
2. **Root cause / feature description**: From investigation
3. **Approach**: What approach was chosen and WHY
4. **Architecture**: Component structure, data flow, API integration
5. **Decision tree**: For any ambiguous decisions, list the options considered
   and the rationale for the chosen path. **If unsure about any decision, ASK
   the user -- do not assume.**
6. **Scope**: Explicit list of what IS and IS NOT included in this change
7. **File changes**: Specific files and what changes in each
8. **Test plan**: What tests to write and what they verify
9. **Todos**: Actionable implementation steps

The plan should reference specific file paths and code snippets.

**HARD CONSTRAINT**: If the decision tree has unresolved branches (the agent
is uncertain which path to take), the plan MUST stop and ask the user before
proceeding. Do not assume the answer.

### 6.6 Present for approval

The plan is presented to the user via `CreatePlan`. If the `CreatePlan` tool is
not available, present the plan as markdown in chat.

If this phase is gated (in `phases.gates` config), wait for:

- **Approved** -> Store plan file path in state, advance to Phase 7
- **Changes requested** -> Iterate on the plan
- **Rejected** -> Redesign from a different angle

If not gated, present the plan as FYI and auto-advance.

### 6.7 Save design artifact

Write the full design plan to the ticket's artifact folder:

```text
File: .cursor/skills/dev-helper/state/${TICKET_KEY}/design.md
```

Content: the complete plan from step 6.5 (issue summary, approach, architecture,
decision tree, scope, file changes, test plan, todos). Use the Write tool.

### 6.8 Advance phase

```bash
.cursor/skills/dev-helper/scripts/state-cli.sh set ${TICKET_KEY} \
  --arg planFile ".cursor/skills/dev-helper/state/${TICKET_KEY}/design.md" \
  '.design.planFile = $planFile | .design.approvedAt = (now | todate)'

.cursor/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} implement
```
