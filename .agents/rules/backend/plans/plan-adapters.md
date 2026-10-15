---
description: Plan adapters - provider-specific migration logic, Builder/Client/Validator interfaces
alwaysApply: false
---

# Plan Adapters

> Analyzed from commit: `baf9c7bcc` on `2026-09-17`
> Source paths: `pkg/controller/plan/adapter/`, `pkg/provider/azure/controller/adapter/`, `pkg/provider/ec2/controller/adapter/`

## Package Purpose

The plan adapter pattern abstracts provider-specific migration logic behind a uniform interface. Each source provider implements the same `Adapter` factory (`Builder`, `Client`, `Validator`, `DestinationClient`, `Ensurer`) so the plan controller and migrator can orchestrate migrations without provider-specific branching. Provider-specific Builder/Client/Validator code lives either under `pkg/controller/plan/adapter/<provider>/` (legacy in-tree providers) or under `pkg/provider/<provider>/controller/` (Azure, EC2 — out-of-tree layout with dedicated migrator/scheduler packages).

---

## Factory Pattern

`pkg/controller/plan/adapter/doc.go` contains the `New()` factory that returns the correct adapter based on `provider.Type()`:

```go
func New(provider *api.Provider) (adapter Adapter, err error) {
    switch provider.Type() {
    case api.VSphere:   adapter = &vsphere.Adapter{}
    case api.OVirt:     adapter = &ovirt.Adapter{}
    case api.OpenStack: adapter = &openstack.Adapter{}
    case api.OpenShift: adapter = &ocp.Adapter{}
    case api.Ova:       adapter = &ova.Adapter{}       // alias for ovfbase.Adapter
    case api.EC2:       adapter = ec2adapter.New()     // pkg/provider/ec2/controller/adapter
    case api.HyperV:    adapter = &hyperv.Adapter{}
    case api.Nutanix:   adapter = &nutanix.Adapter{}
    case api.Azure:     adapter = azureadapter.New()   // pkg/provider/azure/controller/adapter
    default:            err = liberr.New("provider not supported.")
    }
}
```

The package re-exports base types so consumers import from `adapter` directly:
`Adapter`, `Builder`, `Ensurer`, `Client`, `Validator`, `DestinationClient`.

---

## Core Interfaces

### Adapter (top-level factory)

Each provider's `Adapter` struct implements this interface to construct the five sub-interfaces. All methods receive `*plancontext.Context` (plan execution context with source/destination provider refs, secrets, inventory clients, and plan spec).

```go
type Adapter interface {
    Builder(ctx *plancontext.Context) (Builder, error)
    Client(ctx *plancontext.Context) (Client, error)
    Validator(ctx *plancontext.Context) (Validator, error)
    DestinationClient(ctx *plancontext.Context) (DestinationClient, error)
    Ensurer(ctx *plancontext.Context) (Ensurer, error)
}
```

### Builder — constructs migration K8s resources

Translates source VM inventory into destination Kubernetes objects (DataVolumes, PVCs, VirtualMachine specs, Secrets, ConfigMaps).

