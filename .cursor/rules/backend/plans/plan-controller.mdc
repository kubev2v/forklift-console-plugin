---
description: Plan controller - reconciliation, validation conditions, lifecycle, Migration CR relationship
alwaysApply: false
---

# Plan Controller

> Analyzed from commit: `baf9c7bcc` on `2026-09-17`
> Source paths: `pkg/controller/plan/controller.go`, `pkg/controller/plan/validation.go`, `pkg/controller/plan/context/`, `pkg/controller/plan/ensurer/`, `pkg/controller/migration/`

## Package Purpose

The Plan controller (`pkg/controller/plan/controller.go`) is the central reconciler for migration plans. It watches Plan CRs plus related resources (Provider, NetworkMap, StorageMap, Hook, Migration) and drives the full lifecycle from validation through execution. `validation.go` sets plan-level conditions by validating providers, maps, VMs, hooks, VDDK, and destination constraints. `context/` aggregates referenced CRs and inventory clients for execution. `ensurer/` idempotently creates destination-cluster resources during migration.

The Migration controller (`pkg/controller/migration/controller.go`) is intentionally thin — it sets owner references, validates the plan reference and `Cancel[]` VM refs, and reflects plan snapshot status back onto the Migration CR.

---

## Key Types and Structs

### `plan.Reconciler`

```go
type Reconciler struct {
    base.Reconciler
    APIReader client.Reader  // uncached reads for Plan fetch
}
```

### `plancontext.Context`

```go
type Context struct {
    k8sclient.Client
    Plan      *api.Plan
    Map       struct { Network *api.NetworkMap; Storage *api.StorageMap }
    Migration *api.Migration
    Source    Source      // Provider, Secret, Inventory web.Client
    Destination Destination // remote OCP client, Provider, Inventory
    Hooks     []*api.Hook
    Log       logging.LevelLogger
    Labeler   Labeler
}
```

Helper methods: `SetMigration()`, `IsResumeConversion()`, `FindHook()`, `NestedVirtualizationSetting()`, `SelinuxRelabelAtBoot()`, `SelinuxRelabelExclude()`.

### `plancontext.Labeler`

Generates consistent labels: `plan=<planUID>`, `migration=<migrationUID>`, `vmID=<vmRefID>`.

### `ensurer.Ensurer`

Wraps `*plancontext.Context`; ensures destination resources exist (create-if-missing).

### `migration.Reconciler`

```go
type Reconciler struct {
    base.Reconciler
}
```

### Plan status snapshot model

`plan.Status.Migration.History[]` holds `Snapshot` objects — one per Migration run. Each snapshot captures frozen copies of Plan, Migration, providers, and maps for mutation detection.

---

## Interfaces and Implementations

| Interface / pattern | Role | Implementation |
|---|---|---|
| `reconcile.Reconciler` | Plan + Migration controllers | `plan.Reconciler`, `migration.Reconciler` |
| `web.Client` | Source/destination inventory | Built per provider in `context.Source/Destination.build()` |
| `adapter.Adapter` | Provider-specific validation | `adapter.New(provider)` → `Validator()` for warm/type checks |
| `modelbase.ConcernHolder` | VM inventory concerns | Aggregated into `VMCriticalConcerns`, `UnsupportedOVFExportSource` |
| `validation.ProviderPair` | Shared provider ref validation | `pkg/controller/validation/provider_pair.go` |

---

## Reconciliation / Execution Flow

### Plan reconcile

```
Reconcile(plan)
│
├─ 1. Fetch Plan via APIReader (abort if deleted → cleanupOrphanedResources)
├─ 2. Skip if Archived (spec.archived + status has Archived condition)
├─ 3. Skip if Succeeded (unless needs archiving)
├─ 4. Postpone if dependencies not yet reconciled
│     (Provider, NetworkMap, StorageMap, Host, Hook ObservedGeneration < Generation)
├─ 5. BeginStagingConditions()
├─ 6. validate(plan) — sets conditions on plan.Status
│     └─ If validation returns error for dangling archived plan → archive + return
├─ 7. Set PopulatorDataSource labels (one-time, post-Succeeded/Failed/Canceled)
├─ 8. Archive if spec.archived
├─ 9. Set Ready condition (if no blockers, not archived, not ValidatingVDDK)
├─ 10. EndStagingConditions()
└─ 11. execute(plan) — find/run migration, update status
```

