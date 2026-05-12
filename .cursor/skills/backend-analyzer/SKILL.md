# Backend Analyzer Skill

Invoke with: *"analyze backend"*, *"refresh backend knowledge"*, *"update backend expert"*, *"scrape forklift backend"*

## Purpose

Systematically analyze the Forklift Go backend codebase (`kubev2v/forklift`) and generate structured knowledge files as `.mdc` Cursor rules under `.cursor/rules/backend/`.

## Configuration

- **Forklift repo path**: `/Users/aturgema/Workspace/forklift`
- **Target branch**: `upstream/main`
- **Output directory**: `.cursor/rules/backend/`
- **State file**: `.cursor/skills/backend-analyzer/state.json`

## Modes

### Full Analysis (first run or forced refresh)

Run all 6 phases sequentially. Within each phase, launch parallel subagents.

### Incremental Refresh

1. Read `state.json` for `lastAnalyzedCommit`
2. Run `git fetch upstream` in the forklift repo
3. Run `git diff --name-only <lastCommit>..upstream/main` to find changed files
4. Map changed files to domain areas using the domain-to-path mapping below
5. Re-run analysis only for affected domains
6. Update `state.json`

## Domain-to-Path Mapping

| Domain file | Source paths in forklift repo |
|-------------|-------------------------------|
| `architecture.mdc` | `cmd/forklift-controller/`, `pkg/controller/controller.go`, `pkg/controller/base/`, `cmd/forklift-api/` |
| `api-types.mdc` | `pkg/apis/forklift/v1beta1/` |
| `providers/provider-controller.mdc` | `pkg/controller/provider/controller.go`, `pkg/controller/provider/validation.go`, `pkg/controller/provider/container/doc.go`, `pkg/controller/provider/web/doc.go`, `pkg/controller/provider/web/provider.go` |
| `providers/vsphere.mdc` | `pkg/controller/provider/container/vsphere/`, `pkg/controller/provider/model/vsphere/`, `pkg/controller/provider/web/vsphere/` |
| `providers/ovirt.mdc` | `pkg/controller/provider/container/ovirt/`, `pkg/controller/provider/model/ovirt/`, `pkg/controller/provider/web/ovirt/` |
| `providers/openstack.mdc` | `pkg/controller/provider/container/openstack/`, `pkg/controller/provider/model/openstack/`, `pkg/controller/provider/web/openstack/` |
| `providers/ova.mdc` | `pkg/controller/provider/container/ova/`, `pkg/controller/provider/model/ovf/`, `pkg/controller/provider/web/ova/`, `pkg/controller/ova/` |
| `providers/hyperv.mdc` | `pkg/controller/provider/container/hyperv/`, `pkg/controller/provider/model/hyperv/`, `pkg/controller/provider/web/hyperv/`, `pkg/controller/hyperv/` |
| `providers/ec2.mdc` | `pkg/provider/ec2/` |
| `providers/ocp.mdc` | `pkg/controller/provider/container/ocp/`, `pkg/controller/provider/model/ocp/`, `pkg/controller/provider/web/ocp/` |
| `plans/plan-controller.mdc` | `pkg/controller/plan/controller.go`, `pkg/controller/plan/validation.go`, `pkg/controller/plan/context/`, `pkg/controller/plan/ensurer/`, `pkg/controller/plan/util/`, `pkg/controller/migration/` |
| `plans/plan-adapters.mdc` | `pkg/controller/plan/adapter/` |
| `plans/migration-pipeline.mdc` | `pkg/controller/plan/migration.go`, `pkg/controller/plan/kubevirt.go`, `pkg/controller/plan/handler/`, `pkg/controller/plan/migrator/` |
| `plans/scheduler.mdc` | `pkg/controller/plan/scheduler/` |
| `mappings/network-map.mdc` | `pkg/controller/map/network/` |
| `mappings/storage-map.mdc` | `pkg/controller/map/storage/` |
| `infrastructure/webhooks.mdc` | `pkg/forklift-api/webhooks/` |
| `infrastructure/rest-api.mdc` | `pkg/forklift-api/services/`, `pkg/controller/provider/web/` |
| `infrastructure/virt-v2v.mdc` | `pkg/virt-v2v/` |
| `infrastructure/shared-libraries.mdc` | `pkg/lib/` |
| `infrastructure/monitoring.mdc` | `pkg/monitoring/`, `pkg/metrics/` |
| `infrastructure/host-controller.mdc` | `pkg/controller/host/` |
| `infrastructure/hook-controller.mdc` | `pkg/controller/hook/` |
| `operator/operator.mdc` | `operator/` |

## Analysis Template

Each subagent MUST follow this template when producing a `.mdc` file:

```markdown
---
description: <one-line description for Cursor rule matching>
alwaysApply: false
---

# <Domain Title>

> Analyzed from commit: `<SHA>` on `<date>`
> Source paths: `<list of paths>`

## Package Purpose

<One paragraph explaining what this code does and its role in the system>

## Key Types and Structs

<Important Go types with significant fields. Use code blocks for struct definitions.>

## Interfaces and Implementations

<How the code is extensible. List interfaces and their concrete implementations.>

## Reconciliation / Execution Flow

<Step-by-step flow for controllers. Use numbered lists or mermaid diagrams.>

## Status Conditions

<What conditions are set, when, and what they mean. Table format preferred.>

## REST API Endpoints

<If applicable: routes, methods, request/response shapes.>

## Integration Points

<What other packages this calls and what calls it. Dependency direction.>

## Configuration

<Env vars, settings, feature flags. Table format.>

## Error Patterns

<How errors are handled, common failure modes, retry behavior.>

## Frontend Relevance

<What status fields, API responses, or behaviors the console-plugin UI depends on.
Map Go fields to the TypeScript types the frontend uses.>
```

## Execution Phases

### Phase 1: Architecture + API Types (2 parallel agents)

**Agent A** -> `architecture.mdc`:
- Read: `cmd/forklift-controller/`, `cmd/forklift-api/`, `pkg/controller/controller.go`, `pkg/controller/base/`
- Focus: Entry points, deployment roles (Main vs Inventory), controller-runtime setup, how controllers are registered

**Agent B** -> `api-types.mdc`:
- Read: All files in `pkg/apis/forklift/v1beta1/`
- Focus: CRD type definitions, phase constants (from `doc.go`), condition types, validation defaults, important methods on types

### Phase 2: Providers (8 parallel agents)

One agent per provider type plus one for the common controller. Each provider agent reads the container/, model/, and web/ subdirectories for that provider type.

### Phase 3: Plans + Migration (4 parallel agents)

- Agent A: Plan controller + validation + context + migration CR controller
- Agent B: Adapter pattern (base + per-provider adapters)
- Agent C: Migration execution pipeline (migration.go, kubevirt.go, handler/, migrator/)
- Agent D: Scheduler (per-provider scheduling logic)

### Phase 4: Mappings (2 parallel agents)

- Agent A: NetworkMap controller
- Agent B: StorageMap controller

### Phase 5: Infrastructure (6 parallel agents)

- Webhooks, REST API, virt-v2v, shared libraries, monitoring, host+hook controllers

### Phase 6: Operator (1 agent)

- Ansible operator configuration

## Post-Analysis

After all phases complete:
1. Update `state.json` with new commit SHA and date
2. Run a cross-reference validation to check integration point consistency
3. Update `.cursor/rules/agents/forklift-expert.mdc` routing table