| Method | Purpose |
|--------|---------|
| `Secret()` | Build credential secret for CDI import (user/password, CA cert) |
| `ConfigMap()` | Build certificate/config ConfigMap for the import |
| `DataVolumes()` | Create `cdi.DataVolume` specs per disk (VDDK for vSphere, imageIO for oVirt, HTTP for OpenStack/OVA/Nutanix, etc.) |
| `VirtualMachine()` | Build the `cnv.VirtualMachineSpec` — disks, NICs, firmware, CPU, memory, TPM |
| `Tasks()` | Build migration progress tasks (one per disk, sized in MB) |
| `TemplateLabels()` | OS-based template labels for the destination VM |
| `PodEnvironment()` | Env vars for the virt-v2v conversion pod |
| `LunPersistentVolumes/Claims()` | Direct LUN PVs/PVCs (oVirt FC/iSCSI LUNs) |
| `SupportsVolumePopulators()` | Whether provider uses volume populators (vSphere XCOPY offload) |
| `PopulatorVolumes()` | Build PVCs with DataSourceRef pointing to a volume populator CR |
| `PopulatorTransferredBytes()` | Query transfer progress from the populator CR |
| `PopulatorOffloadInfo()` | Offload metadata (e.g. `xcopyUsed`) surfaced as task annotations |
| `SetPopulatorDataSourceLabels()` / `GetPopulatorTaskName()` | Populator PVC labeling and task association |
| `PreferenceName()` | Resolve KubeVirt instance type preference |
| `ConfigMaps()` / `Secrets()` | Additional ConfigMaps/Secrets to create for the VM |
| `ConversionPodConfig()` | Provider-specific node selectors, labels, annotations for the conversion pod |
| `AdoptDownloadCookieSecretOwner()` | Set owner ref on short-lived HTTP download cookie Secrets (Nutanix PC, OCP export) |
| `RefreshImportCredentials()` | Refresh short-lived HTTP import credentials on auth failure (Nutanix PC cookies) |
| `NetAppShiftPVCs()` | Build PVCs for disks mapped to NetApp Shift StorageClasses (vSphere only) |
| `CsiImportPVCs()` | Build PVCs for disks with `CsiVolumeImport` configured (vSphere VVol/RDM) |
| `SourceVMLabelsAndAnnotations()` | Map source VM tags/custom attributes to destination labels/annotations (vSphere) |
| `ResolveDataVolumeIdentifier()` / `ResolvePersistentVolumeClaimIdentifier()` | Stable disk identifiers for resume/conversion flows |

### Client — source VM operations

Performs runtime operations on the source VM during migration.

| Method | Purpose |
|--------|---------|
| `PowerOn/Off()` | Control source VM power state |
| `PowerState()` / `PoweredOff()` | Query source VM power state |
| `CreateSnapshot()` | Create a warm-migration precopy snapshot (returns snapshot ID + task ID) |
| `RemoveSnapshot()` | Remove a snapshot after transfer |
| `CheckSnapshotReady/Remove()` | Poll snapshot creation/removal task status |
| `SetCheckpoints()` | Set CDI DataVolume checkpoint annotations for incremental copies |
| `GetSnapshotDeltas()` | Get per-disk change IDs from a snapshot (CBT for vSphere) |
| `Finalize()` | Post-migration cleanup (delete temp images, VMExports, etc.) |
| `DetachDisks()` | Detach LUN disks from the source VM (oVirt) |
| `PreTransferActions()` | Provider-specific pre-transfer setup (OpenStack volumes, Nutanix catalog images, OCP VMExport) |
| `Close()` | Close API connections |

### Validator — plan validation

Pre-flight checks before migration starts.

| Method | Purpose |
|--------|---------|
| `StorageMapped()` | All VM disks have storage mapping entries |
| `DirectStorage()` | LUN/FC disk details are complete (oVirt-specific) |
| `NetworksMapped()` | All VM NICs have network mapping entries |
| `MaintenanceMode()` | Host is not in maintenance mode |
| `WarmMigration()` | Provider supports warm migration |
| `MigrationType()` | Plan's migration type is valid for this provider |
| `NICNetworkRefs()` | Return one source-network ref per VM NIC |
| `StaticIPs()` | Static IP info available for all NICs |
| `UdnStaticIPs()` | UDN subnet matches VM IP addresses |
| `SharedDisks()` | Shared disk validation (vSphere: running VMs, duplicate detection) |
| `ExcludedDisks()` | Validate `excludeDisks` plan setting |
| `ChangeTrackingEnabled()` | CBT enabled for warm migration (vSphere) |
| `HasSnapshot()` | No pre-existing snapshots that conflict with warm migration |
| `PowerState()` | VM power state compatible with migration type |
| `VMMigrationType()` | VM inherently compatible (OCP: live migration checks) |
| `InvalidDiskSizes()` | All disks have valid sizes (> 0) |
| `MacConflicts()` | Source MAC addresses don't conflict with destination VMs |
| `PVCNameTemplate()` | PVC name template produces valid DNS1123 labels |
| `GuestToolsInstalled()` | Guest tools status check (vSphere: VMware Tools) |
| `ConsolidationNeeded()` | VM does not need snapshot consolidation before migration |

### DestinationClient — destination cluster operations

| Method | Purpose |
|--------|---------|
| `DeletePopulatorDataSource()` | Clean up volume populator CRs after migration |
| `SetPopulatorCrOwnership()` | Set owner references on populator CRs |

