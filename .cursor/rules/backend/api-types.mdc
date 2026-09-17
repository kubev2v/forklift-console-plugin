---
description: Forklift CRD type definitions - Plan, Provider, Migration, NetworkMap, StorageMap, Hook, Host, Conversion, conditions, phases
alwaysApply: false
---

# API Types (CRD Definitions)

> Analyzed from commit: `baf9c7bcc` on `2026-09-17`
> Source paths: `pkg/apis/forklift/v1beta1/`, `pkg/lib/condition/`, `pkg/controller/plan/migrator/base/` (pipeline step names)

## Package Purpose

Package `v1beta1` (`forklift.konveyor.io/v1beta1`) defines all Forklift CRDs. The `SchemeGroupVersion` is `forklift.konveyor.io/v1beta1`. All CRD types embed `meta.TypeMeta` + `meta.ObjectMeta` and follow the standard Spec/Status pattern. Every Status struct embeds `libcnd.Conditions` for the shared condition framework. Controllers populate transient `Referenced` fields (json `"-"`) during validation to hold resolved Provider, Map, Hook, and Secret objects.

---

## Key Types and Structs

### Provider (`provider.go`)

Represents a source or target infrastructure connection.

```go
ProviderSpec {
  Type           *ProviderType            // required
  URL            string                   // empty for "host" (local) OpenShift provider
  Secret         core.ObjectReference     // credentials secret
  Settings       map[string]string        // VDDK, SDK endpoint, vCenter, ESXi, target-az, etc.
}
ProviderStatus {
  Phase                 string             // free-form (Ready, Staging, ValidationFailed, ConnectionFailed)
  Conditions            libcnd.Conditions
  ObservedGeneration    int64
  Fingerprint           string
  Service               *core.ObjectReference
  SecretResourceVersion string             // detects credential rotation
}
```

**ProviderType enum** (`provider.go`):

| Constant | Value | UI support |
|---|---|---|
| `OpenShift` | `openshift` | Target + source |
| `VSphere` | `vsphere` | Source |
| `OVirt` | `ovirt` | Source |
| `OpenStack` | `openstack` | Source |
| `Ova` | `ova` | Source |
| `EC2` | `ec2` | Source (tech preview; AWS platform only) |
| `HyperV` | `hyperv` | Source (tech preview) |
| `Nutanix` | `nutanix` | Source (dev preview in UI) |
| `Azure` | `azure` | Backend only (not in console plugin yet) |
| `Undefined` | `""` | — |

**Key methods on Provider**:
- `Type() ProviderType` — returns type or `Undefined`
- `IsHost() bool` — OpenShift provider with empty URL (local cluster)
- `IsRestrictedHost() bool` — host provider outside main Forklift namespace
- `RequiresConversion() bool` — `vsphere | ova | hyperv | ec2 | azure`
- `SupportsPreserveStaticIps() bool` — `vsphere | hyperv`
- `HasReconciled() bool` — generation == observedGeneration
- `UseVddkAioOptimization() bool` — reads `settings["useVddkAioOptimization"]`
- `IsHyperVCluster() bool` — Hyper-V with `settings["managementType"] == "cluster"`

**Provider settings constants**:

| Key | Constant | Usage |
|---|---|---|
| `vddkInitImage` | `VDDK` | VDDK init container image |
| `sdkEndpoint` | `SDK` | SDK endpoint |
| `vcenter` | `VCenter` | vCenter endpoint type |
| `esxi` | `ESXI` | ESXi endpoint type |
| `useVddkAioOptimization` | `UseVddkAioOptimization` | VDDK AIO optimization |
| `vddkConfig` | `VddkConfig` | VDDK config map reference |
| `esxiCloneMethod` | `ESXiCloneMethod` | `"vib"` or `"ssh"` |
| `target-az` | `TargetAZ` | EC2 target availability zone |
| `target-region` | `TargetRegion` | EC2 target region |
| `prismType` | `NutanixPrismType` | `"central"` or `"element"` |
| `clusterUuid` | `NutanixClusterUUID` | Nutanix cluster UUID |
| `snapshotSku` | `AzureSnapshotSku` | Azure snapshot SKU |
| `snapshotResourceGroup` | `AzureSnapshotRG` | Azure snapshot resource group |
| `targetRegion` | `AzureTargetRegion` | Azure target region |
| `volumeSnapshotClassName` | `AzureSnapshotClass` | Azure volume snapshot class |
| `managementType` | `ManagementType` | Hyper-V: `"standalone"` or `"cluster"` |

