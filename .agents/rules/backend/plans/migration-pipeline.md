---
description: Migration pipeline - itineraries (cold/warm/conversion), VM phases, disk transfer, copy-offload, KubeVirt resources
alwaysApply: false
---

# Migration Pipeline

> Analyzed from commit: `baf9c7bcc` on `2026-09-17`
> Source paths: `pkg/controller/plan/migration.go`, `pkg/controller/plan/kubevirt.go`, `pkg/controller/plan/handler/`, `pkg/controller/plan/migrator/`

## Package Purpose

The migration execution layer drives per-VM state machines after the plan controller creates a `Migration` CR. `Migration.Run()` in `migration.go` orchestrates adapter/builder/kubevirt/scheduler/migrator wiring, steps each VM through an **itinerary** (low-level phases), and maintains a **pipeline** (UI-facing steps with progress). `kubevirt.go` creates and monitors Kubernetes resources (DataVolumes, populator PVCs, virt-v2v/Conversion pods, VirtualMachine CRs). `migrator/` selects provider-specific migrators and builds itineraries/pipelines. `handler/` watches provider inventory and enqueues plan reconciles when source VMs change — it does **not** execute migration phases.

---

## Key Types and Structs

```go
// migration.go
type Migration struct {
    *plancontext.Context
    builder           adapter.Builder
    ensurer           adapter.Ensurer
    kubevirt          KubeVirt
    provider          adapter.Client
    destinationClient adapter.DestinationClient
    scheduler         scheduler.Scheduler
    migrator          migrator.Migrator
}

// plan/status (serialized to Plan.status.migration.vms[])
type VMStatus struct {
    plan.Timed          // started/completed timestamps; Running() = started && !completed
    Phase               string              // current itinerary phase
    Pipeline            []*plan.Step        // UI pipeline steps
    Conditions          libcnd.Conditions   // inline conditions (status True = active)
    Error               *plan.Error
    DisksCopied         bool                // resume-conversion gate
    Warm                *plan.Warm          // warm precopy metadata
}
```

Pipeline step constants (`migrator/base/doc.go`):

| Constant | Value | UI role |
|----------|-------|---------|
| `Initialize` | `"Initialize"` | Startup, snapshots (warm), power-off (cold) |
| `DiskTransfer` | `"DiskTransfer"` | CDI import or populator copy (`CopyDisks` phase) |
| `DiskAllocation` | `"DiskAllocation"` | Blank PVC allocation before virt-v2v copy |
| `DiskTransferV2v` | `"DiskTransferV2v"` | virt-v2v disk copy metrics (`CopyDisksVirtV2V`) |
| `Cutover` | `"Cutover"` | Warm finalization / power-off at cutover |
| `ImageConversion` | `"ImageConversion"` | Guest conversion (virt-v2v or Conversion CR) |
| `VirtualMachineCreation` | `"VirtualMachineCreation"` | Target VM CR |
| `WaitForGuestReboots` | `"WaitForGuestReboots"` | Windows post-migration reboot wait |
| `WaitForFinalSnapshotConsolidation` | `"WaitForFinalSnapshotConsolidation"` | vSphere snapshot cleanup wait |
| `PreflightInspection` | `"PreflightInspection"` | Deep/preflight inspection |

---

## Interfaces and Implementations

### Migrator (`migrator/base/doc.go`)

```go
type Migrator interface {
    Init() error
    Begin() error
    Complete(*plan.VMStatus)
    Status(plan.VM) *plan.VMStatus
    Reset(*plan.VMStatus, []*plan.Step)
    Itinerary(plan.VM) *libitr.Itinerary
    Pipeline(plan.VM) ([]*plan.Step, error)
    Step(*plan.VMStatus) string          // maps vm.Phase → pipeline step name
    ExecutePhase(*plan.VMStatus) (bool, error) // false → delegate to migration.go
    Logger() logging.LevelLogger
}
```

Factory (`migrator/doc.go`):

| Provider | Migrator | Notes |
|----------|----------|-------|
| `openshift` | `ocp.LiveMigrator` or `base.BaseMigrator` | LiveMigrator when `Plan.Spec.Type == MigrationLive` |
| `ec2` | `ec2migrator` | Custom EC2 migrator |
| `azure` | `azuremigrator` | Custom Azure migrator |
| default | `base.BaseMigrator` | vSphere, oVirt, OpenStack, OVA, HyperV, Nutanix |

### Inventory handler (`handler/doc.go`)

```go
type Handler interface {
    Watch(m *handler.WatchManager) error
}
```

Per-provider handlers (vsphere, ovirt, openstack, ova, hyperv, ocp, ec2, nutanix, azure) watch inventory VMs and enqueue plan reconcile when a referenced VM changes.

---

## Reconciliation / Execution Flow

