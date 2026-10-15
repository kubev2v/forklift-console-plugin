---
description: StorageMap controller - validation, inventory-based checks, offload plugins, mapping structure
alwaysApply: false
---

# StorageMap Controller

> Analyzed from commit: `baf9c7bcc` on `2026-09-17`
> Source paths: `pkg/controller/map/storage/`, `pkg/apis/forklift/v1beta1/mapping.go`

---

## Package Purpose

The StorageMap controller reconciles `StorageMap` CRs (`forklift.konveyor.io/v1beta1`). Each StorageMap defines how source provider storage maps to target OpenShift StorageClasses for VM disk migration. It validates provider references and inventory-backed source/destination storage, sets status conditions, and watches provider inventory so maps re-reconcile when referenced storage changes. **Offload plugin configuration is stored on the CR but not validated here** — enforcement happens via CRD schema, plan validation, and the vSphere migration adapter at execution time.

---

## Mapping Structure

```
spec:
  provider:
    source:      { namespace, name }    # ref to source Provider CR
    destination: { namespace, name }    # ref to destination Provider CR (must be OpenShift)
  map:
    - source:                           # ref.Ref — identifies source storage
        id: "<inventory-id>"            # match by ID
        name: "<storage-name>"          # OR match by name (path suffix on most providers)
      destination:
        storageClass: "<sc-name>"         # target StorageClass name (required)
        volumeMode: "Filesystem" | "Block"        # optional PVC volume mode
        accessMode: "ReadWriteOnce" | "ReadWriteMany" | "ReadOnlyMany"  # optional
      offloadPlugin:                    # optional — per-pair offload config (vSphere only at runtime)
        vsphereXcopyConfig:             # XCOPY via volume populator
          secretRef: "<secret-name>"    # in source provider namespace
          storageVendorProduct: "<vendor>"
          dedicatedMigrationHosts: ["<esxi-host-id>", ...]  # optional
        csiVolumeImport:                # CSI driver native import (MTV-5483)
          secretRef: "<secret-name>"
          storageVendorProduct: "primera3par" | "ontap"
```

### Destination Fields

| Field | Required | Values | Purpose |
|---|---|---|---|
| `storageClass` | Yes | Any valid SC name on target cluster | Target StorageClass for migrated PVCs |
| `volumeMode` | No | `Filesystem`, `Block` | PVC volume mode override |
| `accessMode` | No | `ReadWriteOnce`, `ReadWriteMany`, `ReadOnlyMany` | PVC access mode override |

---

## Key Types and Structs

From `pkg/apis/forklift/v1beta1/mapping.go`:

```go
type StoragePair struct {
    Source        ref.Ref
    Destination   DestinationStorage
    OffloadPlugin *OffloadPlugin
}

type DestinationStorage struct {
    StorageClass string
    VolumeMode   core.PersistentVolumeMode   // Filesystem | Block
    AccessMode   core.PersistentVolumeAccessMode
}

type OffloadPlugin struct {
    VSphereXcopyPluginConfig *VSphereXcopyPluginConfig `json:"vsphereXcopyConfig,omitempty"`
    CsiVolumeImport          *CsiVolumeImport          `json:"csiVolumeImport,omitempty"`
}

type VSphereXcopyPluginConfig struct {
    SecretRef               string
    StorageVendorProduct    StorageVendorProduct
    DedicatedMigrationHosts []string  // optional ESXi host IDs
}

type CsiVolumeImport struct {
    SecretRef            string
    StorageVendorProduct StorageVendorProduct  // CRD enum: primera3par, ontap
}
```

`StorageMap` also exposes helpers used downstream: `FindStorage`, `FindStorageByName`, `HasNetAppShiftDestination` (checks destination SC annotation `shift.netapp.io/storage-class-type=shift`).

---

## Interfaces and Implementations

### Inventory watch handler factory (`handler/doc.go`)

```go
type Handler interface {
    Watch(m *handler.WatchManager) error
}
```

| Provider | Handler package | Inventory resource watched | Match logic |
|---|---|---|---|
| vSphere | `handler/vsphere` | `vsphere.Datastore` | `ref.ID == ds.ID` or `HasSuffix(ds.Path, ref.Name)` |
| oVirt | `handler/ovirt` | `ovirt.StorageDomain` | Same as vSphere |
| OpenStack | `handler/openstack` | `openstack.VolumeType` | Same as vSphere |
| OVA | `handler/ova` | `ova.Disk` | Same as vSphere |
| Nutanix | `handler/nutanix` | `nutanix.StorageContainer` | `ref.ID == sc.ID` or `ref.Name == sc.Name` |
| OpenShift (destination) | `handler/ocp` | `ocp.StorageClass` | Periodic polling — no real-time watch |
| Hyper-V | `handler/hyperv` | *(no-op)* | Single SMB share — no distinct storage entities |
| EC2 | `pkg/provider/ec2/controller/handler` | EC2 storage handler | Separate provider package |
| Azure | `pkg/provider/azure/controller/handler` | Azure storage handler | Separate provider package |