### Plan watches

- Primary: `Plan` (with `PlanPredicate`)
- Secondary: `Provider` (inventory change channel + `ProviderPredicate`), `NetworkMap`, `StorageMap`, `Hook`, `Migration` (enqueue owning plan via `RequestForMigration`)

### Execute flow

```
execute(plan)
│
├─ If blocker/archived/reQ-condition → failExecutingMigrationOnBlocker (grace period) → return
├─ Build plancontext.Context
├─ Find active migration (from snapshot)
│   ├─ If found → SetMigration, matchSnapshot (cancel if mutated)
│   └─ If snapshot marked Canceled → propagate to all non-terminal VMs
├─ runner.Cancel() — cancel VMs marked for cancellation
├─ Find pending migrations (sorted by creationTimestamp, then name)
├─ If no active + pending exists → select first pending, create new snapshot
├─ If no migration at all → delete Executing condition, checkConversionResumable → return
├─ runner.Run() — execute the migration (see migration-pipeline.mdc)
├─ Reflect snapshot conditions (Executing/Succeeded/Failed/Canceled) onto plan.Status
└─ checkConversionResumable(plan)
```

### Migration reconcile

```
Reconcile(migration)
│
├─ 1. Fetch Migration CR
├─ 2. setOwnerReference (Plan owns Migration; skip if plan not found)
├─ 3. Skip if MarkedCompleted()
├─ 4. BeginStagingConditions()
├─ 5. validate(migration) — Plan ref, Plan Ready, Cancel[] VM refs
├─ 6. reflectPlan(plan, migration) — copy snapshot conditions to migration.Status
├─ 7. Set Ready if no blockers
├─ 8. EndStagingConditions() + Status().Update()
```

### Snapshot mutation detection

`matchSnapshot()` compares frozen snapshot copies of Plan, source/destination providers, NetworkMap, and StorageMap (skipped for `MigrationOnlyConversion`). On mismatch: snapshot and plan lose `Executing`, snapshot gets durable `Canceled` with reason `Modified`.

---

## Status Conditions

All plan conditions are set during `validate()` or execution. The UI reads `plan.status.conditions[]`. Condition `category` drives blocker behavior via `HasBlockerCondition()` (Critical + Error).

### Condition categories

| Category | Effect |
|---|---|
| `Required` | Must be present for Ready (e.g. `Ready` itself) |
| `Advisory` | Informational; does not block |
| `Critical` | Blocker — prevents execution |
| `Error` | Blocker — prevents execution |
| `Warn` | Non-blocking warning |

Plan is **Ready** when: no blocker conditions + not `Archived` + not `ValidatingVDDK`.

### Provider conditions (from `validation.ProviderPair`)

| Condition | Category | When Set |
|---|---|---|
| `SourceProviderNotValid` / `SourceProviderNotReady` | Critical | Source ref missing, not found, or not Ready |
| `DestinationProviderNotValid` / `DestinationProviderNotReady` | Critical | Destination ref missing, not found, or not Ready |

### Critical / Error blockers (plan validation)