**Secret field constants**: `insecureSkipVerify`, `token`

**Finalizers**: `forklift/ova-provider`, `forklift/hyperv-provider`

### Plan (`plan.go`)

Defines a migration plan selecting VMs and their mappings.

```go
PlanSpec {
  Description, TargetNamespace, ServiceAccount
  TargetLabels, TargetNodeSelector, TargetAffinity
  ConvertorLabels, ConvertorNodeSelector, ConvertorAffinity
  ConversionTempStorageClass, ConversionTempStorageSize
  Provider                       provider.Pair
  Map                            plan.Map               // Network + Storage ObjectReferences
  VMs                            []plan.VM
  Warm                           bool                   // deprecated; use Type
  Type                           MigrationType          // "cold"|"warm"|"live"|"conversion"
  TransferNetwork                *core.ObjectReference
  Archived                       bool
  PreserveClusterCPUModel        bool
  PreserveStaticIPs              bool                   // default true
  SkipZoneNodeSelector           bool                   // EC2 only
  MigrateSharedDisks             bool                   // default true
  RDMAsLun                       bool
  SCSIReservation                bool                   // requires rdmAsLun
  SelinuxRelabelAtBoot           bool
  SelinuxRelabelExclude          []string
  DeleteGuestConversionPod       bool
  DeleteVmOnFailMigration        bool                   // default true
  SkipGuestConversion            bool                   // default false
  UseCompatibilityMode           bool                   // default true (SATA/E1000E when skip guest conversion)
  RunPreflightInspection         bool                   // default true (vSphere warm)
  TargetPowerState               plan.TargetPowerState  // "on"|"off"|"auto"
  InstallLegacyDrivers           *bool
  EnableNestedVirtualization     *bool
  XfsCompatibility               bool
  VirtV2vImage                   string
  CustomizationScripts           *core.ObjectReference
  PVCNameTemplate                string
  PVCNameTemplateUseGenerateName *bool                  // default true (false for OCP)
  VolumeNameTemplate             string
  NetworkNameTemplate            string
  TagMapping                     *TagMapping            // vSphere tag → label filter
  DiskBus                        cnv.DiskBus            // deprecated
}
PlanStatus {
  Conditions              libcnd.Conditions
  ObservedGeneration      int64
  NetAppShiftDestination  bool                   // resolved from storage map
  Migration               plan.MigrationStatus   // VMs, history snapshots, timing
}
```

**MigrationType enum**: `cold`, `warm`, `live`, `conversion`

**TargetPowerState enum**: `on`, `off`, `auto`

**Key methods on Plan**:
- `IsWarm() bool` — `Spec.Warm || Spec.Type == "warm"`
- `ShouldUseV2vForTransfer(vmRef) (bool, error)` — virt-v2v direct transfer vs CDI+v2v-in-place
- `ShouldRunPreflightInspection() bool` — vSphere + warm + !skipGuestConversion + runPreflightInspection
- `IsUsingOffloadPlugin() bool` — any storage mapping has `vsphereXcopyConfig` or `csiVolumeImport`
- `HasNetAppShiftDestination() bool` — from `status.netAppShiftDestination`
- `IsSourceProviderVSphere/Ovirt/OCP/Openstack() bool`
- `DestinationHasUdnNetwork(client) bool` — primary UDN in target namespace

### plan.VM (`plan/vm.go`)

Individual VM entry in a Plan. Embeds `ref.Ref` (ID, Name, Namespace, Type).

Key fields: `Hooks []HookRef`, `LUKS`, `NbdeClevis`, `RootDisk`, `InstanceType`, `TargetName`, `TargetPowerState`, per-VM overrides for templates, `DeleteVmOnFailMigration`, `MigrateSharedDisks *bool`, `EnableNestedVirtualization *bool`, `RDMAsLun *bool`, `SCSIReservation *bool`, `SelinuxRelabelAtBoot *bool`, `SelinuxRelabelExclude []string`, `ExcludeDisks []string` (vSphere bus addresses, e.g. `"scsi0:1"`).

**HookRef**: `{ Step string, Hook core.ObjectReference }` — step name matches pipeline step or phase (e.g. `"PreHook"`, `"PostHook"`).

### plan.VMStatus (`plan/vm.go`)

Per-VM migration status. Embeds `Timed` + `VM` + `libcnd.Conditions`.