---

## Reconciliation / Execution Flow

```
Reconcile()
 ├─ Fetch StorageMap CR (return if NotFound)
 ├─ BeginStagingConditions()
 ├─ Record Kubernetes events (from current conditions)
 ├─ validate(mp)
 │   ├─ ProviderPair.Validate() — source + destination providers
 │   │   └─ Short-circuit storage checks if any provider condition is set
 │   ├─ validateSource(mp) — source storage vs source provider inventory
 │   └─ validateDestination(mp) — destination StorageClass vs OCP inventory
 ├─ Set Ready condition (if no blocker conditions)
 ├─ EndStagingConditions()
 └─ Update status (ObservedGeneration = Generation)
```

```mermaid
flowchart TD
    A[StorageMap event] --> B[Reconcile]
    B --> C{Provider pair valid?}
    C -->|No| D[Provider conditions only]
    C -->|Yes| E[validateSource via inventory.Storage]
    E --> F[validateDestination via inventory.Storage]
    F --> G{HasBlockerCondition?}
    G -->|No| H[Set Ready=True]
    G -->|Yes| I[Skip Ready]
    H --> J[Status.Update]
    I --> J
```

### Watch Triggers

1. **StorageMap CR** — Create always; Update only when `ObservedGeneration < Generation`; Delete cleans `libref.Mapper`.
2. **Provider CR** — On reconciled provider update, `ensureWatch()` starts inventory watch when provider has `Ready` condition.
3. **Inventory channel** — Buffered channel (size 10) receives generic events from per-provider inventory watchers; enqueues affected StorageMaps.

**OCP special case**: `handler/ocp` uses `EnsurePeriodicEvents()` at `DefaultEventInterval` because OCP inventory does not support web watches. Reconciles all StorageMaps referencing the OCP provider as source or destination.

**Hyper-V special case**: `Watch()` is a no-op.

---

## Status Conditions

### StorageMap controller conditions

| Condition | Category | Reason | Blocker? | Meaning |
|---|---|---|---|---|
| `Ready` | Required | — | No | Map is valid and usable by plans |
| `SourceProviderNotValid` | Critical | `NotSet`, `NotFound` | Yes | Source provider ref missing or not found |
| `SourceProviderNotReady` | Critical | — | Yes | Source provider not reconciled |
| `DestinationProviderNotValid` | Critical | `NotSet`, `NotFound`, `TypeNotValid` | Yes | Dest provider invalid or not OpenShift |
| `DestinationProviderNotReady` | Critical | — | Yes | Dest provider not reconciled |
| `SourceStorageNotValid` | Critical / Warn | `NotSet`, `NotFound`, `Ambiguous` | Yes for `NotSet`/`Ambiguous`; **No** for `NotFound` | Source storage ref issue |
| `DestinationStorageNotValid` | Critical | `NotFound` | Yes | Target StorageClass not found in inventory |

Provider-pair conditions come from shared `validation.ProviderPair` (`pkg/controller/validation/provider.go`).

### Validation Detail

#### Provider pair (`validate`)

Uses `validation.ProviderPair.Validate(mp.Spec.Provider)`. Destination must be type `OpenShift`. On any provider failure, source/destination storage validation is skipped.

#### Source storage (`validateSource`)

For each `spec.map` entry:

1. If `source.ID` and `source.Name` are both empty → `SourceStorageNotValid` / `NotSet` / `Critical` (per entry, `continue`).
2. Look up via `inventory.Storage(ref)` on the **source** provider's inventory web client.
3. `NotFoundError` → collected into `notValid` list.
4. `RefNotUniqueError` → collected into `ambiguous` list.
5. Valid refs appended to `status.refs`.

Batch conditions after loop:

- `SourceStorageNotValid` / `NotFound` / **Warn** — non-blocking; `Items` lists invalid refs.
- `SourceStorageNotValid` / `Ambiguous` / **Critical** — blocking; `Items` lists ambiguous refs.

#### Destination storage (`validateDestination`)

For each `spec.map` entry:

1. Look up `destination.storageClass` by name: `inventory.Storage(&ref.Ref{Name: name})` on the **destination** provider.
2. `NotFoundError` → collected into `notValid` list.

Condition: `DestinationStorageNotValid` / `NotFound` / `Critical` with `Items` listing missing StorageClass names. No `Ambiguous` reason for destinations (exact name lookup).

---

## Storage Offload Plugins

Each `StoragePair` may optionally specify `offloadPlugin` for hardware-accelerated disk copy. **Only meaningful for vSphere source migrations** when `feature_copy_offload` is enabled on the `ForkliftController` CR (`settings.Settings.CopyOffload`).

