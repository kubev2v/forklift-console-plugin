---
name: frontend-analyzer
description: Analyze or refresh Forklift Console Plugin frontend knowledge and update the corresponding repository feature notes. Use when the user asks to analyze the frontend, refresh frontend knowledge, update the frontend architect, or scrape frontend pages.
---
# Frontend Analyzer Skill

Invoke with: *"analyze frontend"*, *"refresh frontend knowledge"*, *"update frontend architect"*, *"scrape frontend pages"*

## Purpose

Systematically analyze the Forklift Console Plugin frontend codebase (`src/`) and generate canonical Markdown rules under `.agents/rules/frontend/`.

These knowledge files power the Frontend Architect agent (`architect.md`) by providing page-level composition maps, shared component usage indexes, and cross-feature connection graphs.

## Configuration

- **Source directory**: `src/` (this repo)
- **Output directory**: `.agents/rules/frontend/`
- **State file**: `.agents/skills/frontend-analyzer/state.json`

## Modes

### Full Analysis (first run or forced refresh)

Run all 5 analysis agents in parallel:

| Agent | Output file | Source paths |
|-------|-------------|--------------|
| Providers | `frontend/providers.md` | `src/providers/` |
| Plans | `frontend/plans.md` | `src/plans/` |
| Mappings | `frontend/mappings.md` | `src/networkMaps/`, `src/storageMaps/` |
| Overview | `frontend/overview.md` | `src/overview/` |
| Shared Components | `frontend/shared-components.md` | `src/components/`, cross-feature grep |

### Incremental Refresh

1. Read `state.json` for `lastAnalyzedDate`
2. Run `git diff --name-only --since=<lastDate> -- src/` to find changed files
3. Map changed files to knowledge areas using the domain mapping below
4. Re-run analysis only for affected areas
5. Update `state.json`

## Domain-to-Path Mapping

| Knowledge file | Source paths |
|----------------|-------------|
| `providers.md` | `src/providers/` |
| `plans.md` | `src/plans/` |
| `mappings.md` | `src/networkMaps/`, `src/storageMaps/` |
| `overview.md` | `src/overview/` |
| `shared-components.md` | `src/components/`, then grep across all feature dirs |

## Analysis Template

Each agent MUST follow this template:

```markdown
---
description: <one-line description for rule routing>
alwaysApply: false
---

# <Feature Title> - Page Composition

> Analyzed on <date>

## Page Composition

<Component trees per page, 1-2 levels deep. Include route entry point.>

## Shared Component Usage

<Which src/components/* are used on these pages>

## Data Sources

<K8s watches, hooks, context providers>

## Cross-Feature Connections

<How this feature connects to others -- imports, navigation, shared data>

## Blast Radius Notes

<What else is affected when changing components here>
```

## Post-Analysis

After all agents complete:
1. Run `npm run agent-rules:generate` to refresh the Cursor wrappers
2. Update `state.json` with new date
3. Verify all 5 files exist and are under 400 lines
4. Spot-check cross-references between files for consistency