Key fields:
- `Pipeline []*Step` — UI-visible progress steps
- `Phase string` — current VM phase constant from `doc.go`
- `Error *Error` — `{ Phase, Reasons []string }`
- `Warm *Warm` — precopy tracking (successes, failures, consecutiveFailures, nextPrecopyAt, precopies)
- `RestorePowerState` — `"On"` | `"Off"` | `"Unknown"`
- `Firmware`, `OperatingSystem`, `DetectedBootDisk *int`, `NewName`
- `DisksCopied bool` — all disk transfer tasks completed; enables `Migration.spec.resumeConversion`

### Migration (`migration.go`)

Active migration execution, created when a Plan runs.

```go
MigrationSpec {
  Plan               core.ObjectReference  // ref to Plan
  Cancel             []ref.Ref             // VMs to cancel
  Cutover            *meta.Time            // warm migration cutover override
  VMCutover          []VMCutover           // per-VM cutover times (overrides global)
  ResumeConversion   bool                  // skip disk copy; reuse PVCs from failed migration
}
VMCutover { ID string, Cutover meta.Time }

MigrationStatus {
  Timed                          // Started, Completed
  Conditions      libcnd.Conditions
  ObservedGeneration int64
  VMs             []*plan.VMStatus
}
```

**Methods**: `Match(plan)`, `Canceled(ref)`, `CutoverFor(vmRef)`, `IsResumeConversion()`

### NetworkMap (`mapping.go`)

Maps source networks to target networks.

```go
NetworkMapSpec {
  Provider   provider.Pair
  Map        []NetworkPair
}
NetworkSourceRef { ref.Ref, Vlan string }   // VLAN 1–4094 for disambiguation
NetworkPair {
  Source         NetworkSourceRef
  Destination    DestinationNetwork
  NetworkIPMode  NetworkIPMode            // overrides plan preserveStaticIPs
}
DestinationNetwork { Type ("pod"|"multus"|"ignored"), Namespace, Name }
NetworkIPMode: "preserve" | "dhcp" | "none"
```

### StorageMap (`mapping.go`)

Maps source storage to target storage classes.

```go
StorageMapSpec {
  Provider   provider.Pair
  Map        []StoragePair
}
StoragePair {
  Source         ref.Ref
  Destination    DestinationStorage
  OffloadPlugin  *OffloadPlugin           // optional copy offload
}
DestinationStorage { StorageClass, VolumeMode ("Filesystem"|"Block"), AccessMode }
OffloadPlugin {
  VSphereXcopyPluginConfig *VSphereXcopyPluginConfig  // json: vsphereXcopyConfig
  CsiVolumeImport          *CsiVolumeImport          // json: csiVolumeImport
}
VSphereXcopyPluginConfig {
  SecretRef               string
  StorageVendorProduct    StorageVendorProduct
  DedicatedMigrationHosts []string              // optional ESXi host IDs for XCOPY
}
CsiVolumeImport {
  SecretRef               string
  StorageVendorProduct    StorageVendorProduct  // enum: primera3par, ontap only
}
```

**StorageVendorProduct enum** (XCOPY + general): `flashsystem`, `vantara`, `ontap`, `primera3par`, `pureFlashArray`, `powerflex`, `powermax`, `powerstore`, `infinibox`

**CSI Volume Import vendors** (subset): `primera3par`, `ontap` only

Both NetworkMap and StorageMap share `MapStatus { Conditions, Refs, ObservedGeneration }`.

**StorageMap methods**: `FindStorage(id)`, `FindStorageByName(name)`, `HasNetAppShiftDestination(client)` — checks `shift.netapp.io/storage-class-type: shift` annotation on destination StorageClass.

**GlanceSource constant**: `"glance"` — used in EC2/OpenStack storage mapping for Glance images.

### Hook (`hook.go`)

Pre/post migration scripts. Local hooks need `image`; AAP hooks need `aap` config.

```go
HookSpec {
  ServiceAccount string
  Image          string     // container image (local hooks)
  Playbook       string     // base64-encoded Ansible playbook
  Deadline       int64      // seconds
  AAP            *AAPConfig
}
AAPConfig {
  JobTemplateID int
  URL           string                    // optional per-hook override
  TokenSecret   *core.ObjectReference   // optional per-hook override
  Timeout       int64
}
```

Annotation: `forklift.konveyor.io/aap-job-template-name` — display-only AAP job template name.

### Host (`host.go`)

ESXi host for direct disk transfer (vSphere only).

```go
HostSpec {
  ref.Ref               // inline
  Provider   core.ObjectReference
  IpAddress  string
  Secret     core.ObjectReference
}
```