### `vsphereXcopyConfig` vs `csiVolumeImport`

| Aspect | `vsphereXcopyConfig` | `csiVolumeImport` |
|---|---|---|
| Mechanism | `VSphereXcopyVolumePopulator` CR + volume populator pod offloads copy to vSphere + storage array | Destination CSI driver clones/imports source array volume via PVC import annotations |
| Populator pod / CR | Yes | **No** — no populator pod, CR, or service account |
| `secretRef` namespace | Source provider namespace | Source provider namespace |
| `storageVendorProduct` CRD enum | All 9 vendors (see table below) | `primera3par`, `ontap` only |
| `dedicatedMigrationHosts` | Supported (ESXi host ID list) | N/A |
| Disk types | VMDK, RDM, VVol (via XCOPY path) | Primarily **VVol and RDM** — VMDK disks on CSI-import-only datastores still need XCOPY |
| Plan mixed-usage | Counted as offload (not VDDK) | Counted as offload (not VDDK) |
| When both set on same pair | Backend accepts both keys; **frontend resolves CSI first** when both blocks have `secretRef` or `storageVendorProduct` |

### Supported `storageVendorProduct` values

**XCOPY (`vsphereXcopyConfig`)** — full enum in `StorageVendorProducts()`:

| Value | Vendor / product |
|---|---|
| `flashsystem` | IBM FlashSystem |
| `vantara` | Hitachi Vantara |
| `ontap` | NetApp ONTAP |
| `primera3par` | HPE Primera / 3PAR |
| `pureFlashArray` | Pure Storage FlashArray |
| `powerflex` | Dell PowerFlex |
| `powermax` | Dell PowerMax |
| `powerstore` | Dell PowerStore |
| `infinibox` | Infinidat InfiniBox |

**CSI Volume Import (`csiVolumeImport`)** — CRD-gated subset: `primera3par`, `ontap`.

### Runtime consumption (plan layer, not StorageMap controller)

1. `Plan.IsUsingOffloadPlugin()` — true when any mapped pair has a non-nil `OffloadPlugin` with either `VSphereXcopyPluginConfig` or `CsiVolumeImport` set.
2. **vSphere adapter** (`pkg/controller/plan/adapter/vsphere/builder.go`):
   - `SupportsVolumePopulators()` — requires `CopyOffload` setting and at least one configured offload pair.
   - XCOPY path creates populator PVCs from `vsphereXcopyConfig` (including RDM NAA vendor resolution and `dedicatedMigrationHosts`).
   - CSI path creates import PVCs from `csiVolumeImport`.
3. **Plan validation** (`pkg/controller/plan/validation.go`):
   - Mixed VDDK + offload within one plan is rejected when source is vSphere and copy offload is enabled.
   - `vmUsesVddk()` treats both XCOPY and CSI import as valid offload (disk without either plugin block → VDDK).
   - Warns for RDM / independent disks when VDDK is used — suggests enabling XCOPY in storage mapping.
4. **Feature gate**: `ForkliftController.spec.feature_copy_offload`; operator also exposes `populator_vsphere_copy_offload_image_fqin`.

---

## Integration Points

| Caller / callee | Relationship |
|---|---|
| `validation.ProviderPair` | Shared provider validation with NetworkMap |
| `controller/provider/web` | `NewClient(provider)` → `inventory.Storage(ref)` for validation |
| `controller/watch/handler` | Base watch manager for inventory event handlers |
| `lib/ref.Mapper` | Tracks StorageMap refs on create/update/delete |
| `pkg/controller/plan/*` | Reads `StorageMap.spec.map` offload config at migration time |
| `pkg/apis/forklift/v1beta1/plan.go` | `IsUsingOffloadPlugin()`, warm/cold virt-v2v eligibility |

**Dependency direction**: StorageMap controller → validation, provider web client, watch handlers. Plan controller → StorageMap CR (read-only for offload/mapping).

---

## Configuration

| Setting | Source | Effect on StorageMap |
|---|---|---|
| `feature_copy_offload` | `ForkliftController` CR | Gates whether offload plugins are used at migration time (not validated by StorageMap controller) |
| `populator_vsphere_copy_offload_image_fqin` | `ForkliftController` CR | XCOPY populator image for vSphere offload migrations |
| Inventory refresh interval | `handler.DefaultEventInterval` | OCP destination StorageClass polling cadence |

---

## Error Patterns

- **Inventory client creation failure** — `validateSource` / `validateDestination` return error; reconcile retries.
- **Non-NotFound inventory errors** — Propagate immediately (not collected into condition lists).
- **Source `NotFound`** — Warn category: map can still become `Ready`; plan-level validation may block migration.
- **Source `Ambiguous` / `NotSet`, destination `NotFound`** — Critical blockers; `Ready` not set.
- **Watch setup failure** — Logged via `log.Trace`; does not fail StorageMap reconcile.

