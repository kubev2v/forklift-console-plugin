---
description: OVA provider - inventory collection, OVF parsing, NFS storage, REST API, OVAProviderServer CRD
alwaysApply: false
---

# OVA Provider

> Analyzed from commit: `baf9c7bcc` on `2026-09-17`
> Source paths: `pkg/controller/provider/container/ova/`, `pkg/controller/provider/model/ovf/`, `pkg/controller/provider/web/ova/`, `pkg/controller/ova/`

Source: [forklift](https://github.com/kubev2v/forklift) backend — sidecar server pod parses OVF on NFS; inventory controller polls sidecar and serves REST API.

---

## Package Purpose

The OVA provider imports VMs from OVF/OVA files on an NFS share. It uses a **sidecar server** pattern: a dedicated pod (`OVAProviderServer`) mounts the NFS export, parses OVF descriptors, and exposes a REST API on port 8080. The main inventory controller polls this sidecar, stores results in SQLite, validates VMs via OPA, and exposes inventory through the standard Forklift provider REST API.

```
NFS Share (OVA/OVF files)
    │
    ▼
┌─────────────────────────┐
│  OVA Provider Server    │  Deployment + Service (pkg/controller/ova/)
│  - Mounts NFS at /ova   │
│  - Parses OVF files     │
│  - REST :8080           │
└────────────┬────────────┘
             │ HTTP (cluster-internal via Provider.Status.Service)
             ▼
┌─────────────────────────┐
│  Inventory Collector    │  ovfbase.Collector (pkg/controller/provider/container/ovfbase/)
│  - Polls sidecar API    │
│  - SQLite DB            │
│  - OPA VM validation    │
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│  REST API               │  ovfbase handlers via web/ova/doc.go
│  /providers/ova/:uid/…  │
└─────────────────────────┘
```

OVA-specific code is thin: `container/ova/collector.go` delegates to `ovfbase.New(db, provider, secret, "ova")`; `web/ova/doc.go` registers `ovfbase.Handlers()` with `ProviderType: api.Ova`.

---

## Key Types and Structs

### OVAProviderServer CRD

**Kind**: `OVAProviderServer` (`forklift.konveyor.io/v1beta1`)
**Finalizer**: `api.OvaProviderFinalizer`
**Controller**: `pkg/controller/ova/` (`Name = "ova-server"`)

```go
type Builder struct {
    OVAProviderServer *api.OVAProviderServer
    Labeler           Labeler
}
// Constants: NFSVolumeMountPath="/ova", QEMUGroup=107, PVSize="1Gi"
```

### Inventory models (`model/ovf/model.go`)

| Model | PK | Key fields |
|-------|-----|-----------|
| `VM` | ID | `OvfPath`, `ExportSource`, `OsType`, `Firmware`, `SecureBoot`, `CpuCount`, `MemoryMB`, `Disks[]`, `NICs[]`, `Concerns[]`, `RevisionValidated`, `PolicyVersion` |
| `Network` | ID | `Name`, `Description` |
| `Disk` | ID | `DiskId`, `FilePath`, `Capacity`, `Format`, `PopulatedSize` |
| `Storage` | ID | `Name` (derived from disks) |

```go
type VM struct {
    Base
    OvfPath, ExportSource, OsType, UUID, Firmware string
    SecureBoot, CpuHotAddEnabled, MemoryHotAddEnabled bool
    CpuCount, CoresPerSocket, MemoryMB int32
    ChangeTrackingEnabled bool
    Disks []Disk
    NICs  []NIC
    Concerns []Concern
    RevisionValidated int64
}
```

### Collector (`container/ovfbase/collector.go`)

```go
type Collector struct {
    provider  *api.Provider
    db        libmodel.DB
    client    *Client
    parity    bool
    phase     string
    prefix    string  // "ova"
}
```

Phases: `Started` → `Load` → `Loaded` → `Parity` → `Refresh`. `RefreshInterval` = 60s, `RetryInterval` = 5s.

### Sidecar client (`container/ovfbase/client.go`)

Connects to `http://{service.Name}.{service.Namespace}.svc.cluster.local:8080/test_connection`. Requires `provider.Status.Service` to be set (sidecar ready).

---

## Interfaces and Implementations

| Interface | Location | Implementations |
|-----------|----------|-----------------|
| `Adapter` | `container/ovfbase/model.go` | `NetworkAdapter`, `DiskAdapter`, `VMAdapter`, `StorageAdapter` |
| `libmodel.EventHandler` | `container/ovfbase/watch.go` | `VMEventHandler` |
| `libweb.RequestHandler` | `web/ovfbase/doc.go` | Provider, Tree, Disk, Network, VM, Workload, Storage (via `web/ova/doc.go`) |
| `reconcile.Reconciler` | `controller/ova/controller.go` | `Reconciler` (OVAProviderServer lifecycle) |

Each adapter implements `List()`, `GetUpdates()`, `DeleteUnexisting()`. Refresh fetches from sidecar without DB lock, then applies changeSet in a transaction. VM updates trigger when `OvfPath` or `ExportSource` changes.

---

## Reconciliation / Execution Flow

### OVAProviderServer controller (`controller/ova/`)

1. Provider controller creates `OVAProviderServer` CR when OVA-type Provider is reconciled
2. `Reconciler` watches `OVAProviderServer`:
   - **Deploy**: PV (NFS `ReadOnlyMany`) → PVC → Deployment → Service (`api-http`, port 8080)
   - **Teardown** (deletion): Service → Deployment → PVC → PV
3. Provider `status.service` populated when sidecar Service is ready
4. On deletion, finalizer `api.OvaProviderFinalizer` removed after teardown

### Inventory collection

```
Connect (test_connection on sidecar)
  → Load: full inventory via adapter List()
  → Loaded: first refresh
  → Parity: begin VM watch, set parity=true
  → Refresh: poll sidecar every 60s, upsert + delete stale records
```

### Policy validation (`ovfbase/watch.go`)

OPA endpoint: `/v1/data/io/konveyor/forklift/ova/validate`

Same pattern as oVirt: event-driven latch + periodic search for `revision != revisionValidated`, batched results (max 1024), `concerns[]` stored on VM.

---

## Status Conditions

### OVAProviderServer CR (`controller/ova/controller.go`)

| Condition | Type | When |
|-----------|------|------|
| `ApplianceManagementEnabled` | `FeatureEnabled` | Global `Settings.OVFApplianceManagement` AND `provider.spec.settings["applianceManagement"]=true` |

When appliance management enabled, deployment sets `APPLIANCE_ENDPOINTS=true` env var on sidecar.

### Provider CR

| Phase | When |
|-------|------|
| `ConnectionFailed` | Sidecar not ready (`status.service` nil) or `test_connection` fails |
| `Ready` | Collector has parity and sidecar reachable |

---

## REST API Endpoints

### Forklift inventory API

Base path: `/providers/ova/:provider`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/providers/ova` | List OVA providers |
| `GET` | `/providers/ova/:provider` | Provider details + counts |
| `GET` | `…/vms`, `…/vms/:vm` | VMs (WebSocket watch via `X-Watch`) |
| `GET` | `…/networks`, `…/networks/:network` | Networks |
| `GET` | `…/disks`, `…/disks/:disk` | Disks |
| `GET` | `…/storages`, `…/storages/:storage` | Storages (derived from disks) |
| `GET` | `…/workloads`, `…/workloads/:vm` | Validation payloads |
| `GET` | `…/tree`, `…/tree/vm` | Tree views |

### Query parameters

- `?detail=0` — minimal (`id`, `name`, `revision`, `selfLink`)
- `?detail=1` — + disks, networks, concerns, `revisionValidated`
- `?detail=2+`/`all` — full object including firmware, CPU, memory, NICs, devices
- `?name=` — path-based name filter
- `X-Watch` — WebSocket watch

### Provider detail response (`detail > 0`)

```json
{
  "vmCount": 42,
  "networkCount": 3,
  "diskCount": 84,
  "storageCount": 84
}
```

### Sidecar API (consumed by collector, not UI)

| Path | Description |
|------|-------------|
| `GET /test_connection` | Health check |
| `GET /vms` | Parsed VMs from OVF |
| `GET /networks` | Networks from OVF |
| `GET /disks` | Virtual disks from OVF |

---

## Integration Points

| Caller / callee | Direction | Purpose |
|-----------------|-----------|---------|
| Provider controller | → creates `OVAProviderServer` | Triggers sidecar deployment |
| `controller/ova/` | → K8s PV/PVC/Deployment/Service | Sidecar infrastructure |
| `ovfbase.Collector` | → sidecar HTTP API | Inventory polling |
| `pkg/controller/validation/policy` | ← `VMEventHandler` | OPA validation |
| `pkg/forklift-api/services/` | → `web/ova` handlers | HTTP routing |

Registry: `container/doc.go` → `ova.New()`, `web/doc.go` → `ova.Handlers()`.

---

## Configuration

| Setting | Source | Notes |
|---------|--------|-------|
| Provider `spec.url` | Provider CR | `<nfs-server>:<nfs-path>` (split on first `:`) |
| `spec.settings["applianceManagement"]` | Provider CR | Per-provider appliance management gate |
| `Settings.Features.OVFApplianceManagement` | operator | Global appliance management feature flag |
| `Settings.Providers.OVA.ContainerImage` | operator | Sidecar container image |
| `provider.status.service` | Provider status | `{name, namespace}` of sidecar Service |

### Sidecar deployment labels

```yaml
app: forklift
subapp: ova-server
provider: <provider-UID>
ova-server: <server-UID>
```

### Sidecar env vars

| Env | Purpose |
|-----|---------|
| `PROVIDER_NAMESPACE`, `PROVIDER_NAME` | Provider identity |
| `CATALOG_PATH` | NFS mount path (`/ova`) |
| `APPLIANCE_ENDPOINTS` | Enable appliance management endpoints |
| `AUTH_REQUIRED` | Sidecar auth gate |

---

## Error Patterns

| Scenario | Behavior |
|----------|----------|
| `status.service` nil | Collector `Connect()` fails — "Provider inventory service not ready" |
| Sidecar unreachable | Retry every 5s; parity=false during refresh errors |
| OVF parse errors | Logged on sidecar; VM may be missing from inventory |
| Policy validation failure | Logged; next scheduled search retries |
| NFS URL malformed | PV builder splits on `:` — server=segments[0], path=segments[1] |

---

## Frontend Relevance

| Backend field / behavior | Frontend usage |
|--------------------------|----------------|
| `provider.type=ova` | OVA provider create form |
| Provider `spec.url` | NFS URL field (`<server>:<path>`) |
| `provider.status.service` | Provider readiness — wait for sidecar before inventory loads |
| `ApplianceManagementEnabled` condition | UI feature flag (`OvaApplianceManagement` setting) |
| `GET …/vms` | Plan wizard VM picker |
| `vm.ovfPath` | Path to OVF descriptor on NFS share |
| `vm.exportSource` | Origin system (e.g. vSphere) for exported OVAs |
| `disk.format` | `vmdk`, `raw`, etc. — disk format display |
| `disk.filePath` | Disk file location on NFS |
| `concerns[]` | Migration readiness warnings |
| `GET …/storages` | Storage map source (one storage per disk, synthetic) |
| `GET …/networks` | Network map source |
| **OVA embedded casing (MTV-5734)** | VM-embedded `disks[]`/`networks[]` use PascalCase (`ID`, `Name`) in detail responses — use fallback cast in frontend |

### OVA vs standalone endpoint casing

- Standalone (`GET …/storages`, `…/networks`): **camelCase** `id`, `name`
- Embedded in VM detail (`GET …/vms?detail=N`): **PascalCase** `ID`, `Name`, `DiskId`, `FilePath` — does not match `@forklift-ui/types`

```typescript
const id = (disk as unknown as { ID?: string }).ID ?? disk.id;
```