### Ensurer — resource creation on destination

Shared across in-tree providers (uses `ensurer.Ensurer` from `pkg/controller/plan/ensurer/`). Azure and EC2 use provider-local ensurers under `pkg/provider/<provider>/controller/ensurer/`.

| Method | Purpose |
|--------|---------|
| `SharedConfigMaps()` | Ensure ConfigMaps exist in destination namespace |
| `SharedSecrets()` | Ensure Secrets exist in destination namespace |
| `PersistentVolumeClaims()` | Ensure PVCs are present on the destination (idempotent, label-based) |

---

## PVC Converter (`converter.go`)

`adapter.Converter` orchestrates format conversion for PVCs that need virt-v2v post-import conversion. It creates scratch DataVolumes and Batch Jobs, polling until conversion completes. Used by the migration pipeline when disks require guest conversion after raw import.

---

## Shared Utilities

### `base/` package

- **Annotations**: CDI/Forklift annotation constants (`AnnDiskSource`, `AnnBindImmediate`, `AnnRequiresConversion`, `AnnCopyMethod`, `AnnNetAppShift`, `AnnNfsServer`, etc.)
- **`ConversionPodConfigResult`**: Provider-specific conversion pod config (NodeSelector, Labels, Annotations)
- **`VolumePopulatorNotSupportedError`**: Sentinel error for providers that don't support volume populators
- **`ValidatePVCNameTemplate()` / `ValidateAndExecuteTemplate()`**: Shared PVC name template validation
- **`DefaultPVCNameTemplate` / `DefaultOCPPVCNameTemplate`**: Default templates per provider class
- **MAC conflict detection**: `CheckMacConflicts()`, `FindSourceVM()`, `GetDestinationVMsFromInventory()`, `MacConflict` type
- **`DiskSerial()`**: Sanitized/truncated disk serial for KubeVirt (max 20 chars)
- **`SortedIPv4First()` / `HasMultipleIPsPerMAC()`**: NIC/IP ordering helpers for static IP mapping

### `ovfbase/` package

Shared logic for OVF-format providers (OVA and partially Hyper-V):
- **`ovfparser.go`**: Parses OVF XML for firmware type, OS info, disk metadata
- **`OsMapToOsinfoId()`**: Maps OVF OS type strings to osinfo IDs
- **`ParseCapacity()`**: Converts OVF capacity strings (with units) to bytes

### `ensurer/` package

Provider-agnostic resource creation on the destination cluster:
- Creates VirtualMachines, DataVolumes, PVCs by label (idempotent)
- Creates shared ConfigMaps and Secrets by name (allows pre-existing resources)

---

## Per-Provider Key Differences

### vSphere (`vsphere/`)

- **Transfer method**: VDDK via CDI, or virt-v2v for disk copying
- **Warm migration**: Supported via Changed Block Tracking (CBT) snapshots
- **Volume populators**: Supported via vSphere XCOPY offload (`VSphereXcopyVolumePopulator` CR) when `feature_copy_offload` is enabled and StorageMap has `OffloadPlugin.VSphereXcopyPluginConfig`
- **CSI Volume Import**: `CsiImportPVCs()` builds PVCs with `AnnCopyMethod=csi-import` for VVol/RDM disks; vendor plugins in `csi_import.go` (HPE Primera/3PAR, NetApp ONTAP via Trident)
- **NetApp Shift**: `NetAppShiftPVCs()` builds consumer-side PVCs with `AnnNetAppShift`, NFS server/path annotations for Shift/Trident integration
- **Host CRs**: Loads `api.Host` resources to determine ESXi direct transfer vs vCenter transfer
- **Builder.Load()**: Pre-loads host map on construction (unique to vSphere)
- **Connection**: govmomi SOAP client; supports per-ESXi-host client caching
- **Shared disks**: Full support — detects shared VMDK, validates running VMs, finds existing PVCs
- **RDM disks**: Maps as LUN devices when `RDMAsLun` is set; may use CSI import instead of DataVolumes
- **OS mapping**: Large `osMap` translating VMware guest IDs → osinfo IDs
- **PVC name templates**: Full template support with `VSpherePVCNameTemplateData`
- **Tag mapping**: `SourceVMLabelsAndAnnotations()` maps vSphere tags/custom attributes via `TagMapping` CR
- **Secret**: Maps `user`→`accessKeyId`, `password`→`secretKey`; adds CA cert
- **Libvirt URL**: Constructs `vpx://` (vCenter), `esx://` (ESXi direct) URLs for virt-v2v