**Printed columns**: READY, CONNECTED, AGE

### Conversion (`conversion.go`)

Conversion or deep-inspection operation on a VM (not yet exported from `@forklift-ui/types`; UI uses local types in `src/utils/crds/conversion/`).

```go
ConversionSpec {
  Type             ConversionType   // DeepInspection|Inspection|InPlace|Remote
  Destination      core.ObjectReference
  VM               ref.Ref
  Disks            []DiskRef
  Connection       Connection       // virt-v2v credentials secret
  DiskEncryption   *DiskEncryption  // LUKS or Clevis
  Image, VDDKImage, TargetNamespace, XfsCompatibility, LocalMigration
  Settings         map[string]string
  PodSettings      PodSettings
  ExtraVolumes, ExtraMounts
}
ConversionStatus {
  Conditions, ObservedGeneration
  Phase            ConversionPhase   // Pending|Running|Succeeded|Failed|Canceled
  Stage            ConversionStage   // fine-grained pipeline position
  Message, Pod, StartTime, CompletionTime
  Snapshot         *SnapshotStatus   // vSphere snapshot lifecycle
  InspectionResult *InspectionResult // deep inspection outcome
}
```

**ConversionStage enum**: `CreatingPod`, `PodRunning`, `CreatingSnapshot`, `WaitingForSnapshot`, `RemovingSnapshot`, `WaitingForSnapshotRemoval`, `FetchingResults`, `Finished`

**InspectionResult**: `allChecksPassed` (backend snake_case `all_checks_passed` also seen — use `hasInspectionPassed` selector), `osInfo`, `concerns[]`, `filesystems[]`, `mountpoints[]`

**Conversion condition types**: `ConversionFailed`, `ConversionCanceled`

### OVAProviderServer / HyperVProviderServer

Sidecar server pods for OVA/HyperV inventory. Both: `Spec { Provider ObjectRef }`, `Status { Phase, Service *ObjectRef, Conditions }`.

### Volume Populators

Provider-specific CRDs for disk transfer:
- **OvirtVolumePopulator** — `Spec { EngineURL, EngineSecretName, DiskID, TransferNetwork }`
- **OpenstackVolumePopulator** — `Spec { IdentityURL, SecretName, ImageID, TransferNetwork }`
- **VSphereXcopyVolumePopulator** — `Spec { VmId, VmdkPath, SecretName, StorageVendorProduct, MigrationHost? }`

### ForkliftController (`forkliftcontroller.go`)

Operator configuration resource controlling feature flags and global defaults.

Key feature gates (`"true"` / `"false"` strings):
- `feature_ui_plugin`, `feature_validation`, `feature_volume_populator`, `feature_copy_offload`
- `feature_ocp_live_migration`, `feature_ova_appliance_management`
- `feature_vmware_system_serial_number`, `feature_auth_required`, `feature_cli_download`
- `feature_mcp_server`, `feature_vsphere_vmware_driver_removal`
- `feature_windows_registry_network_config`, `feature_windows_wait_for_reboot`
- `feature_use_conversion_cr`, `feature_xfs_repair_ignore`

Also holds global PVC name templates, virt-v2v image, AAP defaults, migration service account, etc.

### ref.Ref (`ref/ref.go`)

Universal source reference: `{ ID, Name, Namespace, Type }`. `ID` = managed object ID (e.g., vSphere MoRef). `Namespace` only relevant for OpenShift sources.

### Referenced (`referenced.go`)

Transient (non-serialized) struct holding resolved references during validation: `Provider {Source, Destination}`, `Secret`, `Plan`, `Map {Network, Storage}`, `Hooks`.

---

## Interfaces and Implementations

The API package defines data structures only; behavior lives in controllers. Notable type methods:

| Type | Methods | Purpose |
|---|---|---|
| `Provider` | `Type()`, `IsHost()`, `RequiresConversion()`, … | Provider capability checks |
| `Plan` | `IsWarm()`, `ShouldUseV2vForTransfer()`, `IsUsingOffloadPlugin()`, … | Migration strategy decisions |
| `Migration` | `Match()`, `Canceled()`, `CutoverFor()`, `IsResumeConversion()` | Migration lifecycle |
| `NetworkMap` | `FindNetwork*()`, `FindAllNetworks*()` | Network lookup by ID/type/name |
| `StorageMap` | `FindStorage()`, `HasNetAppShiftDestination()` | Storage lookup + NetApp Shift detection |
| `plan.VMStatus` | `FindStep()`, `ReflectPipeline()`, `AddError()` | Pipeline progress aggregation |
| `plan.Step` | `FindTask()`, `ReflectTasks()` | Nested task progress |
| `libcnd.Conditions` | `BeginStagingConditions()`, `SetCondition()`, `EndStagingConditions()`, `SetReady()`, `HasBlockerCondition()`, `IsReady()` | Condition staging framework |

