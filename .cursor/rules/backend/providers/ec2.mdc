---
description: EC2 provider - AWS SDK inventory, adapter, migrator, platform-gated availability
alwaysApply: false
---

# EC2 Provider

> Analyzed from commit: `baf9c7bcc` on `2026-09-17`
> Source paths: `pkg/provider/ec2/`

## Package Purpose

The EC2 provider migrates Amazon EC2 instances to OpenShift Virtualization using **cold migration only**. Unlike other Forklift providers (under `pkg/controller/provider/`), EC2 lives in a self-contained tree at `pkg/provider/ec2/` with its own inventory collector, REST API, plan adapter, migrator, builder, validator, ensurer, scheduler, and AWS clients.

Migration flow: stopped EC2 instance → EBS snapshots → (optional cross-account snapshot sharing) → EBS volumes in target AZ → PV/PVC pairs via AWS EBS CSI (`ebs.csi.aws.com`) → optional virt-v2v guest conversion → KubeVirt VM. AWS resource state is tracked via `forklift.konveyor.io/*` tags (not Kubernetes), making phases idempotent across controller restarts.

```
pkg/provider/ec2/
├── controller/          # Plan integration (adapter, migrator, builder, …)
│   ├── adapter/         # base.Adapter factory
│   ├── builder/         # VirtualMachine + PV/PVC spec generation
│   ├── client/          # AWS SDK (power, snapshots, volumes)
│   ├── ensurer/         # K8s resource creation (PV, PVC)
│   ├── handler/         # Plan reconciliation event handlers
│   ├── inventory/       # Inventory lookup helpers
│   ├── mapping/         # Network/storage mapping utilities
│   ├── migrator/        # Migration state machine
│   ├── scheduler/       # MaxInFlight VM scheduling
│   ├── validation/      # Provider CR validation (target credentials)
│   └── validator/       # Pre-migration VM validation
├── inventory/           # Inventory collection and REST API
│   ├── client/          # AWS SDK client for polling
│   ├── collector/       # Periodic AWS API poller
│   ├── model/           # SQLite DB models
│   └── web/             # REST handlers (gin)
├── testutil/            # Fake EC2/STS APIs
└── docs/                # Tagging, guest conversion, feature comparison
```

---

## Key Types and Structs

### Inventory models (`inventory/model/`)

All models embed `Base` with `ID` (PK), `Name`, `Kind`, `Provider`, `Revision`.

| Model | AWS resource | Notable indexed fields |
|-------|-------------|------------------------|
| `Instance` | EC2 instance | `instanceType`, `state`, `powerState` (On/Off/Unknown), `platform` |
| `Volume` | EBS volume | `volumeType`, `state`, `size` |
| `Network` | VPC or Subnet | `networkType` (vpc/subnet), `cidr` |
| `Storage` | EBS volume type (static) | `volumeType` (gp2, gp3, …) |
| `Snapshot` | EBS snapshot | `volumeID`, `state` |

Models store full AWS SDK objects in `Object` for API fidelity. `InstanceDetails` / `VolumeDetails` / etc. add REST-friendly `id`, `name`, `powerState` fields.

### Migration components

```go
// adapter.Adapter — factory for plan framework interfaces
type Adapter struct{}

// controller/client.Client — dual-account AWS operations
type Client struct {
    *plancontext.Context
    sourceClient EC2API   // snapshots, power
    targetClient EC2API   // volume creation
    targetSTS    STSAPI   // GetCallerIdentity (cross-account)
    crossAccount bool
}

// migrator.Migrator — cold migration orchestrator
type Migrator struct {
    *plancontext.Context
    builder   base.Builder
    validator base.Validator
    adpClient adapter.Client
    ensurer   base.Ensurer
}
```

### Provider validation (`controller/validation/`)

```go
type Validator struct{}
// Sets provider status when target credentials missing
const TargetCredentialsMissing = "TargetCredentialsMissing"
```