### oVirt (`ovirt/`)

- **Transfer method**: imageIO (oVirt image transfer API) via CDI
- **Warm migration**: Supported via oVirt snapshot API (event-based polling)
- **LUN disks**: Full support for FC/iSCSI LUNs — builds `LunPersistentVolumes()` and `LunPersistentVolumeClaims()` with iSCSI target details
- **Connection**: `go-ovirt` SDK (`ovirtsdk.Connection`)
- **DirectStorage()**: Validates LUN disk details (logical unit size, storage type)
- **Finalize**: Removes migration snapshots and deletes transferred disks from source
- **DetachDisks**: Detaches LUN disks from source VM
- **Secret**: Includes CA certificate from provider in PEM format
- **ConfigMap**: Writes CA certificate for imageIO connections
- **Conversion pod config**: Adds `V2V_source=ovirt`, libvirt URI, password from secret

### OpenStack (`openstack/`)

- **Transfer method**: Glance image download via HTTP(S) or Cinder volume snapshots
- **Warm migration**: Not supported
- **Connection**: Custom OpenStack client (`libclient.Client`) with Keystone auth
- **Snapshot flow**: Creates Cinder volume snapshots → temporary volumes → Glance images for transfer
- **PreTransferActions**: Multi-step snapshot → volume → image pipeline with polling
- **Finalize**: Deletes temporary volumes and images created during migration
- **Image-based VMs**: Special handling for Glance-sourced VMs (maps `__glance` storage domain)
- **Secret**: OpenStack credentials (username, password, domain, project, region)
- **Volume populators**: Not supported

### OVA (`ova/`) — alias for ovfbase

- **Implementation**: Pure type alias to `ovfbase` package
- **Transfer method**: HTTP download from OVA server appliance (NFS-backed)
- **Warm migration**: Not supported
- **OVF parsing**: Shared `ovfparser.go` parses OVF XML for VM metadata
- **DataVolumes**: Uses `cdi.DataVolumeSourceHTTP` pointing to the OVA server URL
- **Secret/ConfigMap**: No-op (no per-VM credentials needed)
- **DestinationClient**: All methods are no-ops

### Hyper-V (`hyperv/`)

- **Implementation**: Separate adapter, not based on ovfbase despite OVF similarity
- **Transfer method**: SMB share with CSI driver (`-i disk` mode for virt-v2v)
- **Warm migration**: Not supported
- **Connection**: HyperV driver (`driver.HyperVDriver`) via WinRM/PowerShell
- **Storage validation**: Checks `disk.SMBPath` presence (single SMB share model)
- **Secret/ConfigMap**: No-op (SMB credentials handled by CSI driver at pod mount time)
- **Conversion pod config**: Adds node selector for `hyperv-host` label, SMB-related labels/annotations
- **Volume populators**: Not supported

### OpenShift (`ocp/`)

- **Transfer method**: VirtualMachineExport API → HTTPS download of VM volumes
- **Migration types**: Cold, Live (via `DecentralizedLiveMigration` feature gate), and Conversion
- **Warm migration**: Not supported
- **Connection**: `k8sclient.Client` to source OpenShift cluster (kubeconfig from provider secret, or local for `IsHost`)
- **ConfigMap**: Fetches TLS certificate from `VirtualMachineExport.Status.Links.External.Cert`
- **DataVolumes**: Uses `cdi.DataVolumeSourceHTTP` with export URL; special handling for ContainerDisk
- **PreTransferActions**: Creates `VirtualMachineExport` CR on source cluster, waits for ready
- **Finalize**: Deletes `VirtualMachineExport` CRs from source cluster
- **Live migration**: Validates `LiveMigratable` and `StorageLiveMigratable` conditions on source VMI
- **Volume populators**: Not supported

### Nutanix (`nutanix/`) — **new**