---

## Reconciliation / Execution Flow

CRD types do not reconcile themselves; controllers watch Spec changes and write Status. High-level flow:

1. **Provider** — validate credentials → test connection → create inventory → set `Ready` + `ConnectionTestSucceeded` + `InventoryCreated`
2. **NetworkMap / StorageMap** — validate provider refs + mapping targets → set `Ready`
3. **Plan** — validate refs (providers, maps, hooks, VMs) → set `Ready` or blocker conditions
4. **Migration** (created when Plan starts) — per-VM itinerary execution → update `VMStatus.phase`, `pipeline`, conditions
5. **Conversion** — pod/snapshot lifecycle → update `phase`, `stage`, `inspectionResult`

### Migration Pipeline Steps (UI-visible)

Pipeline steps are built by `pkg/controller/plan/migrator/base` and stored in `VMStatus.pipeline[]`. Each `Step` has `name`, `phase`, `progress`, optional nested `tasks[]`, and optional `error`.

| Pipeline step name | Go constant | Typical VM phases grouped |
|---|---|---|
| `Initialize` | `Initialize` | Started, StorePowerState, PowerOffSource, WaitForPowerOff, CreateDataVolumes (cold) |
| `PreHook` | `PhasePreHook` | PreHook |
| `PreflightInspection` | `PreflightInspection` | PreflightInspection |
| `DiskAllocation` | `DiskAllocation` | AllocateDisks (virt-v2v / XCOPY offload) |
| `DiskTransfer` | `DiskTransfer` | CopyDisks, CopyingPaused, snapshot delta phases, ConvertOpenstackSnapshot |
| `DiskTransferV2v` | `DiskTransferV2v` | CopyDisksVirtV2V |
| `Cutover` | `Cutover` | Warm cutover phases (snapshots, checkpoints, finalize, power-off) |
| `ImageConversion` | `ImageConversion` | CreateGuestConversionPod, ConvertGuest |
| `VirtualMachineCreation` | `VMCreation` | CreateVM |
| `WaitForGuestReboots` | `PhaseWaitForGuestReboots` | WaitForGuestReboots (Windows post-migration setup) |
| `PostHook` | `PhasePostHook` | PostHook |
| `WaitForFinalSnapshotConsolidation` | `WaitForSnapshotConsolidation` | WaitForFinalSnapshotRemoval |

**Itinerary variants** (selected by plan type):
- **Cold** — full disk transfer + optional guest conversion + VM creation
- **Warm** — precopy loop, cutover, finalize, conversion, VM creation
- **OnlyConversion** — power off + convert + create VM (no disk copy)
- **ResumeConversion** — skip disk copy and power-off; reuse `DisksCopied` PVCs

**WindowsWaitForGuestReboot flag** (`WindowsWaitForGuestReboot`): gated by `feature_windows_wait_for_reboot`, target power state not `"off"`, Windows VM detected via inventory, guest conversion enabled. Runs after `CreateVM`, before `PostHook`.

---

## Phase Constants (`doc.go`)

### Common VM Phases

| Constant | Value |
|---|---|
| `PhaseStarted` | `"Started"` |
| `PhasePreHook` | `"PreHook"` |
| `PhasePostHook` | `"PostHook"` |
| `PhaseCompleted` | `"Completed"` |

### Warm and Cold Migration Phases

