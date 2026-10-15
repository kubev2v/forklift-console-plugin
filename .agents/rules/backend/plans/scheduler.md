---
description: Plan scheduler - VM scheduling logic, concurrency limits, per-provider batching
alwaysApply: false
---

# Plan Scheduler

> Analyzed from commit: `baf9c7bcc` on `2026-09-17`
> Source paths: `pkg/controller/plan/scheduler/`, `pkg/provider/ec2/controller/scheduler/`, `pkg/provider/azure/controller/scheduler/`

## Package Purpose

The scheduler decides **which VM migration to start next** during `Migration.Run()`. After all already-running VMs are stepped, `scheduler.Next()` is called in a loop until no VM can be scheduled. Each provider type implements different concurrency rules to avoid overloading source infrastructure. All schedulers share `settings.Settings.MaxInFlight` but interpret it differently (flat VM count vs per-host disk slots).

---

## Key Types and Structs

```go
// scheduler/doc.go
type Scheduler interface {
    Next() (vm *plan.VMStatus, hasNext bool, err error)
}

type Scheduler struct {          // per-provider implementations embed:
    *plancontext.Context
    MaxInFlight int
    // vSphere/Hyper-V only:
    inFlight map[string]int      // host key → occupied slots
    pending  map[string][]*pendingVM  // vSphere only
}

type pendingVM struct {           // vSphere only
    status *plan.VMStatus
    cost   int                   // disk slots consumed
}
```

`VMStatus.Running()` = `Started` set and `Completed` not set (`plan.Timed`).

---

## Interfaces and Implementations

Factory: `scheduler.New(ctx *plancontext.Context)` switches on `ctx.Source.Provider.Type()`:

| Provider type | Package | Model |
|---------------|---------|-------|
| `vsphere` | `scheduler/vsphere` | Per-ESXi-host **disk slots** |
| `hyperv` | `scheduler/hyperv` | Per-`OwnerNode` **VM count** (cluster mode) |
| `ovirt`, `openstack`, `ocp`, `ova`, `nutanix` | respective subpackages | Flat **VM count** per provider |
| `ec2` | `pkg/provider/ec2/controller/scheduler` | Flat VM count |
| `azure` | `pkg/provider/azure/controller/scheduler` | Flat VM count |

All implementations receive `MaxInFlight: settings.Settings.MaxInFlight`.

---

## Reconciliation / Execution Flow

### Migration loop (`migration.go`)

```
1. execute() all running VMs (continue in-flight work)
2. loop:
     vm, hasNext, err = scheduler.Next()
     if err → handle NotFoundError (cancel VM) or return
     if hasNext → execute(vm)   // starts new migration
     else → markSchedulerQueuedVMs(); break
3. end() when all VMs complete
```

### `markSchedulerQueuedVMs()`

When `Next()` returns `hasNext=false`, remaining unstarted VMs get an advisory **`Pending`** condition:

```
"Waiting to start migration: in-flight limit reached (max N)."
```

Plan-level `Ready` condition message: `"M VM(s) waiting to start migration (in-flight limit: N)."`.

### Three scheduling models

#### 1. Flat VM-count (oVirt, OpenStack, OCP, OVA, Nutanix, EC2, Azure)

```
calcInFlight(all executing plans with same source provider) < MaxInFlight
  → return first VM in plan order: not Canceled, not started, not completed
```

Algorithm (`openstack/scheduler.go` — identical pattern in ovirt, ocp, nutanix, azure, ec2):

1. Package-level `mutex.Lock()`
2. List all Plans cluster-wide
3. Count `vmStatus.Running()` across plans sharing `Spec.Provider.Source` with active `Executing` snapshot
4. If `inFlight >= MaxInFlight` → return `(nil, false, nil)`
5. Iterate **this plan's** `Status.Migration.VMs` in order; return first eligible VM

**Concurrency unit:** 1 running VM = 1 slot globally per source provider.

#### 2. Host-aware disk slots (vSphere)

Per-ESXi-host limit: `inFlight[host] + cost(vm) <= MaxInFlight`.

**`buildInFlight()`** — counts disk slots per host from:
- Current plan's running VMs (uses in-memory plan from context)
- Other executing plans sharing source provider (inventory lookup per VM)
- Skips archived plans; tolerates `NotFoundError` / `RefNotUniqueError` on other plans

**`buildPending()`** — groups unstarted VMs by `vm.Host` with computed `cost`.

**Shared-disk ordering** (vSphere):
- VMs that **create** shareable PVCs (`migrateSharedDisks=true`, per-VM override or plan default) run first
- VMs that **reuse** shared PVCs wait until all creators complete
- Controlled by `hasActiveSharedDiskCreators()` + `migratesSharedDisks()`

**`cost(vm, vmStatus)`** — slots freed after disk transfer:

| Transfer mode | Active phases cost | Post-transfer cost (frees slot) |
|---------------|-------------------|--------------------------------|
| V2V (`ShouldUseV2vForTransfer`) | 1 | `CreateVM`, `PostHook`, `Completed` → 0 |
| Offload plugin (`IsUsingOffloadPlugin`) | 1 | `CreateVM`, `PostHook`, `Completed`, `ConvertGuest`, `CreateGuestConversionPod` → 0 |
| CDI (default) | `len(disks) - finishedDisks()` | `CreateVM`, `PostHook`, `Completed`, `CopyingPaused`, `ConvertGuest`, `CreateGuestConversionPod` → 0 |