| Condition | When Set |
|---|---|
| `NamespaceNotValid` | Target namespace empty or invalid DNS1123 |
| `NetworkMapRefNotValid` | Network map ref not set or not found |
| `NetworkMapNotReady` | Referenced NetworkMap lacks Ready |
| `StorageRefNotValid` | Storage map ref not set or not found (skipped for conversion-only) |
| `StorageMapNotReady` | Referenced StorageMap lacks Ready |
| `VMRefNotValid` | VM ref has neither ID nor Name |
| `VMNotFound` | VM not found in source inventory |
| `VMAlreadyExists` | Target VM already exists in destination |
| `DuplicateVM` | Duplicate source VM ID, duplicate targetName, or ambiguous ref |
| `VMNetworksNotMapped` | VM has networks not covered by NetworkMap |
| `VMStorageNotMapped` | VM has storage not covered by StorageMap |
| `VMStorageNotSupported` | Unsupported storage (e.g. Direct LUN/FC < oVirt 4.5.2.1) |
| `VMMultiplePodNetworkMappings` | Multiple NICs mapped to pod network |
| `VMMissingChangedBlockTracking` | Warm migration: CBT not enabled |
| `VMHasSnapshots` | Warm migration or NetApp Shift: pre-existing snapshots |
| `VMPowerStateUnsupported` | VM power state incompatible with migration type |
| `VMMigrationTypeUnsupported` | VM incompatible with selected migration type |
| `GuestToolsIssue` | VMware Tools not properly installed/running |
| `InvalidDiskSizes` | VM has disks with invalid sizes |
| `MacConflicts` | MAC address conflicts with existing destination VMs |
| `MissingPvcForOnlyConversion` | Conversion-only mode: missing vendor PVCs |
| `WarmMigrationNotReady` | Warm migration not supported from source provider |
| `MigrationTypeNotValid` | Selected migration type not supported |
| `TransferNetworkNotValid` | Transfer network NAD not found, invalid route, or wrong namespace |
| `HookNotValid` / `HookNotReady` / `HookStepNotValid` / `HookServiceAccountNotValid` | Hook ref/executable/step/SA issues |
| `ServiceAccountNotValid` | Plan SA not found in target (or plan namespace for local hooks) |
| `VDDKInvalid` | VDDK validation job failed |
| `VDDKInitImageUnavailable` | VDDK image not set (warm/raw-copy) or pull exceeded deadline |
| `UnsupportedVersion` | OCP-to-OCP: source version < 1.26 |
| `UnsupportedUserDefinedNetwork` | UDN Layer3 in destination namespace |
| `SharedDisks` | VMs with shared disks (critical category) |
| `ExcludeDisks` | Excluded disks block migration |
| `VDDKAndOffloadMixedUsage` | Mixed VDDK and copy-offload in same plan |
| `VMCriticalConcerns` | VMs have critical-category inventory concerns |
| `NetMapDestinationNADNotValid` | Multus NAD in wrong namespace |
| `NotValid` (various) | Invalid targetName, volume/network name templates |
| `VirtV2vImageNotValid` | `spec.virtV2vImage` is not a fully-qualified image ref |
| `NetAppShiftWarmNotSupported` | Warm plan with NetApp Shift/Trident destination SC |
| `NetAppShiftDatastoreNASMissing` | Shift-mapped disk datastore lacks NAS export details |

### Warnings (non-blocking)

| Condition | When Set |
|---|---|
| `TargetNameNotValid` (`NameNotValid`) | Source VM name not DNS1123-compliant (auto-renamed) |
| `HostNotReady` | VM host in maintenance mode |
| `VMMissingGuestIPs` | Cannot preserve static IPs (no guest info) |
| `VMIpNotMatchingUdnSubnet` | VM IP outside primary UDN subnet |
| `NetMapPreservingIPsOnPodNetwork` | Preserving IPs with Pod networking |
| `TransferNetworkMissingDefaultRoute` | Transfer network NAD missing route annotation |
| `SharedWarnDisks` / `ExcludeWarnDisks` | Shared/excluded disks (warning category) |
| `LuksAndClevisIncompatibility` | LUKS + Clevis configured together |
| `UnsupportedOVFExportSource` | OVA VM from unsupported OVF source |
| `ConversionHasWarnings` | Conversion produced warnings |
| `RestrictedPodSecurity` | Controller namespace has restricted pod security |
| `VMConsolidationNeeded` | Snapshots need consolidation (warm precopy delays) |
| `RDMDiskWarning` | RDM disks need copy-offload (XCOPY) |
| `IndependentDiskWarning` | Independent disks need copy-offload or VMware mode change |
| `InspectionHasConcerns` | Deep inspection produced concerns |

### Advisory (informational)

| Condition | When Set |
|---|---|
| `ValidatingVDDK` | VDDK image validation in progress |
| `VDDKInitImageNotReady` | VDDK image pull still in progress (within deadline) |
| `Archived` | Plan has been archived |
| `NetAppShift` | Storage map uses NetApp Shift/Trident destination class |
| `ConversionResumable` | Failed migration with `disksCopied=true` VMs eligible for resume |

### Lifecycle conditions (execution)

| Condition | Meaning |
|---|---|
| `Executing` | Migration is actively running |
| `Succeeded` | Migration completed successfully |
| `Failed` | Migration failed |
| `Canceled` | Migration canceled (user request, deletion, or snapshot mutation) |