### Migration.Run() top-level loop

```
Run()
  init()           → adapter, kubevirt, scheduler, migrator
  begin()          → Executing condition, namespace, reset VM pipelines
  if !Executing    → early return (Failed/Canceled from begin)
  resolveCanceledRefs()
  for runningVMs() → execute(vm)     // resume in-flight VMs
  loop scheduler.Next() → execute(vm)
  end()            → migration-level Succeeded/Failed/Canceled
```

Polling: `PollReQ = 3s` until all VMs complete; then `NoReQ = 0`.

### execute(vm) per-VM loop

1. Delete `Pending` condition; check user cancel → `Canceled` + `PhaseCompleted`
2. `migrator.ExecutePhase(vm)` — if `ok==true`, migrator handled phase
3. Else `switch vm.Phase` in `migration.go` (Started, hooks, CreateDataVolumes, CopyDisks/AllocateDisks, snapshots, conversion, CreateVM, WaitForGuestReboots, …)
4. `vm.ReflectPipeline()` — sync started/completed timestamps; aggregate step errors
5. On `PhaseCompleted` without error → `Succeeded` condition; with error → `Failed` condition

### Itinerary predicate flags (`migrator/base/doc.go`)

| Flag | Hex | When true |
|------|-----|-----------|
| `HasPreHook` | `0x01` | VM has pre-hook |
| `HasPostHook` | `0x02` | VM has post-hook |
| `RequiresConversion` | `0x04` | Provider requires conversion && !skipGuestConversion |
| `CDIDiskCopy` | `0x08` | `!ShouldUseV2vForTransfer(vm)` |
| `VirtV2vDiskCopy` | `0x10` | `ShouldUseV2vForTransfer(vm)` |
| `OpenstackImageMigration` | `0x20` | OpenStack source |
| `VSphere` | `0x40` | vSphere source |
| `RunInspection` | `0x80` | Preflight inspection enabled |
| `WindowsWaitForGuestReboot` | `0x100` | Windows + settings + target not off + conversion |
| `WaitForFinalSnapshotConsolidation` | `0x200` | `settings.WaitForFinalSnapshotConsolidation` |

`All` on an itinerary step means **every** set bit must evaluate true; unset bits are ignored.

### Cold itinerary (default)

```
Started → [PreHook] → StorePowerState → PowerOffSource → WaitForPowerOff
→ CreateDataVolumes
→ CopyDisks (CDIDiskCopy)          → pipeline: DiskTransfer
→ AllocateDisks (VirtV2vDiskCopy)  → pipeline: DiskAllocation
→ [CreateGuestConversionPod → ConvertGuest]
→ [CopyDisksVirtV2V (RequiresConversion ∧ VirtV2vDiskCopy)] → pipeline: DiskTransferV2v
→ [ConvertOpenstackSnapshot]
→ CreateVM → [WaitForGuestReboots] → [PostHook] → Completed
```

### Warm itinerary

Precopy loop: `CopyDisks → CopyingPaused → [snapshot phases] → AddCheckpoint` (repeats until cutover). Cutover block: power-off, final snapshot, `Finalize`, optional conversion, `CreateVM`, `[WaitForGuestReboots]`, `[PostHook]`, optional `WaitForFinalSnapshotRemoval` → `WaitForFinalSnapshotConsolidation` step.

### Other itineraries

- **MigrationOnlyConversion**: no disk transfer (storage already present / offload-only conversion)
- **ResumeConversion**: skips disk copy and power-off; requires `DisksCopied=true` on prior failure
- **OCP live** (`migrator/ocp/live.go`): `Initialize`, `PrepareTarget`, `Synchronization` pipeline steps

---

## Disk Transfer Paths

### Transfer mode selection (`Plan.ShouldUseV2vForTransfer`)

Called per VM on every reconcile (must not perform API calls):

| Source | Returns `true` (virt-v2v path) when |
|--------|-------------------------------------|
| vSphere | Cold, local destination, migrateSharedDisks, conversion enabled, no excluded disks, no NetApp Shift, **no offload plugin** |
| OVA, HyperV | Always |
| Others | Always `false` (CDI path) |

When `IsUsingOffloadPlugin()` (StorageMap has `vsphereXcopyConfig` or `csiVolumeImport`), vSphere uses **CDI/populator** path even though guest conversion may still run in-place.

### Copy-offload (volume populator)

Gated by `settings.Settings.CopyOffload` (ForkliftController `feature_copy_offload`) and StorageMap offload plugin config.