| Constant | Value |
|---|---|
| `PhaseAddCheckpoint` | `"AddCheckpoint"` |
| `PhaseAddFinalCheckpoint` | `"AddFinalCheckpoint"` |
| `PhaseAllocateDisks` | `"AllocateDisks"` |
| `PhaseConvertGuest` | `"ConvertGuest"` |
| `PhaseConvertOpenstackSnapshot` | `"ConvertOpenstackSnapshot"` |
| `PhaseCopyDisks` | `"CopyDisks"` |
| `PhaseCopyDisksVirtV2V` | `"CopyDisksVirtV2V"` |
| `PhaseCopyingPaused` | `"CopyingPaused"` |
| `PhaseCreateDataVolumes` | `"CreateDataVolumes"` |
| `PhaseCreateFinalSnapshot` | `"CreateFinalSnapshot"` |
| `PhaseCreateGuestConversionPod` | `"CreateGuestConversionPod"` |
| `PhaseCreateInitialSnapshot` | `"CreateInitialSnapshot"` |
| `PhaseCreateSnapshot` | `"CreateSnapshot"` |
| `PhaseCreateVM` | `"CreateVM"` |
| `PhaseWaitForGuestReboots` | `"WaitForGuestReboots"` |
| `PhaseFinalize` | `"Finalize"` |
| `PhasePreflightInspection` | `"PreflightInspection"` |
| `PhasePowerOffSource` | `"PowerOffSource"` |
| `PhaseRemoveFinalSnapshot` | `"RemoveFinalSnapshot"` |
| `PhaseRemovePenultimateSnapshot` | `"RemovePenultimateSnapshot"` |
| `PhaseRemovePreviousSnapshot` | `"RemovePreviousSnapshot"` |
| `PhaseStoreInitialSnapshotDeltas` | `"StoreInitialSnapshotDeltas"` |
| `PhaseStorePowerState` | `"StorePowerState"` |
| `PhaseStoreSnapshotDeltas` | `"StoreSnapshotDeltas"` |
| `PhaseWaitForFinalSnapshot` | `"WaitForFinalSnapshot"` |
| `PhaseWaitForFinalSnapshotRemoval` | `"WaitForFinalSnapshotRemoval"` |
| `PhaseWaitForInitialSnapshot` | `"WaitForInitialSnapshot"` |
| `PhaseWaitForPenultimateSnapshotRemoval` | `"WaitForPenultimateSnapshotRemoval"` |
| `PhaseWaitForPowerOff` | `"WaitForPowerOff"` |
| `PhaseWaitForPreviousSnapshotRemoval` | `"WaitForPreviousSnapshotRemoval"` |
| `PhaseWaitForSnapshot` | `"WaitForSnapshot"` |

### Step/Task Phases

| Constant | Value |
|---|---|
| `StepStarted` | `"Started"` |
| `StepPending` | `"Pending"` |
| `StepRunning` | `"Running"` |
| `StepCompleted` | `"Completed"` |

### Conversion Phases and Stages

See **Conversion** struct above. Phases: `Pending`, `Running`, `Succeeded`, `Failed`, `Canceled`.

---

## Status Conditions

### Condition Framework (`pkg/lib/condition/`)

**Condition struct fields**: `Type`, `Status` (`"True"`/`"False"`), `Reason`, `Category`, `Message`, `Suggestion`, `LastTransitionTime`, `Durable`, `Items`

**Categories**:

| Category | Effect |
|---|---|
| `Critical` | Blocks reconcile AND the `Ready` condition |
| `Error` | Blocks the `Ready` condition |
| `Warn` | Warning; does NOT block `Ready` |
| `Required` | Required for `Ready` |
| `Advisory` | Informational only |
| `ValidatingVDDK` | Triggers re-queue while pending |
| `VMMissingGuestIPs` | VM missing guest IPs |
| `VMMissingChangedBlockTracking` | Triggers re-queue |
| `SharedDisks` | User needs to power off VMs with shared disks |

**Staging pattern** (embedded in every CRD Status):

```go
status.BeginStagingConditions()
status.SetCondition(c1)
status.SetCondition(c2)
status.EndStagingConditions()
status.SetReady(!status.HasBlockerCondition(), "Ready message")
```

**Key collection methods**: `HasCondition()`, `HasAnyCondition()`, `HasBlockerCondition()`, `HasCriticalCondition()`, `IsReady()`, `FindCondition()`, `HasReQCondition()`

Built-in types from `lib/condition`: `Ready`, `ReconcileFailed`

### CRD-level Condition Type Constants (`doc.go`)

| Constant | Value | Used by |
|---|---|---|
| `ConditionExecuting` | `"Executing"` | Plan |
| `ConditionRunning` | `"Running"` | Migration |
| `ConditionPending` | `"Pending"` | Migration VMs |
| `ConditionCanceled` | `"Canceled"` | Migration VMs |
| `ConditionSucceeded` | `"Succeeded"` | Plan, Migration |
| `ConditionFailed` | `"Failed"` | Plan, Migration |
| `ConditionBlocked` | `"Blocked"` | Plan VMs |
| `ConditionDeleted` | `"Deleted"` | Plan VMs |

### Status Conditions per CRD