### Migration CR conditions

| Condition | Category | When Set |
|---|---|---|
| `PlanNotValid` | Critical | Plan ref not set or not found |
| `PlanNotReady` | Critical | Referenced Plan lacks Ready |
| `VMNotFound` | Warn | VM in `Cancel[]` not found in inventory |
| `VMNotUnique` | Warn | VM in `Cancel[]` reference is ambiguous |
| `Running` | Advisory | Snapshot has `Executing` |
| `Succeeded` / `Failed` / `Canceled` | Advisory | Copied from snapshot (durable) |

---

## REST API Endpoints

Not applicable — these controllers reconcile Kubernetes CRDs only. Inventory lookups use the provider web client (`pkg/controller/provider/web`), not the forklift-api REST service.

---

## Integration Points

| Caller / callee | Direction | Purpose |
|---|---|---|
| `validation.ProviderPair` | plan → validation | Provider ref + Ready checks |
| `plancontext.New` | plan → context | Aggregate Plan, maps, providers, hooks, clients |
| `adapter.New` | plan → adapter | Provider-specific warm/type validation |
| `plan.Migration.Run/Cancel/Archive` | plan → migration.go | Migration execution pipeline |
| `ensurer.Ensurer` | migration → ensurer | Create destination VMs, DVs, PVCs, ConfigMaps, Secrets |
| `web.NewClient` | context → provider/web | Inventory VM/network/storage lookups |
| `ocp.Client` | context → lib/client/openshift | Remote destination cluster API |
| `hookutil` | validation → hook | Hook executable validation |
| `metrics.RecordPlanMetrics` / `RecordMigrationMetrics` | controllers → metrics | Prometheus gauges |

### Plan ↔ Migration relationship

```
Plan (1) ──references──> (N) Migration CRs
Plan.Status.Migration.History[] ──contains──> Snapshot[] (one per Migration)
```

1. User creates a Migration CR referencing a Plan
2. Migration controller sets `ownerReference` (Plan owns Migration → auto-delete on plan deletion)
3. Plan controller discovers pending migrations, sorted by `creationTimestamp`
4. Plan creates a Snapshot capturing Plan + Provider + Maps state
5. Plan runs migration via `Migration.Run()`
6. Snapshot conditions reflected to `plan.status.conditions`
7. Migration controller copies snapshot state → `migration.status` (`Running`, `Succeeded`, `Failed`, `Canceled`)
8. `migration.status.vms` copied from `plan.status.migration.vms`

---

## Configuration

| Setting | Source | Used for |
|---|---|---|
| `BlockerGracePeriodMinutes` | `ForkliftController` / `BLOCKER_GRACE_PERIOD_MINUTES` | Grace before failing active migration on new blockers (default 5 min) |
| `MaxConcurrentReconciles` | Settings | Controller parallelism |
| `CopyOffload` | Settings | Enables `VDDKAndOffloadMixedUsage` check |
| `VddkJobActiveDeadline` | Settings | VDDK pull job deadline before `VDDKInitImageUnavailable` |
| VDDK image | Provider `spec.settings.vddkInitImage` or global | Warm/raw-copy validation job |
| `GetVDDKImage()` | settings helper | Resolves effective VDDK image URL |

---

## Error Patterns

- **Postpone reconciliation**: Returns `SlowReQ` when any Provider/NetworkMap/StorageMap/Host/Hook has `ObservedGeneration < Generation`.
- **Dangling archived plan**: `spec.archived=true` with no source provider → force-archive without full validation.
- **Blocker grace period**: `failExecutingMigrationOnBlocker()` only fails after Critical/Error conditions persist beyond `blockerGracePeriod()`. Transient provider blips self-resolve.
- **Snapshot cancel on mutation**: Plan/maps/provider changes during execution cancel the active snapshot (reason `Modified`).
- **Context build failure**: `NotEnoughDataError` when referenced maps/providers missing — validation skips context-dependent checks when blockers already set.
- **Status update preserves ephemeral data**: `updatePlanStatus` uses `DeepCopy()` because `validate()` populates non-persisted `Referenced` data and VM names in spec.
- **Orphan cleanup on plan delete**: Labels `plan-name` / `plan-namespace`; preserves PVCs/DVs owned by VirtualMachine.
- **Migration predicate**: Only reconciles on spec `Generation` change (`ObservedGeneration < Generation`); Plan predicate only fires after plan status is reconciled.