1. **CreateDataVolumes**: `builder.SupportsVolumePopulators()` creates populator PVCs (annotated `copy-offload` via `planbase.AnnCopyOffload`) instead of CDI DataVolumes on cold offload migrations
2. **CopyDisks / AllocateDisks**: `updatePopulatorCopyProgress()` tracks `PopulatorTransferredBytes()` per PVC; populator pods named `populate-<pvcUID>`
3. **Warm + populator**: first precopy may use CDI; after `vm.Warm.Successes > 0`, falls back to `updateCopyProgress` (CDI checkpoints)
4. **Conversion type**: `KubeVirt.ResolveConversionType` → `InPlace` when `!useV2v || IsCopyOffload(pvcs)` (populator PVC has `copy-offload` annotation)
5. **Offload plugins**: `VSphereXcopyPluginConfig` (XCOPY) or `CsiVolumeImport` (CSI volume import); task offload metadata copied to pipeline task annotations via `PopulatorOffloadInfo`

### CDI DataVolume path (`updateCopyProgress`)

Used when `!SupportsVolumePopulators()` or warm jump-start complete. Monitors `DataVolume.Status.Phase` and `PercentComplete()`; warm migrations use checkpoint annotations.

### virt-v2v disk path

1. **AllocateDisks** → `DiskAllocation` step (blank PVCs)
2. **CopyDisksVirtV2V** → `DiskTransferV2v` step; progress from virt-v2v pod `:2112/metrics`
3. vSphere with VDDK: `Remote` conversion; copy-offload/in-place: conversion reads already-populated PVCs

### Pipeline step ↔ phase mapping (BaseMigrator.Step)

| Phases | Pipeline step |
|--------|-----------------|
| `Started`, initial snapshot phases, `CreateDataVolumes`* | `Initialize` |
| `CopyDisks`, precopy snapshot phases, `AddCheckpoint`, `ConvertOpenstackSnapshot` | `DiskTransfer` |
| `AllocateDisks` | `DiskAllocation` |
| `CopyDisksVirtV2V` | `DiskTransferV2v` |
| Cutover/finalize/power-off (warm) | `Cutover` |
| `CreateGuestConversionPod`, `ConvertGuest` | `ImageConversion` |
| `CreateVM` | `VirtualMachineCreation` |
| `WaitForGuestReboots` | `WaitForGuestReboots` |
| `WaitForFinalSnapshotRemoval` | `WaitForFinalSnapshotConsolidation` |

\* `CreateDataVolumes` maps to `DiskTransfer` when preflight inspection is active (avoids empty Initialize step in UI).

---

## Status Conditions

Conditions use `status: "True"` (libcnd.True). `HasCondition(type)` returns true only when type exists **and** status is True.

### Migration snapshot conditions (`plan.status.migration` active snapshot)

| Condition | Set when | status=True meaning |
|-----------|----------|---------------------|
| `Executing` | `begin()` after validation | Migration actively running |
| `Succeeded` | `end()` — all VMs complete, ≥1 succeeded, 0 failed | Plan execution succeeded |
| `Failed` | `begin()` resume validation failure, or `end()` with any failed VM | Plan execution failed |
| `Canceled` | `end()` — all VMs complete, none succeeded/failed | Plan execution canceled |

`end()` deletes `Executing` before setting terminal condition.

### Per-VM conditions (`plan.status.migration.vms[].conditions`)

| Condition | Set when | status=True meaning | UI impact |
|-----------|----------|---------------------|-----------|
| `Succeeded` | VM reaches `PhaseCompleted` without error | VM migration succeeded | Row status "Succeeded" |
| `Failed` | VM error after `PhaseCompleted` | VM migration failed | Row status "Failed" |
| `Canceled` | User cancel or VM not found in inventory | VM canceled | Treated as terminal failure path |
| `Pending` | (removed at execute start) | — | Cleared when VM starts |
| `WaitForGuestReboots` | Reboot pod failed (non-fatal) | Warning only; migration continues | Advisory condition, not Failed |
| `InspectionHasConcerns` | Preflight/deep inspection concerns | Per-concern categories propagated | Blockers fail the step |

### VM running vs completed

- `VMStatus.Running()`: `started != nil && completed == nil` — used by scheduler to pick in-flight VMs
- `vm.phase`: current itinerary phase string (e.g. `CopyingPaused`, `CopyDisks`)
- Pipeline step `phase`: `Pending` → `Running` → `Completed` (`api.StepPending/Running/Completed`)

### Resume-conversion markers

- `DisksCopied=true` set entering `CreateGuestConversionPod` when copy and conversion are separate phases
- Enables `Migration.Spec.ResumeConversion` to skip disk transfer on retry

---

## Integration Points

```
Plan controller → Migration.Run()
Migration → adapter.Builder/Client, kubevirt.KubeVirt, scheduler, migrator
kubevirt → CDI DataVolumes, PVC populators, virt-v2v pods, Conversion CRs, KubeVirt VM
migrator/base → lib/itinerary predicates, Plan.ShouldUseV2vForTransfer
handler/* → inventory watch → plan reconcile (not migration phases)
scheduler/vsphere → throttles concurrent DiskTransfer/DiskAllocation/DiskTransferV2v steps
```