- **Transfer method**: HTTP download of per-disk catalog images via CDI `DataVolumeSourceHTTP`
- **Warm migration**: Not supported (cold only)
- **Connection**: Shared REST client (`pkg/lib/client/nutanix`) — same client as inventory collector
- **Prism Element vs Central**: Detected via `provider.Spec.Settings[NutanixPrismType]` or live probe of `/api/nutanix/v3/prism_central`
  - **Prism Element**: v3 Image Service — `PreTransferActions` creates v3 catalog images; `DataVolumes` point at `/api/nutanix/v3/images/{uuid}/file` with Basic Auth
  - **Prism Central**: v4 Image Service (`/api/vmm/v4.0/content/images`) — disk-based image creation; download via redirect+cookie handshake; cookie stored in dedicated Secret referenced via `SecretExtraHeaders`; `RefreshImportCredentials()` refreshes expired cookies
- **PreTransferActions**: Creates per-disk catalog images (v3 on PE, v4 on PC); polls until `sizeBytes` populated
- **Finalize**: Deletes temporary catalog images (v3 or v4 depending on endpoint type)
- **Power management**: ACPI shutdown with 5-minute grace period, then hard power-off; tracks state per migration UID
- **Builder**: Maps AHV boot type (LEGACY/UEFI/SECURE_BOOT), disk adapter (SCSI/SATA/IDE→KubeVirt bus), boot order from `boot_device_order_list`; explicitly disables vTPM
- **Secret**: Maps `user`→`accessKeyId`, `password`→`secretKey` for Basic Auth
- **ConfigMap**: CA cert for CDI HTTP importer; fetches server cert when `insecureSkipVerify` is set (same pattern as oVirt)
- **Validator**: Mostly stubbed with TODOs (storage/network mapping, MAC conflicts, disk sizes) — returns pass for now
- **Volume populators**: Not supported
- **DestinationClient**: No-op

### Azure (`pkg/provider/azure/controller/`) — **out-of-tree layout**

Adapter entry point: `pkg/provider/azure/controller/adapter/adapter.go`. Builder, Client, Validator, Ensurer, Migrator, and Scheduler live in sibling packages under `pkg/provider/azure/controller/`.

- **Transfer method**: Azure managed disk snapshots → CSI VolumeSnapshotContent with `disk.csi.azure.com` driver (no CDI DataVolumes)
- **Warm migration**: Not supported (cold only)
- **Connection**: Azure SDK (`armcompute`) with service principal credentials from provider secret (`subscriptionID`, `resourceGroup`, optional `tenantId`/`clientId`/`clientSecret`)
- **Provider settings**: `AzureSnapshotRG`, `AzureSnapshotSku` (default `Standard_LRS`), `AzureTargetRegion`, `AzureSnapshotClass`
- **Migration flow** (custom migrator itinerary):
  1. Store power state
  2. Optional pre-snapshots while VM running (pre-warm incremental tracking)
  3. Deallocate VM (`PowerOff` = deallocate, not stop)
  4. Create incremental disk snapshots
  5. Optional cross-region snapshot copy when target region differs
  6. Build VolumeSnapshotContent/VolumeSnapshot → PVC from CSI snapshots
  7. virt-v2v conversion if needed
- **Client**: `CreateDiskSnapshots()`, `CreatePreSnapshots()`, `DeallocateVM()`, `IsVMDeallocated()`, `IsCrossRegion()`; snapshot cleanup on failure
- **Builder**: Maps Azure VM size → vCPU/memory; builds KubeVirt VM spec from managed disks; `BuildVolumeSnapshotContent()` / `BuildVolumeSnapshot()` for CSI snapshot import
- **Validator**: Cold migration only; validates managed disks exist, network/storage mappings complete; many interface methods are no-ops
- **Volume populators**: Not supported
- **DestinationClient**: No-op

### EC2 (`pkg/provider/ec2/controller/`) — **out-of-tree layout**

Adapter entry point: `pkg/provider/ec2/controller/adapter/adapter.go`. Builder, Client, Validator, Ensurer live in sibling packages.