---

## Frontend Relevance

The console plugin watches **Plan** CRs for validation and migration progress; **Migration** CRs for history/overview timestamps and `Cancel[]` actions.

### CR shape ↔ TypeScript

| Backend field | Frontend type / location |
|---|---|
| `plan.status.conditions[]` | `V1beta1PlanStatusConditions` — drives plan status badge, alerts, wizard gating |
| `plan.status.migration.vms[]` | `V1beta1PlanStatusMigrationVms` — VM list, pipeline, progress (see migration-pipeline.mdc) |
| `plan.status.migration.history[]` | Snapshots (not directly rendered; conditions are reflected to plan) |
| `plan.status.netAppShiftDestination` | Boolean flag set during NetApp Shift validation |
| `plan.spec.archived` | Archive toggle; combined with `Archived` condition in `isPlanArchived()` |
| `plan.spec.virtV2vImage` | Custom virt-v2v image; `VirtV2vImageNotValid` blocker |
| `migration.status.conditions[]` | `V1beta1MigrationStatusConditions` — overview/history status |
| `migration.status.vms` | Copied from plan during `reflectPlan()` |
| `migration.spec.cancel[]` | Per-VM cancel requests from UI |

### Plan status resolver (`getPlanStatus`)

UI enum `PlanStatuses` in `src/plans/details/components/PlanStatus/utils/types.ts`:

| Backend signal | UI `PlanStatuses` |
|---|---|
| `Archived` condition or `spec.archived` | `Archived` |
| `Succeeded` | `Completed` |
| `Canceled` | `Canceled` |
| Warm + executing + VM paused | `Paused` |
| Any `Critical` or `Error` category condition | `CannotStart` |
| `Failed` or VM `error` field | `Incomplete` |
| `Executing` + VMs not started | `Pending` |
| `Executing` | `Executing` |
| `Ready` | `Ready` |
| `ValidatingVDDK` or `VDDKInitImageNotReady` | `Validating` |
| (none) | `Unknown` |

Constants: `PLAN_CONDITION_VALIDATING_VDDK`, `PLAN_CONDITION_VDDK_INIT_IMAGE_NOT_READY`, `PLAN_CONDITION_CONVERSION_RESUMABLE` in `PlanStatus/utils/constants.ts`.

### Conversion resume

`checkConversionResumable` sets advisory `ConversionResumable` when plan is `Failed` and VMs have `disksCopied=true` + `Failed` condition. UI shows Resume button when this condition is present (`PlanStatusResumeButton`).

### Condition display expectations

- **Blockers** (`Critical`/`Error`): Show in plan conditions alert; plan status `CannotStart`. Items[] arrays list affected VM refs for many VM-level conditions.
- **Warnings** (`Warn`): Show as warnings; plan can still be `Ready`.
- **VDDK flow**: `ValidatingVDDK` → plan status `Validating` (blocks Ready). `VDDKInitImageNotReady` is advisory within deadline; `VDDKInitImageUnavailable` is critical after deadline or when image required but unset.
- **NetApp Shift**: `NetAppShift` advisory informs UI; `NetAppShiftWarmNotSupported` and `NetAppShiftDatastoreNASMissing` are critical blockers.
- **Migration CR**: `PlanNotValid`/`PlanNotReady` block migration start; `Running`/`Succeeded`/`Failed`/`Canceled` mirror plan snapshot lifecycle.

### Labels used by migration resources

Ensurer and cleanup use labels from `context.Labeler`: `plan`, `migration`, `vmID`. Orphan cleanup uses separate `plan-name` / `plan-namespace` labels on the Plan CR.

### Related frontend modules

- Plan status: `src/plans/details/components/PlanStatus/`
- Plan conditions alert: plan details tabs
- Migration history: `src/overview/tabs/History/` (reads Migration CR `status.started`/`completed`)
- Do **not** use `usePlanMigration` for resource scoping — use `useLatestPlanMigration` (see project-context.mdc MTV-6091)