| CRD | Printed Columns | Key Conditions |
|---|---|---|
| **Provider** | TYPE, STATUS, READY, CONNECTED, INVENTORY, URL, AGE | Ready, ConnectionTestSucceeded, InventoryCreated |
| **Plan** | READY, EXECUTING, SUCCEEDED, FAILED, AGE | Ready, Executing, Succeeded, Failed |
| **Migration** | READY, RUNNING, SUCCEEDED, FAILED, AGE | Ready, Running, Succeeded, Failed |
| **NetworkMap** | READY, AGE | Ready |
| **StorageMap** | READY, AGE | Ready |
| **Hook** | Ready, Image, Age | Ready |
| **Host** | READY, CONNECTED, AGE | Ready, ConnectionTestSucceeded |
| **Conversion** | TYPE, PHASE, STAGE, READY, AGE | Ready, ConversionFailed, ConversionCanceled |

---

## REST API Endpoints

Not applicable — this package defines Kubernetes CRD schemas only. Inventory REST endpoints are documented in `infrastructure/rest-api.mdc`.

---

## Integration Points

| Consumer | Uses API types for |
|---|---|
| `pkg/controller/provider/` | Provider reconciliation, inventory lifecycle |
| `pkg/controller/plan/` | Plan validation, Migration CR creation, migrator itineraries |
| `pkg/controller/map/network/`, `map/storage/` | Map validation, offload plugin resolution |
| `pkg/controller/hook/` | Hook validation, Job creation |
| `pkg/controller/host/` | ESXi host connection testing |
| `pkg/forklift-api/webhooks/` | Admission validation/defaulting |
| `pkg/forklift-api/services/` | Inventory REST (reads provider inventory, not CRD spec directly) |
| Console plugin | Watches CRDs via OpenShift Console SDK; maps Status to UI enums |

Dependency direction: controllers → `v1beta1` types → `lib/condition`. API types never import controllers.

---

## Configuration

### Annotations and Labels (`doc.go`)

| Key | Constant | Usage |
|---|---|---|
| `forklift.konveyor.io/disk-source` | `AnnDiskSource` | PVC annotation identifying source disk |
| `forklift.konveyor.io/source` | `AnnSource` | PVC annotation identifying source type |
| `sourceHost` | `LabelSourceHost` | Label on migration resources |
| `shift.netapp.io/storage-class-type: shift` | — | NetApp Shift/Trident StorageClass detection |

System-managed labels on target VMs and convertor pods: `migration`, `plan`, `vmID`, `app`/`forklift.app`.

### ForkliftController Feature Flags

See **ForkliftController** struct above. UI reads these indirectly via operator ConfigMap / settings pages.

---

## Error Patterns

- **VMStatus.Error** — `{ Phase, Reasons []string }` set when a pipeline step or phase fails; aggregated by `ReflectPipeline()`
- **Task.Error / Task.Warning** — per-task errors during disk transfer; `Step.ReflectTasks()` rolls up to step level
- **Condition staging** — non-Durable conditions removed when not re-staged; prevents stale validation messages
- **Blocker conditions** — Critical/Error category prevents `Ready=True`; UI shows validation errors on Plan/Provider create
- **ResumeConversion** — requires `VMStatus.disksCopied=true` from prior migration; controller rejects otherwise

---

## Frontend Relevance

Go CRD fields map to TypeScript types in `@forklift-ui/types` (plus local Conversion types pending upstream export).

### CRD → TypeScript mapping

