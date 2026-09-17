---
description: Hyper-V provider - WinRM inventory, PowerShell scripts, SMB storage, driver library, REST API, HyperVProviderServer CRD
alwaysApply: false
---

# Hyper-V Provider

> Analyzed from commit: `baf9c7bcc` on `2026-09-17`
> Source paths: `pkg/controller/provider/container/hyperv/`, `pkg/controller/provider/model/hyperv/`, `pkg/controller/provider/web/hyperv/`, `pkg/controller/hyperv/`, `pkg/lib/hyperv/`

## Package Purpose

The Hyper-V provider collects VM inventory from Windows Hyper-V hosts (standalone or Failover Cluster) via **WinRM** (PowerShell remoting over HTTPS). Disk files are accessed through an **SMB share** mounted in a sidecar pod (`HyperVProviderServer`) via the SMB CSI driver. Inventory is stored in the file-backed DB and exposed through the inventory REST API at `/providers/hyperv/…`.

```
┌──────────────────────┐
│  Hyper-V Host/Cluster│
│  - WinRM :5986       │
│  - SMB share         │
└──────────┬───────────┘
           │ WinRM/HTTPS (PowerShell)
           ▼
┌─────────────────────────┐
│  Inventory Collector    │  (forklift-controller)
│  - WinRM driver         │
│  - libmodel DB          │
│  - OPA VM validation    │
└────────────┬────────────┘
             │ HTTP POST /validate-disks
             ▼
┌─────────────────────────┐
│  HyperV Provider Server │  (Deployment + SMB CSI mount)
│  - Mounts SMB at /hyperv│
│  - /validate-disks      │
│  - /healthz             │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Inventory REST API     │
│  /providers/hyperv/…    │
└─────────────────────────┘
```

---

## Key Source Locations

| Component | Path (under `pkg/`) |
|-----------|---------------------|
| Collector + adapters | `controller/provider/container/hyperv/` |
| Data model | `controller/provider/model/hyperv/` |
| Wire types | `controller/provider/model/hyperv/types/` |
| REST API handlers | `controller/provider/web/hyperv/` |
| HyperVProviderServer controller | `controller/hyperv/` |
| WinRM driver | `lib/hyperv/driver/` |
| PowerShell scripts | `lib/hyperv/powershell/scripts.go` |

---

## Provider Configuration

### Secret Fields

| Field | Required | Description |
|-------|----------|-------------|
| `username` | Yes | Hyper-V host admin username |
| `password` | Yes | Hyper-V host password |
| `smbUrl` | Yes | SMB share URL (e.g., `//192.168.1.100/VMShare`) |
| `smbUser` | No | Dedicated SMB username (falls back to `username`) |
| `smbPassword` | No | Dedicated SMB password (falls back to `password`) |

### Provider Settings (`spec.settings`)

| Setting | Default | Description |
|---------|---------|-------------|
| `winrmPort` | `5986` | WinRM HTTPS port on the host |
| `managementType` | `standalone` | `standalone` or `cluster` (Failover Cluster) |

`Provider.IsHyperVCluster()` is true when `type=hyperv` and `managementType=cluster`. Cluster mode validates `Get-Cluster` succeeds on connect and adds Cluster/Host inventory plus parallel collection phases.

### Provider URL

Host address only — IP, FQDN, optional port, or IPv6 bracket form (`[::1]`). Not a full URL scheme.

---

## WinRM Driver (`pkg/lib/hyperv/driver`)

### Interface: `HyperVDriver`

```go
type HyperVDriver interface {
    Connect() error
    Close() error
    IsAlive() (bool, error)
    ListAllDomains() ([]Domain, error)
    LookupDomainByName(name string) (Domain, error)
    LookupDomainByUUIDString(uuid string) (Domain, error)
    ListAllNetworks() ([]Network, error)
    LookupNetworkByUUIDString(uuid string) (Network, error)
    ExecuteCommand(command string) (string, error)
}
```

`WinRMDriver` is the sole implementation. Cluster helpers (`GetCluster`, `GetClusterInfo`, `GetClusterNodes`, `GetClusterVMGroups`, `GetComputerInfo`) and `RunOnNode` (via `Invoke-Command -Credential`) support Failover Cluster inventory.

### Connection Details

- Library: `github.com/masterzen/winrm`
- Protocol: HTTPS (`WinRMPortHTTPS = 5986`)
- TLS: `insecureSkipVerify=true` (no CA cert wired today)
- Commands: wrapped in `powershell -EncodedCommand <base64>` for multiline/quoted scripts
- Default timeout: **60s** per command
- Long timeout: **5 minutes** (`longCommandTimeout`) for batch VM scripts on large nodes
- Thread-safe: mutex-protected client
- Auth errors: HTTP 401/403 wrapped as `driver.ErrUnauthorized` → collector `Test()` returns HTTP 401