- **Transfer method**: EBS snapshots → direct EBS volume creation on target account → PV/PVC pairs (no CDI DataVolumes, no volume populators)
- **Warm migration**: Not supported (cold only); `SetCheckpoints`/`GetSnapshotDeltas` are no-ops
- **Connection**: AWS SDK v2 (`ec2`, `sts`) with credentials from provider secret
- **Cross-account mode**: When `targetAccessKeyId`/`targetSecretAccessKey` present in secret, source client handles snapshots/power, target client handles volume creation; `GetTargetAccountID()` via STS
- **Client**: `PowerOn/Off/State/PoweredOff` via EC2 instance APIs; snapshot and volume operations split by account
- **Builder**: Maps EC2 instance → KubeVirt VM; EBS volumes → PVCs with `forklift.konveyor.io/volume-id` annotation; `EBSCSIDriver = ebs.csi.aws.com`; PVC size includes filesystem/block overhead
- **Validator**: Validates EBS volumes exist (rejects instance store), network/storage mappings complete
- **Volume populators**: Not supported (`SupportsVolumePopulators()` returns false)
- **DestinationClient**: No-op

---

## How Adapters Connect Inventory to Execution

```
plancontext.Context
├── Source.Provider     → API provider CR
├── Source.Secret       → Provider credentials
├── Source.Inventory    → Inventory client (Find/Get/List VMs, networks, datastores)
├── Destination.Client  → K8s client for target cluster
├── Plan               → Plan CR (spec.vms, mappings, settings)
├── Migration          → Active Migration CR
└── Map.Network/Storage → Resolved NetworkMap/StorageMap CRs

Adapter.Builder(ctx) → reads inventory → builds K8s objects
Adapter.Client(ctx)  → connects to source API → manages VM lifecycle
Adapter.Validator(ctx) → reads inventory → validates plan feasibility
```

Each sub-interface embeds `*plancontext.Context` and uses `r.Source.Inventory.Find(vm, vmRef)` to load VM details from the provider inventory cache, then applies provider-specific transformations to produce Kubernetes resources.

---

## Migration Type Support Matrix

| Provider | Cold | Warm | Live | Conversion |
|----------|------|------|------|------------|
| vSphere | Yes | Yes (CBT) | No | Yes |
| oVirt | Yes | Yes (snapshots) | No | Yes |
| OpenStack | Yes | No | No | No |
| OVA | Yes | No | No | No |
| Hyper-V | Yes | No | No | No |
| OpenShift | Yes | No | Yes | Yes |
| Nutanix | Yes | No | No | No |
| Azure | Yes | No | No | No |
| EC2 | Yes | No | No | No |

---

## Integration Points

| Caller | Uses adapters for |
|--------|-------------------|
| `pkg/controller/plan/controller.go` | Validation via `Validator`, resource building via `Builder` |
| `pkg/controller/plan/migration.go` / `kubevirt.go` | Client lifecycle, Ensurer, Converter, populator/offload paths |
| `pkg/controller/plan/migrator/` | In-tree provider migration itineraries |
| `pkg/provider/azure/controller/migrator/` | Azure-specific itinerary (snapshots, deallocate, CSI import) |
| `pkg/provider/ec2/controller/migrator/` | EC2-specific itinerary (snapshots, EBS volumes) |
| `pkg/controller/plan/scheduler/` | Per-provider VM scheduling (Azure/EC2 have own schedulers) |

---

## Frontend Relevance

- **Provider types**: Console must handle `nutanix`, `azure`, and `ec2` provider types in plan create/validation UI (EC2 gated by `useClusterIsAwsPlatform`; Azure/Nutanix are tech-preview candidates).
- **Migration pipeline steps**: Azure exposes custom phases (`PrepareSource`, CSI snapshot steps) visible in Migration status; Nutanix shows standard CDI import steps after catalog image creation.
- **StorageMap offload plugins**: vSphere XCOPY and CSI Volume Import (`csiVolumeImport`) must round-trip in UI forms — never hardcode XCOPY only.
- **Plan validation errors**: Validator methods return provider-specific messages for `SharedDisks`, `HasSnapshot`, `ExcludedDisks`, `MacConflicts`, `GuestToolsInstalled`, `ConsolidationNeeded` — surfaced in plan conditions.
- **Nutanix validator gaps**: Backend validation is largely stubbed; UI should not assume server-side pre-flight catches all mapping errors for Nutanix yet.