---

## Interfaces and Implementations

| Forklift interface | EC2 implementation | Notes |
|--------------------|-------------------|-------|
| `base.Adapter` | `controller/adapter.Adapter` | Factory for builder, validator, ensurer, client |
| `base.Builder` | `controller/builder.Builder` | VM spec, PV/PVC; `SupportsVolumePopulators() == false` |
| `base.Validator` | `controller/validator.Validator` | Storage, network map, storage map checks |
| `base.Ensurer` | `controller/ensurer.Ensurer` | PV creation; PVC ensurer is no-op |
| `base.Client` | `controller/client.Client` | Power off, snapshots, volumes |
| `base.DestinationClient` | `controller/adapter.DestinationClient` | **No-op** (no volume populators) |
| `migbase.Migrator` | `controller/migrator.Migrator` | Cold only |
| `libcontainer.Collector` | `inventory/collector.Collector` | Periodic AWS polling |
| `EC2API` | AWS SDK v2 `ec2.Client` | Mockable via `testutil/fake_ec2api.go` |

Plan framework wiring (via `doc.go` registries):
- `pkg/controller/plan/adapter/doc.go` → `ec2adapter.New()`
- `pkg/controller/plan/migrator/doc.go` → `ec2migrator.New()`
- `pkg/controller/plan/scheduler/doc.go` → `ec2scheduler.Scheduler`
- `pkg/controller/provider/container/doc.go` → `ec2collector.New()`
- `pkg/controller/provider/web/doc.go` → `ec2web.Handlers()`
- `pkg/controller/provider/validation/doc.go` → `ec2validation.Validator`

---

## Reconciliation / Execution Flow

### Inventory collection

1. `Collector.Start()` — create AWS client, run initial `Collect()`, set `parity=true`
2. Ticker at `RefreshInterval` (default 10s) re-runs `Collect()`
3. Mutex prevents overlapping collections ("Collection already in progress, skipping")
4. Sequential tasks with partial-success semantics:
   - `collectInstances` → `collectVolumes` → `collectNetworks` → `collectStorageTypes` → `collectSnapshots`
5. Each record uses `HasChanged()` + `Revision` increment to minimize DB writes
6. `Collector.Test()` — `DescribeInstances` connectivity check (used by provider webhook)

### Plan handler

`controller/handler/plan.go` ensures periodic inventory events at `InventoryPollingInterval` (default 15s) to enqueue all Plans referencing the provider.

### Cold migration itinerary

```
PhaseStarted → [PreHook] → PhaseStorePowerState → PhasePowerOffSource → PhaseWaitForPowerOff →
CreateSnapshots → WaitForSnapshots → [ShareSnapshots] →
CreateVolumes → WaitForVolumes → CreatePVsAndPVCs →
[CreateGuestConversionPod → ConvertGuest] →
PhaseFinalize → PhaseCreateVM → RemoveSnapshots → [PostHook] → PhaseCompleted
```

Conditional flags (`EC2Predicate`):
| Flag | Condition |
|------|-----------|
| `PreHookFlag` | VM has pre-hook |
| `PostHookFlag` | VM has post-hook |
| `ConversionFlag` | `RequiresConversion()` && !`SkipGuestConversion` |
| `CrossAccountFlag` | `client.IsCrossAccount()` |

### UI pipeline steps (`migrator/pipeline.go`)

| Step | Internal phases |
|------|-----------------|
| Initialize | PhaseStarted |
| PrepareSource | PhasePowerOffSource, PhaseWaitForPowerOff |
| CreateSnapshots | CreateSnapshots, WaitForSnapshots |
| ShareSnapshots | ShareSnapshots (cross-account only) |
| DiskTransfer | CreateVolumes, WaitForVolumes, CreatePVsAndPVCs |
| ImageConversion | CreateGuestConversionPod, ConvertGuest |
| CreateVM | PhaseFinalize, PhaseCreateVM |
| Cleanup | RemoveSnapshots |