---

## Configuration

| Setting | Effect on pipeline |
|---------|-------------------|
| `settings.CopyOffload` | Enables volume populator path (`SupportsVolumePopulators`) |
| `settings.WindowsWaitForReboot` | Gates `WaitForGuestReboots` phase |
| `settings.WaitForFinalSnapshotConsolidation` | Gates warm `WaitForFinalSnapshotRemoval` phase |
| `settings.UseConversionCR` | Guest conversion via Conversion CR instead of virt-v2v pod |
| `settings.PrecopyInterval` | Warm `CopyingPaused` → `NextPrecopyAt` |
| `settings.RetainPopulatorPods` | Skip populator pod cleanup |
| ForkliftController `feature_copy_offload` | Operator-level copy-offload feature gate |

---

## Error Patterns

- **Step errors**: `step.AddError(msg)` — VM continues to `PhaseCompleted` with `Failed` condition
- **Fatal reconcile errors**: return `err` from `execute()` — retried on next poll (3s)
- **ProviderNotReadyError**: return without advancing (transient)
- **Cancel/fail cleanup**: `cleanup()` removes VM, DVs, importer/populator pods, conversion workloads, secrets, hooks
- **Warm fail**: orphaned snapshot removed in `execute()` failure path
- **Populator stall**: `isPopulatorPodFailed` detects `populate-*` pod in `Failed` phase

---

## Frontend Relevance

Data source: `Plan.status.migration.vms[]` on the Plan CR (UI watches Plan, not Migration CR directly for pipeline detail).

### TypeScript mapping

| Backend field | Frontend type / usage |
|---------------|----------------------|
| `vms[].phase` | `V1beta1PlanStatusMigrationVms.phase` — VM phase column, `CopyingPaused` → "Waiting" |
| `vms[].pipeline[]` | `V1beta1PlanStatusMigrationVmsPipeline` — expanded progress table |
| `pipeline[].name` | Mapped via `getPipelineStepDisplayName()` in `MigrationStatusVirtualMachineList/utils/utils.ts` |
| `pipeline[].phase` | `Pending` / `Running` / `Completed` — step status badges |
| `pipeline[].progress.{completed,total}` | Disk progress bar; `annotations.unit` often `"MB"` |
| `pipeline[].tasks[]` | Per-disk rows in MigrationProgressTable |
| `vms[].conditions[]` | `type === 'Succeeded'/'Failed'` with `status === 'True'` drives row status |
| `vms[].completed` | Undefined while running (`getVMMigrationStatus`) |
| `vms[].warm.nextPrecopyAt` | Warm waiting UI |
| `vms[].disksCopied` | Resume-conversion eligibility |

### Pipeline display names (frontend)

```typescript
// src/plans/.../MigrationStatusVirtualMachineList/utils/utils.ts
WaitForGuestReboots → "Post-migration setup"
DiskAllocation → "Disk allocation"
DiskTransfer / DiskTransferV2v → "Disk transfer"
WaitForFinalSnapshotConsolidation → "Snapshot consolidation"
```

### Disk progress selection (`getVMDiskTransferPipeline`)

UI treats `DiskAllocation`, `DiskTransfer`, and `DiskTransferV2v` as disk-transfer steps:

- **Copy-offload (populator)**: progress usually in **`DiskTransfer`** step (`CopyDisks` phase). No `DiskAllocation`/`DiskTransferV2v` in pipeline when `ShouldUseV2vForTransfer` is false.
- **virt-v2v cold (VDDK)**: **`DiskAllocation`** (allocate) then **`DiskTransferV2v`** (copy metrics). UI prefers the active step; when both exist without blocking errors, prefers whichever has `progress.completed > 0` (guards misleading 100% on allocation while v2v copy still pending).
- **CDI-only (oVirt/OpenStack)**: single **`DiskTransfer`** step.

### VM status derivation (`getVMMigrationStatus`)

Priority: `Failed` → `Succeeded` → `phase === CopyingPaused` (Waiting) → running `WaitForGuestReboots` step (Post-migration setup) → first pipeline step Pending (NotStarted) → running → Unknown.

### Migration resources scoping

UI scopes Pods/Jobs/DVs/PVCs by plan **and** migration labels (`useMigrationResources` + `useLatestPlanMigration`) — plan-only matching mixes resources across restarts (MTV-6091).

### Conditions the UI should treat as active

Only interpret conditions with `status: 'True'`. `WaitForGuestReboots` with `category: Warn` is advisory — VM may still show `Succeeded`. Do not treat `Executing` on the migration snapshot as a per-VM status.