| Go Type / Field | `@forklift-ui/types` | Console plugin notes |
|---|---|---|
| `Provider` | `V1beta1Provider` | GVK: `ProviderModelGroupVersionKind` |
| `ProviderType` | `ProviderType` (via `spec.type`) | UI adds `ExtendedProviderType`; `azure` not in UI yet |
| `ProviderStatus.Phase` | `status.phase` | UI enum `ProviderStatus` adds `Unknown`, `ApplianceManagementEnabled` |
| `Plan` | `V1beta1Plan` | GVK: `PlanModelGroupVersionKind` |
| `MigrationType` | `spec.type` | `"cold"` / `"warm"` / `"live"` / `"conversion"` |
| `TargetPowerState` | `spec.targetPowerState`, `spec.vms[].targetPowerState` | `"on"` / `"off"` / `"auto"` |
| `Migration` | `V1beta1Migration` | GVK: `MigrationModelGroupVersionKind` |
| `NetworkMap` | `V1beta1NetworkMap` | `spec.map[].source.vlan`, `networkIPMode` |
| `StorageMap` | `V1beta1StorageMap` | `spec.map[].offloadPlugin.vsphereXcopyConfig` / `.csiVolumeImport` |
| `OffloadPlugin` | `V1beta1StorageMapSpecMapInnerOffloadPlugin` | UI enum `OffloadPlugin` in `storageMaps/utils/types.ts` |
| `VSphereXcopyPluginConfig` | `.vsphereXcopyConfig` | Includes `dedicatedMigrationHosts[]` |
| `CsiVolumeImport` | `.csiVolumeImport` | Vendors: `primera3par`, `ontap` only |
| `StorageVendorProduct` | `storageVendorProduct` string | UI enum `StorageVendorProduct` in `storageMaps/utils/types.ts` |
| `DestinationNetwork.Type` | `destination.type` | `"pod"` / `"multus"` / `"ignored"` |
| `DestinationStorage` | `destination` | `storageClass`, `volumeMode`, `accessMode` |
| `Hook` | `V1beta1Hook` | AAP: `spec.aap.jobTemplateId`, optional `url`/`tokenSecret` |
| `Host` | `V1beta1Host` | vSphere ESXi hosts tab |
| `Conversion` | Local `V1beta1Conversion` in `src/utils/crds/conversion/types.ts` | Pending `@forklift-ui/types` export (MTV-2482) |
| `libcnd.Condition` | `V1beta1*StatusConditions` | `type`, `status`, `category`, `message`, `reason`, `suggestion` |
| `plan.VMStatus.Pipeline` | `V1beta1PlanStatusMigrationVmsPipeline` | Progress bars in migration VM list |
| `plan.VMStatus.Phase` | `status.migration.vms[].phase` | Internal phase; UI maps pipeline step names for display |
| `plan.VM.Warm` | `status.migration.vms[].warm` | Warm migration precopy tracking |
| `ForkliftController` | Not directly typed in UI | Feature flags read via settings/overview |

### Pipeline step display mapping

UI maps pipeline `Step.name` via `getPipelineStepDisplayName()` in `src/plans/details/.../utils/utils.ts`:

| Backend step name | UI display key |
|---|---|
| `Initialize` | Initialize |
| `PreHook` | Pre-migration hook |
| `PreflightInspection` | Preflight inspection |
| `DiskAllocation` | Disk allocation |
| `DiskTransfer` / `DiskTransferV2v` | Disk transfer |
| `Cutover` | Cutover |
| `ImageConversion` | Image conversion |
| `VirtualMachineCreation` | Virtual machine creation |
| `WaitForGuestReboots` | Post-migration setup |
| `PostHook` | Post-migration hook |
| `WaitForFinalSnapshotConsolidation` | Snapshot consolidation |

**Copy-offload note**: For XCOPY/CSI offload, actual transfer progress is in `DiskAllocation`; `DiskTransferV2v` may complete instantly. UI uses `getVMDiskTransferPipeline()` to pick the active step.

### Plan status derivation

Backend conditions (`Ready`, `Executing`, `Succeeded`, `Failed`) → frontend `PlanStatuses` enum via `getPlanStatus()` in `planStatusResolver.ts`:

| Backend signal | Frontend status |
|---|---|
| `Succeeded=True` | `Completed` |
| `Executing=True` + warm VMs in `CopyingPaused` | `Paused` |
| `Executing=True` + VMs not started | `Pending` |
| `Executing=True` | `Executing` |
| `Failed=True` or blocker conditions | `CannotStart` / `Incomplete` |
| `spec.archived` or `Archived` condition | `Archived` |
| No conditions | `Unknown` |

### VM migration status derivation

Backend `VMStatus.conditions` + `phase` + `pipeline` → frontend `MigrationVirtualMachineStatus` and row labels (`Running`, `Waiting`, `Post-migration setup`, etc.) in migration VM list utils.

### Storage map form ↔ CR round-trip

`createOffloadPluginConfig()` in `storageMaps/utils/createOffloadPluginConfig.ts` writes the selected plugin key (`vsphereXcopyConfig` or `csiVolumeImport`) — never hardcode XCOPY only. `resolveOffloadPlugin()` reads it back for edit forms.

### Provider type gating in UI

| Provider | UI constant | Notes |
|---|---|---|
| `ec2`, `hyperv` | `isTechPreviewProvider()` | Shows `TechPreviewLabel` |
| `nutanix` | `isDevPreviewProvider()` | Dev preview label |
| `ec2` | `useClusterIsAwsPlatform` | Hidden on non-AWS clusters |
| `azure` | — | Backend CRD exists; no UI yet |
