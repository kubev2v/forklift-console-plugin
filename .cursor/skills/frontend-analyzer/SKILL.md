# Frontend Analyzer Skill

Invoke with: *"analyze frontend"*, *"refresh frontend knowledge"*, *"update frontend architect"*, *"scrape frontend pages"*

## Purpose

Systematically analyze the Forklift Console Plugin frontend codebase (`src/`) and generate structured knowledge files as `.mdc` Cursor rules under `.cursor/rules/frontend/`.

These knowledge files power the Frontend Architect agent (`architect.mdc`) by providing page-level composition maps, shared component usage indexes, and cross-feature connection graphs.

## Configuration

- **Source directory**: `src/` (this repo)
- **Output directory**: `.cursor/rules/frontend/`
- **State file**: `.cursor/skills/frontend-analyzer/state.json`

## Modes

### Full Analysis (first run or forced refresh)

Run all 5 analysis agents in parallel:

| Agent | Output file | Source paths |
|-------|-------------|--------------|
| Providers | `frontend/providers.mdc` | `src/providers/` |
| Plans | `frontend/plans.mdc` | `src/plans/` |
| Mappings | `frontend/mappings.mdc` | `src/networkMaps/`, `src/storageMaps/` |
| Overview | `frontend/overview.mdc` | `src/overview/` |
| Shared Components | `frontend/shared-components.mdc` | `src/components/`, cross-feature grep |

### Incremental Refresh

1. Read `state.json` for `lastAnalyzedDate`
2. Run `git diff --name-only --since=<lastDate> -- src/` to find changed files
3. Map changed files to knowledge areas using the domain mapping below
4. Re-run analysis only for affected areas
5. Update `state.json`

## Domain-to-Path Mapping

| Knowledge file | Source paths |
|----------------|-------------|
| `providers.mdc` | `src/providers/` |
| `plans.mdc` | `src/plans/` |
| `mappings.mdc` | `src/networkMaps/`, `src/storageMaps/` |
| `overview.mdc` | `src/overview/` |
| `shared-components.mdc` | `src/components/`, then grep across all feature dirs |

## Analysis Template

Each agent MUST follow this template:

```markdown
---
description: <one-line description for Cursor rule matching>
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
1. Update `state.json` with new date
2. Verify all 5 files exist and are under 400 lines
3. Spot-check cross-references between files for consistency