### Domain (`WinRMDomain`)

Per-VM methods: `GetName`, `GetUUIDString`, `GetState`, `GetInfo`, `GetGeneration`, `GetDisks`, `GetNICs` (includes VLAN), `Shutdown`, `GetComputerName` (cluster owner node).

### Network (`WinRMNetwork`)

Virtual switch: `GetName`, `GetUUIDString`, `GetSwitchType` — External (0), Internal (1), Private (2).

---

## PowerShell Scripts (`pkg/lib/hyperv/powershell`)

All scripts return JSON via `ConvertTo-Json`. `BuildCommand` escapes single quotes; `RunOnNode` wraps scripts in `Invoke-Command` with explicit credentials (avoids WinRM double-hop in cluster mode).

| Constant | Purpose |
|----------|---------|
| `TestConnection` | WinRM liveness (`echo ok`) |
| `ListAllVMs` / `ListClusterVMs` | VM list (cluster variant queries all nodes) |
| `ListAllSwitches` | Virtual switches |
| `GetVMDisks` / `GetDiskCapacity` / `GetDiskRCTEnabled` | Disk topology, size, warm-migration RCT |
| `GetVMNICs` | NICs **with VLAN** (see below) |
| `GetGuestOS` / `GetGuestNetworkConfig` | KVP Exchange (running VMs only) |
| `GetVMSecurityInfo` / `GetVMHasCheckpoint` | Gen2 TPM/SecureBoot, snapshot check |
| `GetClusterInfo` | Combined cluster identity + nodes (single WinRM call) |
| `GetComputerInfo` | Node hardware (fast WMI, not `Get-ComputerInfo`) |
| `BatchGetVMDetails` | One-shot hardware + guest details for all VMs |
| `BatchGetVMDetailsLight` | Fast staging: disks/NICs/checkpoint only |
| `ListVMsWithDetailsLight` | Combined VM list + light details (one round-trip per node) |
| `BatchGetVHDCapacity` | Post-staging `Get-VHD` for capacity/RCT |

Split fallbacks (`BatchGetVMHardware`, `BatchGetVMGuest`) exist if combined scripts exceed WinRM command-size limits.

---

## VLAN Support

VLAN IDs are collected on VM NICs via `Get-VMNetworkAdapterVlan`:

- **Access-mode VLANs**: `AccessVlanId` → `vlanId` on the NIC model
- **Trunk-mode adapters**: `NativeVlanId` is **not** captured; `vlanId` reports **0**
- Applies to per-VM `GetVMNICs`, batch scripts (`Vlan` field in JSON), and REST `nics[].vlanId`

```go
type NIC struct {
    Name        string `json:"name"`
    MAC         string `json:"mac"`
    DeviceIndex int    `json:"deviceIndex"`
    Network     Ref    `json:"network"`
    NetworkName string `json:"networkName,omitempty"`
    VlanId      int    `json:"vlanId,omitempty"`
}
```

PowerShell (`GetVMNICs`):

```powershell
Get-VMNetworkAdapter -VMName '%s' | ForEach-Object {
  $v = ($_ | Get-VMNetworkAdapterVlan);
  $_ | Select-Object Name, MacAddress, SwitchName,
    @{N='VlanId';E={if($v.AccessVlanId){$v.AccessVlanId}else{0}}}
}
```

---

## Inventory Collector

### Connection Test

1. WinRM connect with Secret credentials + `winrmPort`
2. `IsAlive()` (`echo ok`)
3. Cluster mode: `Get-Cluster` membership validation
4. Transient failures: up to **3** consecutive `ConnTestFailed` calls are suppressed while parity is held

### Refresh Settings

| Constant | Default | Env override |
|----------|---------|--------------|
| `RefreshInterval` | 10s | `HYPERV_REFRESH_INTERVAL` |
| `ValidationTimeout` | 30s | `HYPERV_VALIDATION_TIMEOUT` |

Operator mirrors these as `controller_hyperv_refresh_interval` / `controller_hyperv_validation_timeout` on `ForkliftController`.

### Collection Phases

**Standalone:**

1. Connect → **LightMode** load (Network → Storage → Disk → VM adapters, serial)
2. `EnrichDiskCapacity` — parallel per-node `Get-VHD`
3. Set `parity=true`, start DB watches + 10s refresh loop