---

## Differences from NetworkMap

| Aspect | NetworkMap | StorageMap |
|---|---|---|
| Destination type | `pod` / `multus` / `ignored` | StorageClass name + optional PVC modes |
| Destination validation | Skips `pod`/`ignored`; checks NAD for `multus` | Always checks StorageClass exists |
| Ambiguous destination | Yes (multus without namespace) | No (exact name lookup) |
| Offload plugin | N/A | Per-pair `vsphereXcopyConfig` or `csiVolumeImport` |
| Hyper-V inventory watch | Watches `hyperv.Network` | No-op (single SMB share) |
| Nutanix inventory watch | — | Watches `nutanix.StorageContainer` |

---

## Frontend Relevance

### CR shape ↔ TypeScript

| Backend field | Frontend type / location |
|---|---|
| `spec.map[].source` | `V1beta1StorageMapSpecMap.source` / `StorageMapFieldId.SourceStorage` |
| `spec.map[].destination.storageClass` | `StorageMapFieldId.TargetStorage` |
| `spec.map[].destination.volumeMode` | `StorageMapFieldId.VolumeMode` |
| `spec.map[].destination.accessMode` | `StorageMapFieldId.AccessMode` |
| `spec.map[].offloadPlugin.vsphereXcopyConfig` | `OffloadPlugin.VSphereXcopyConfig` in `src/storageMaps/utils/types.ts` |
| `spec.map[].offloadPlugin.csiVolumeImport` | `OffloadPlugin.CsiVolumeImport` |
| `status.conditions` | Drives list/details validation indicators |
| `status.refs` | Populated valid source refs after reconciliation |

### Offload UI behavior (`src/storageMaps/`)

- **Feature gate**: `isFeatureEnabled(FEATURE_NAMES.COPY_OFFLOAD)` (`feature_copy_offload`) — offload section shown only for **vSphere** source when enabled (`CreateStorageMapFieldTable`, plan storage map tables).
- **Plugin discovery**: `useOffloadPlugins` reads CRD `offloadPlugin.properties` keys; falls back to `OffloadPlugin` enum.
- **Vendor products**: `useStorageVendorProducts(offloadPlugin)` reads per-plugin CRD enum; CSI fallback is `CSI_VOLUME_IMPORT_VENDOR_PRODUCTS` (`primera3par`, `ontap`); XCOPY uses full `StorageVendorProduct` enum.
- **Plugin resolution**: `resolveOffloadPlugin()` — **CSI takes priority** when both plugin blocks are configured with `secretRef` or `storageVendorProduct`; empty `{}` blocks ignored.
- **Form → CR round-trip**: `createOffloadPluginConfig()` writes exactly one plugin key — never hardcode XCOPY; respect selected `OffloadPlugin`.
- **Validation**: `validateOffloadFields()` enforces all-or-nothing (`offloadPlugin`, `storageSecret`, `storageProduct`); `dedicatedMigrationHosts` only for XCOPY.
- **Multiple rows per source**: Supported (MTV-6324) — same source storage, different target SC and/or offload config.

### Condition display expectations

| Condition | UI impact |
|---|---|
| `Ready=True` | Map usable in plan wizard/details |
| `SourceStorageNotValid` / `NotFound` / Warn | Show warning; map may still be Ready |
| `SourceStorageNotValid` / `Ambiguous` / Critical | Blocking error with `Items` list |
| `DestinationStorageNotValid` / `NotFound` | Blocking — StorageClass missing on target |
| Provider conditions | Same patterns as NetworkMap |

### Plan integration

- Plans referencing a StorageMap with offload affect plan conditions (`MixedCopyMethod`, RDM/independent-disk warnings) — surface in plan details, not storage map pages.
- EC2 storage mappings: frontend explicitly omits `offloadPlugin` (`buildStorageMappings.ec2.test.ts`).

---

## Key Code Locations

| File | Purpose |
|---|---|
| `controller.go` | Controller setup, watches, `Reconcile()` |
| `validation.go` | Provider pair, source/destination inventory validation |
| `predicate.go` | Event filtering; `ensureWatch()` for inventory |
| `handler/doc.go` | Handler factory per provider type |
| `handler/<provider>/handler.go` | Inventory watch + enqueue affected StorageMaps |
| `storage_test.go` | Condition category tests (permissive `NotFound` = Warn) |
| `pkg/apis/forklift/v1beta1/mapping.go` | CRD types, offload structs, `HasNetAppShiftDestination` |
| `operator/config/crd/bases/forklift.konveyor.io_storagemaps.yaml` | CRD OpenAPI for offload plugin enums |