`finishedDisks()` counts completed tasks in `DiskTransfer`, `DiskTransferV2v`, `DiskAllocation` pipeline steps — slots release per disk, not per VM.

**`schedulable()`** rules:
- Skip host when `inFlight[host] >= MaxInFlight`
- Schedule VM when `cost + inFlight[host] <= MaxInFlight`
- **Large VM exception:** if `cost > MaxInFlight` but `inFlight[host] == 0`, allow (idle host)

`Next()` returns first VM from any host's schedulable list.

#### 3. Host-aware VM-count (Hyper-V)

Per-`OwnerNode` VM limit in cluster mode; standalone mode uses `""` host key (global counter).

1. `buildInFlight()` — count running VMs per `vm.Host` (`OwnerNode` from inventory)
2. Iterate plan VMs in order (FIFO); skip if `inFlight[host] >= MaxInFlight`
3. On inventory lookup failure → `""` host (global slot behavior)

Cross-plan: counts other executing plans sharing source (skips self, archived).

---

## Status Conditions

Scheduler does not set provider conditions. It sets VM/plan conditions when capacity is exhausted:

| Condition | Type | When |
|-----------|------|------|
| VM `Pending` (advisory) | `ConditionPending` | VM waiting for scheduler slot |
| Plan `Ready` (required) | `Ready` | One or more VMs queued behind limit |
| VM `Canceled` (advisory) | `ConditionCanceled` | Inventory `NotFoundError` during `Next()` |

---

## Integration Points

**Called by:** `pkg/controller/plan/migration.go` — `Migration.init()` creates scheduler via `scheduler.New()`.

**Calls:**
- `plancontext.Context.List()` — cluster-wide Plan list for cross-plan in-flight counts
- vSphere/Hyper-V: `Source.Inventory.Find()` — resolve host/OwnerNode per VM

**Settings:** `pkg/settings/migration.go` — `MaxInFlight` from env `MAX_VM_INFLIGHT` (default **20**).

---

## Configuration

| Setting | Env var | Default | Scope |
|---------|---------|---------|-------|
| `MaxInFlight` | `MAX_VM_INFLIGHT` | 20 | Per source provider (all plans sharing it) |

Must be a positive integer. vSphere interprets as **disk slots per ESXi host**; Hyper-V as **VMs per OwnerNode**; others as **total running VMs**.

---

## Error Patterns

- **`NotFoundError` from inventory** (vSphere `Next()`): if provider not `Ready`, migration retries; else VM gets `Canceled` with reason `"VM was not found in inventory."`
- **Mutex serialization:** each provider package has its own package-level `sync.Mutex` — concurrent reconciles for the same provider type are serialized
- **No preemption:** first eligible VM in plan list order; no priority queue
- **Cross-plan coupling:** two plans on same source provider compete for the same slot pool

---

## Frontend Relevance

| Behavior | UI impact |
|----------|-----------|
| `MaxInFlight` global per provider | Cannot configure per-plan concurrency in UI; shared across all plans on same source |
| `ConditionPending` on VM | Plan details may show VMs "waiting to start" when limit reached |
| Plan `Ready` message with queued count | Plan status reflects scheduler backlog |
| vSphere per-host disks | VMs on different ESXi hosts can run in parallel even when one host is saturated |
| vSphere `finishedDisks` | Disk transfer progress can free slots before VM completes — more VMs may start mid-migration |
| Hyper-V per-node limit | Cluster Hyper-V migrations throttled per hypervisor node |
| FIFO ordering | VM start order matches plan VM list order, not size/priority |
| Default 20 | Up to 20 concurrent VMs (or 20 disk slots/host for vSphere) unless operator changes `MAX_VM_INFLIGHT` |

### Provider comparison

| Provider | Concurrency unit | Scope | Cross-plan |
|----------|-----------------|-------|------------|
| vSphere | Disk slots | Per ESXi host | Yes |
| Hyper-V | VM count | Per OwnerNode (or global in standalone) | Yes |
| OpenStack, oVirt, OCP, OVA, Nutanix, EC2, Azure | VM count | Per source provider | Yes |

---

## File Map

| File | Purpose |
|------|---------|
| `scheduler/doc.go` | Interface + factory |
| `scheduler/vsphere/scheduler.go` | Host-aware disk-slot scheduler + shared-disk ordering |
| `scheduler/vsphere/scheduler_test.go` | `schedulable()` unit tests |
| `scheduler/hyperv/scheduler.go` | Per-node VM scheduler |
| `scheduler/openstack/scheduler.go` | Flat VM-count |
| `scheduler/ovirt/scheduler.go` | Flat VM-count |
| `scheduler/ocp/scheduler.go` | Flat VM-count |
| `scheduler/ova/scheduler.go` | Flat VM-count |
| `scheduler/nutanix/scheduler.go` | Flat VM-count |
| `pkg/provider/ec2/controller/scheduler/scheduler.go` | Flat VM-count (external package) |
| `pkg/provider/azure/controller/scheduler/scheduler.go` | Flat VM-count (external package) |
| `pkg/controller/plan/migration.go` | Scheduler loop + `markSchedulerQueuedVMs` |
| `pkg/settings/migration.go` | `MaxInFlight` setting |