**Failover Cluster** (`loadClusterParallel`):

| Phase | Adapters | Notes |
|-------|----------|-------|
| 0 | Prewarm cluster cache | `GetClusterInfo` (single WinRM call) |
| BG | VM prefetch + network prefetch | Overlaps with later phases |
| 1 | `ClusterAdapter` | DB insert from cache |
| 2 (parallel) | `HostAdapter`, `NetworkAdapter`, `StorageAdapter` | |
| 3–4 (serial) | `DiskAdapter`, `VMAdapter` | Consumes prefetched VM data |

**Optimized cluster refresh** (after first full cycle): LightMode VM+Disk first, concurrent disk enrichment, remaining adapters; every **10th** cycle runs full non-LightMode refresh for security/guest OS/guest networks.

### VM Collection Per VM

- Basic: UUID, name, power state, CPU, memory, firmware (Gen1=bios, Gen2=uefi)
- Security (Gen2): TPM, SecureBoot
- Checkpoint existence
- Disks: Windows path → SMB path, capacity, format (vhd/vhdx), RCT
- NICs: MAC, switch name → network UUID, **vlanId**
- Guest OS + guest networks (running VMs via KVP; preserved when VM stops)
- Cluster: `host` (owner node), `IsClusterRole`

### SMB Path Mapping

```
Windows: C:\Hyper-V\VMs\disk.vhdx
SMB prefix: C:\Hyper-V  (via Get-SmbShare)
Mount path: /hyperv
Result: /hyperv/VMs/disk.vhdx
```

### SMB Disk Validation

```
POST http://<service>.<ns>.svc.cluster.local:8080/validate-disks
Body: {"paths": ["/hyperv/VMs/disk1.vhdx", ...]}
Response: {"missing": [...]}
```

Missing disks: `SMBPath` cleared → OPA policy `hyperv.disk.smb_path.missing` flags the VM.

---

## Data Model (`model/hyperv`)

| Model | PK | Key Fields |
|-------|-----|-----------|
| `Cluster` | ID | Domain, Nodes[] |
| `Host` | ID | Cluster, State, CpuSockets, CpuCores, MemoryBytes, Networks[] |
| `Network` | UUID | SwitchName, SwitchType, Hosts[] (cluster) |
| `Storage` | `storage-0` | Type (SMB), Path, Capacity, Free |
| `Disk` | `<vmUUID>-disk-<index>` | WindowsPath, SMBPath, Capacity, Format, RCTEnabled |
| `VM` | UUID | PowerState, Firmware, GuestOS, TpmEnabled, SecureBoot, HasCheckpoint, Host, Disks[], NICs[] (**vlanId**), GuestNetworks[], Concerns[] |

### VM Power States

`On`, `Off`, `Paused`, `ShuttingDown`, `Crashed`, `Suspended`, `Unknown`

### OPA Validation

- Endpoint: `/v1/data/io/konveyor/forklift/hyperv/validate`
- Version: `/v1/data/io/konveyor/forklift/hyperv/rules_version`
- Non-blocking: validation never blocks model updates; scheduled sweep for `revision != revisionValidated`
- Cluster/host changes trigger revalidation of affected VMs

---

## REST API Endpoints