---

## Status Conditions

### Provider CR (`controller/validation/crossaccount.go`)

EC2 providers **require target credentials** in the secret. If either `targetAccessKeyId` or `targetSecretAccessKey` is missing:

| Field | Value |
|-------|-------|
| `status.phase` | `ValidationFailed` |
| Condition type | `TargetCredentialsMissing` (Critical) |
| Reason | `TargetCredentialsRequired` |

Use `--auto-target-credentials` (kubectl-mtv) or set both keys manually. Same-account mode still needs target keys (typically cluster `aws-creds`).

Provider connection test (`Collector.Test()`): HTTP 200 on success, 400 for credential/config errors, 500 for AWS API failures.

---

## REST API Endpoints

Base route: `/providers/ec2/:provider` (registered via `inventory/web/doc.go` → `pkg/controller/provider/web/`).

| Endpoint | Handler | Model | Label filter | Watch |
|----------|---------|-------|--------------|-------|
| `GET /providers/ec2` | ProviderHandler | aggregate | — | No |
| `GET /providers/ec2/:provider` | ProviderHandler | ProviderResource | — | No |
| `GET …/vms` | VMHandler | Instance | Yes (`label.*`) | Yes |
| `GET …/vms/:vm` | VMHandler | Instance | — | — |
| `GET …/workloads/:vm` | WorkloadHandler | Instance (expanded) | — | — |
| `GET …/volumes` | VolumeHandler | Volume | Yes | Yes |
| `GET …/volumes/:id` | VolumeHandler | Volume | — | — |
| `GET …/networks` | NetworkHandler | Network | Yes | Yes |
| `GET …/networks/:id` | NetworkHandler | Network | — | — |
| `GET …/storages` | StorageHandler | Storage | No (static) | Yes |
| `GET …/storages/:id` | StorageHandler | Storage | — | — |
| `GET …/snapshots` | SnapshotHandler | Snapshot | Yes | Yes |
| `GET …/snapshots/:id` | SnapshotHandler | Snapshot | — | — |

Query params: `?name=…`, `?label.key=value`, `?detail=N`. WebSocket watch via `X-Watch` header. Provider aggregate returns `vmCount`, `networkCount`, `volumeCount`, `storageCount` when `detail > 0`.

---

## Integration Points

**Calls:**
- AWS SDK v2 (`ec2`, `sts`) — inventory polling and migration operations
- `pkg/controller/plan/*` — adapter, migrator, scheduler, context
- `pkg/lib/inventory/*` — container, model DB, web watch framework
- `pkg/virt-v2v` — guest conversion pod (`V2V_source=ec2`, `V2V_vmName`)

**Called by:**
- Provider controller — registers collector, runs `ec2validation.Validator`
- Plan controller — dispatches to EC2 adapter/migrator/scheduler for `provider.type=ec2`
- Forklift API — mounts EC2 web handlers alongside other providers

**Platform gating:** EC2 is only available on AWS-platform OpenShift clusters. Frontend uses `useClusterIsAwsPlatform` and `isTechPreviewProvider()` / `TechPreviewLabel`.

---

## Configuration

### Provider secret fields

| Field | Required | Purpose |
|-------|----------|---------|
| `region` | Yes | AWS region |
| `accessKeyId` | Optional* | Source IAM access key |
| `secretAccessKey` | Optional* | Source IAM secret |
| `targetAccessKeyId` | **Yes** | Target account key (same or cross-account) |
| `targetSecretAccessKey` | **Yes** | Target account secret |

*If source keys omitted, default AWS credential chain (IAM role, pod identity).

### Provider `spec.settings`

| Setting | Required | Purpose |
|---------|----------|---------|
| `target-az` | **Yes** | AZ for EBS volume creation and VM node selector |

EBS volumes are AZ-specific; wrong AZ prevents CSI attach. Builder adds `topology.kubernetes.io/zone=<target-az>` unless `plan.spec.skipZoneNodeSelector=true`.