Base path: `/providers/hyperv`

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/providers/hyperv` | ProviderHandler | List providers |
| GET | `/providers/hyperv/:provider` | ProviderHandler | Get provider |
| GET | `…/clusters` | ClusterHandler | List clusters (cluster mode) |
| GET | `…/clusters/:cluster` | ClusterHandler | Get cluster |
| GET | `…/hosts` | HostHandler | List hosts (cluster mode) |
| GET | `…/hosts/:host` | HostHandler | Get host |
| GET | `…/vms` | VMHandler | List VMs (supports `X-Watch`) |
| GET | `…/vms/:vm` | VMHandler | Get VM (always max detail) |
| GET | `…/networks` | NetworkHandler | List networks |
| GET | `…/networks/:network` | NetworkHandler | Get network |
| GET | `…/storages` | StorageHandler | List storages |
| GET | `…/storages/:storage` | StorageHandler | Get storage |
| GET | `…/disks` | DiskHandler | List disks |
| GET | `…/disks/:disk` | DiskHandler | Get disk |
| GET | `…/tree/host` | TreeHandler | Cluster → Host → VM tree |
| GET | `…/workloads` | WorkloadHandler | List workloads |
| GET | `…/workloads/:vm` | WorkloadHandler | Get workload |

### Handler Behavior

- Returns `404` if provider type is not `hyperv`
- Returns `503` if collector has not reached parity
- `X-Watch` header upgrades VM list to websocket

---

## Inventory `detail=` Query Parameter

Query param: `?detail=N` (or `detail=all` → `MaxDetail` = 9).

### Provider Root — **requires `detail≥1` for counts**

`AddDerived` only populates `vmCount`, `networkCount`, `storageCount` when `detail != 0`. Root fetches with empty `detail` return counts as **0**.

**Frontend rule:** always send `?detail=1` on provider root GET (empty `subPath`) so derived counts populate. Do not Hyper-V-gate this — other providers follow the same pattern.

### VM Detail Levels

| `detail` | Response shape | Fields |
|----------|----------------|--------|
| 0 (default) | `VM0` / `Resource` | id, name, revision, selfLink, path |
| 1 | `VM1` | + disks, nics (**vlanId**), networks, concerns, revisionValidated |
| ≥2 | `VM` (full) | + uuid, powerState, cpuCount, memoryMB, firmware, guestOS, tpmEnabled, secureBoot, hasCheckpoint, host, guestNetworks |

- `GET /vms/:vm` always returns full detail (`MaxDetail`)
- List handlers pass `h.Detail` to `Content()`; `ListOptions` upgrades any `detail>0` to `MaxDetail` for DB fetch

### Other Resource Types

Cluster, Host, Network, Storage, Disk: `detail=0` → base `Resource` only; `detail≥1` → full object.

Tree nodes use `detail=0` (base fields only).

---

## HyperVProviderServer CRD

**Kind**: `HyperVProviderServer` (`forklift.konveyor.io/v1beta1`)
**Finalizer**: `api.HyperVProviderFinalizer`
**Controller name**: `hyperv-server`

### Lifecycle

1. Provider controller creates `HyperVProviderServer` per Hyper-V provider
2. Ensures: **PV** (SMB CSI `smb.csi.k8s.io`, `ReadOnlyMany`) → **PVC** → **Deployment** (image from `Settings.Providers.HyperV.ContainerImage`, SMB mount `/hyperv`) → **Service** (ClusterIP :8080)
3. Deletion: Service → Deployment → PVC → PV

### Builder Constants

```go
SMBVolumeMountPath = "/hyperv"
SMBCSIDriver       = "smb.csi.k8s.io"
QEMUGroup          = 107
PVSize             = "1Gi"
```

### Labels

```yaml
app: forklift
subapp: hyperv-server
provider: <provider-UID>
hyperv-server: <server-UID>
```

---

## Integration Points

| Caller | Callee | Purpose |
|--------|--------|---------|
| Provider controller | `collector.Test()`, HyperV server ensurer | Connection test, SMB sidecar |
| Plan validation | `hyperv.NewFinder()` | Resolve VM/network/storage/workload refs |
| Policy agent | OPA hyperv rules | VM concerns |
| Provider-server pod | SMB CSI mount | `/validate-disks`, `/healthz` |

---

## Error Patterns

| Failure | Behavior |
|---------|----------|
| WinRM 401/403 | `ErrUnauthorized`; provider NotReady |
| Transient WinRM loss (≤3) | Suppressed while parity held |
| SMB prefix discovery fail | Logged; retried on reconnect |
| Batch script fail | Fallback to per-VM or split hardware/guest scripts |
| validate-disks unavailable | Logged; SMBPath kept (no false clears) |
| Cluster `Get-Cluster` fail | Connection test fails for `managementType=cluster` |

---

## Frontend Relevance

| Backend field | UI usage |
|---------------|----------|
| `spec.settings.winrmPort` | Provider create form (default 5986) |
| `spec.settings.managementType` | Standalone vs Failover Cluster |
| Secret `username`, `password`, `smbUrl` | Required on create |
| `vmCount` / `networkCount` / `storageCount` | Provider details — **requires `?detail=1`** |
| `nics[].vlanId` | Plan network mapping, VM details NIC table |
| `disks[].smbPath` | Migration disk path; empty if mapping/validation failed |
| `disks[].rctEnabled` | Warm migration eligibility |
| `hasCheckpoint` | Blocks migration when snapshots exist |
| `guestOS` / `guestNetworks` | Running VMs only; preserved after power-off |
| `host` | Cluster mode — VM owner node |
| `concerns[]` | Migration warnings (OPA + SMB validation) |
| `network.switchType` | External / Internal / Private |
| `tpmEnabled` / `secureBoot` | Gen2 VMs only |
| Tech preview | Show `TechPreviewLabel` for Hyper-V provider type |