### Cross-account mode

When source and target keys differ, `Client.IsCrossAccount()` is true:
- Source client: snapshots, power operations
- Target client: volume creation
- STS: `GetCallerIdentity` for snapshot sharing (`ModifySnapshotAttribute`)

### Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `EC2_INVENTORY_INTERVAL_SECONDS` | 10 | Collector AWS polling interval |
| `EC2_CONTROLLER_INTERVAL_SECONDS` | 15 | Plan handler reconciliation interval |

### Static EBS storage types

Hardcoded in `inventory/collector/storage.go`: gp2, gp3, io1, io2, st1, sc1, standard (with max IOPS/throughput metadata for storage-map UI).

---

## Error Patterns

- **Partial collection success:** Individual task failures logged; all-fail returns joined error; partial success returns nil (parity may still be set)
- **Idempotent AWS ops:** Phases query existing resources by `forklift.konveyor.io/vmID` tag before creating
- **Snapshot cleanup failures:** Logged but do not fail migration (`RemoveSnapshots`)
- **Instance store volumes:** Detected in validation — warning only; migration requires at least one EBS volume
- **Missing inventory size:** Builder falls back to 100 GiB when volume/snapshot size unavailable
- **Migration type:** Only `cold` (or empty) accepted; warm/live rejected by validator

### AWS resource tagging

| Tag key | Applied to | Purpose |
|---------|-----------|---------|
| `forklift.konveyor.io/vmID` | Snapshots, Volumes | VM instance ID |
| `forklift.konveyor.io/vm-name` | Snapshots, Volumes | Human-readable name |
| `forklift.konveyor.io/volume` | Snapshots | Source volume ID |
| `forklift.konveyor.io/original-volume` | Volumes | Maps new → original volume |
| `forklift.konveyor.io/snapshot` | Volumes | Snapshot used |

---

## Frontend Relevance

| Backend field / behavior | Frontend usage |
|--------------------------|----------------|
| `provider.type=ec2` | Tech-preview provider; gated by `useClusterIsAwsPlatform` |
| `TargetCredentialsMissing` condition | Provider list/details status; create form collects target creds / auto-target |
| `spec.settings["target-az"]` | EC2 provider create wizard (`Ec2TargetAz` field) |
| Secret keys above | Create form: `Ec2Region`, `Ec2AccessKeyId`, `Ec2TargetAccessKeyId`, etc. |
| `GET /providers/ec2/:uid/vms` | VM inventory picker in plan wizard |
| `powerState` (On/Off/Unknown) | VM list filtering, cold-migration readiness |
| `GET …/storages` | Storage map source types (EBS volume types) |
| `GET …/networks` | Network map source subnets/VPCs |
| `GET …/volumes` | Volume inventory (if surfaced) |
| Pipeline steps: PrepareSource, CreateSnapshots, ShareSnapshots, DiskTransfer, ImageConversion, CreateVM, Cleanup | Plan details migration status (`getPipelineStepDisplayName`) |
| `SkipGuestConversion` + `UseCompatibilityMode` | SATA disks, E1000e NICs, no virt-v2v |
| `SkipZoneNodeSelector` | Skips AZ node selector on VM and conversion pod |
| Cross-account migration | Separate source/target credential fields in UI |

### Key differences from other providers

| Aspect | Other providers | EC2 |
|--------|----------------|-----|
| Code location | `pkg/controller/provider/` | `pkg/provider/ec2/` |
| Migration type | Cold, Warm, Live | **Cold only** |
| Disk transfer | CDI DataVolumes / populators | **EBS snapshot → volume → PV/PVC (CSI)** |
| Volume populators | Supported (varies) | **Not supported** |
| Cross-account | N/A | Snapshot sharing via STS |
| Platform gating | None | **AWS-platform clusters only** |
| Target credentials | N/A | **Required in secret** |
