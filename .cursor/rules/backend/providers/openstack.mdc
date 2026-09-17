---
description: OpenStack provider - Keystone/Nova/Glance/Neutron inventory, data model, REST API
alwaysApply: false
---

# OpenStack Provider

> Analyzed from commit: `baf9c7bcc` on `2026-09-17`
> Source paths: `pkg/controller/provider/container/openstack/`, `pkg/controller/provider/model/openstack/`, `pkg/controller/provider/web/openstack/`, `pkg/lib/client/openstack/`

## Package Purpose

The OpenStack provider connects to a Keystone-scoped OpenStack cloud via **gophercloud**, polls Nova/Glance/Cinder/Neutron/Keystone APIs, stores inventory in a per-provider SQLite DB, and exposes it through the Forklift inventory REST API. VM policy validation runs asynchronously through the OPA policy agent. Migration execution (cold/warm, disk transfer, guest conversion) is handled separately by `pkg/controller/plan/adapter/openstack/`.

```
Keystone (Identity v3)     ──► Region, Project
Nova    (Compute v2)       ──► VM (servers.Server), Flavor
Glance  (Image v2)         ──► Image
Cinder  (Block Storage v3) ──► Volume, VolumeType, Snapshot
Neutron (Network v2)       ──► Network, Subnet
```

```
pkg/controller/provider/
├── container/openstack/   # Collector, adapters, VM validation watch
├── model/openstack/       # SQLite inventory models
└── web/openstack/         # REST handlers (gin)
pkg/lib/client/openstack/  # gophercloud client (auth, List/Get, migration ops)
```

---

## Key Types and Structs

### Inventory models (`model/openstack/model.go`)

All models embed `Base` with `ID` (PK), `Name` (indexed), `Revision` (auto-incremented).

| Model | OpenStack service | Notable fields / FKs |
|-------|-------------------|----------------------|
| `Region` | Keystone | `Description`, `ParentRegionID` |
| `Project` | Keystone | `DomainID`, `ParentID`, `Enabled`, `IsDomain` |
| `Image` | Glance | `Status`, `DiskFormat`, `SizeBytes`, `Properties`, `UpdatedAt` |
| `Flavor` | Nova | `VCPUs`, `RAM`, `Disk`, `ExtraSpecs` |
| `VM` | Nova | `Status`, `TenantID→Project`, `ImageID`, `FlavorID`, `AttachedVolumes`, `Concerns` |
| `Volume` | Cinder | `Status`, `Size`, `VolumeType`, `Bootable`, `Attachments`, `VolumeImageMetadata` |
| `VolumeType` | Cinder | `ExtraSpecs`, `IsPublic` — **storage-map source unit** |
| `Snapshot` | Cinder | `VolumeID`, `Status`, `Size` |
| `Network` | Neutron | `Subnets[]`, `Shared`, `TenantID/ProjectID→Project` |
| `Subnet` | Neutron | `NetworkID→Network`, `CIDR`, `AllocationPools`, `HostRoutes` |

```go
type VM struct {
    Base
    RevisionValidated int64
    PolicyVersion     int
    TenantID          string                   // FK → Project (+cascade)
    Status            string                   // ACTIVE, SHUTOFF, ERROR, …
    ImageID           string                   // FK → Image (+cascade)
    FlavorID          string                   // FK → Flavor (+cascade)
    Addresses         map[string]interface{}   // network name → address list
    AttachedVolumes   []AttachedVolume
    Concerns          []Concern                // OPA validation output
}

func (m *VM) Validated() bool { return m.RevisionValidated == m.Revision }
```

### Collector (`container/openstack/collector.go`)

```go
type Collector struct {
    provider *api.Provider
    db       libmodel.DB
    client   *Client          // embeds lib/client/openstack.Client
    parity   bool
    phase    string           // Started → Load → Loaded → Parity → Refresh
    watches  []*libmodel.Watch
}
```

### REST workload (`web/openstack/workload.go`)

```go
type XVM struct {
    VM
    Image       Image
    Flavor      Flavor
    Networks    []Network
    Subnets     []Subnet
    Volumes     []Volume
    VolumeTypes []VolumeType
    Snapshots   []Snapshot
}
```

Image resolution: `VM.ImageID` first; else bootable volume `VolumeImageMetadata["image_id"]`.

---

## Interfaces and Implementations

| Interface | Implementation | Role |
|-----------|----------------|------|
| `libcontainer.Collector` | `container/openstack.Collector` | Inventory lifecycle |
| `Adapter` | `RegionAdapter`, `ProjectAdapter`, `ImageAdapter`, `FlavorAdapter`, `VMAdapter`, `SnapshotAdapter`, `VolumeAdapter`, `VolumeTypeAdapter`, `NetworkAdapter`, `SubnetAdapter` | List / incremental update / delete-missing |
| `libmodel.EventHandler` | `VMEventHandler` (`watch.go`) | Trigger OPA validation on VM changes |
| `libweb.RequestHandler` | `Handlers()` in `web/openstack/doc.go` | REST routes |
| `base.Adapter` | `plan/adapter/openstack.Adapter` | Plan migration (separate package) |

Adapter order (initial load and refresh): **Region → Project → Image → Flavor → VM → Snapshot → Volume → VolumeType → Network → Subnet**.

Registry wiring:
- `pkg/controller/provider/container/doc.go` → `openstack.New()`
- `pkg/controller/provider/web/doc.go` → `openstackweb.Handlers()`
- `pkg/controller/plan/adapter/doc.go` → `openstackadapter.New()`

---

## Reconciliation / Execution Flow

### Collector phases

| Phase | Action |
|-------|--------|
| `Started` | `Client.Connect()` — authenticate, verify user projects |
| `Load` | Full `List()` per adapter, bulk `Insert` into DB |
| `Loaded` | First `refresh()` (deletes + updates) |
| `Parity` | Start `VMEventHandler` DB watch, set `parity=true` |
| `Refresh` | Every **10s**: `DeleteUnexisting` + `GetUpdates` per adapter; on error `parity=false`, retry after **5s** |

Refresh is two-phase: build change set outside DB transaction, then `apply()` in a single transaction (avoids holding TX during slow API calls).

### Incremental update strategies

| Resource | Updates | Deletes |
|----------|---------|---------|
| Image | `UpdatedAt` filter (`SetUpdateAtQueryFilterGT`) | Status `deleted`/`pending_delete`, or GET 404 |
| Flavor | `ChangesSince` (RFC3339) | GET 404 |
| VM | `ChangesSince` | Status `DELETED`/`SOFT_DELETED`, or GET 404 |
| Volume | **Full re-list** (no `UpdatedAt` in gophercloud) | Status `deleting`, or GET 404 |
| Snapshot, Network, Subnet, VolumeType, Region, Project | Full re-list + field/compare | GET 404 |

### Volume → VM revalidation cascade

When a volume update commits, the adapter resets `RevisionValidated = 0` on all attached VMs (`Attachments[].ServerID`), forcing OPA revalidation.

### VM policy validation (`watch.go`)

1. `VMEventHandler` watches VM create/update events.
2. Unvalidated VMs (`Revision != RevisionValidated` or stale `PolicyVersion`) are submitted to OPA.
3. Endpoints: `VersionEndpoint` = `/v1/data/io/konveyor/forklift/openstack/rules_version`, `ValidationEndpoint` = `/v1/data/io/konveyor/forklift/openstack/validate`.
4. Workload built via `web.Workload.Expand()` (same shape as REST workload).
5. Results batched (max **1024** tasks); harvest applies `Concerns`, `PolicyVersion`, `RevisionValidated`.
6. Periodic search every `Settings.SearchInterval` seconds (default **600**, env `POLICY_AGENT_SEARCH_INTERVAL`).

Validation never blocks inventory updates — failures are logged; scheduled search retries.

---

## Status Conditions

OpenStack provider CR phases follow the common provider controller (`Ready`, `Staging`, `ValidationFailed`, `ConnectionFailed`). Provider-specific validation is primarily connection test via `Collector.Test()` → `Client.Authenticate()`.

VM-level concerns (not provider CR conditions) are stored on inventory `VM.Concerns[]` after OPA validation and surfaced in REST `detail≥1` VM responses.

---

## REST API Endpoints

Base route: `/providers/openstack` (`web/openstack/doc.go` → `pkg/controller/provider/web/`).

| Endpoint | Handler | Watch | Notes |
|----------|---------|-------|-------|
| `GET /providers/openstack` | `ProviderHandler` | No | Aggregate list |
| `GET /providers/openstack/:provider` | `ProviderHandler` | No | `detail>0` adds counts |
| `GET …/regions` | `RegionHandler` | Yes | |
| `GET …/projects` | `ProjectHandler` | Yes | |
| `GET …/images` | `ImageHandler` | Yes | |
| `GET …/flavors` | `FlavorHandler` | Yes | |
| `GET …/vms` | `VMHandler` | Yes | `name` path filter |
| `GET …/vms/:vm` | `VMHandler` | — | |
| `GET …/volumes` | `VolumeHandler` | Yes | |
| `GET …/volumetypes` | `VolumeTypeHandler` | Yes | Storage-map sources |
| `GET …/snapshots` | `SnapshotHandler` | Yes | |
| `GET …/networks` | `NetworkHandler` | Yes | Network-map sources |
| `GET …/subnets` | `SubnetHandler` | Yes | |
| `GET …/workloads/:vm` | `WorkloadHandler` | No | Expanded VM for policy/UI |
| `GET …/tree/project` | `TreeHandler` | No | `Project → [VM, …]` hierarchy |

Query params: `?name=…`, `?detail=N`. WebSocket watch via `X-Watch` header.

### VM detail levels

| Level | Fields |
|-------|--------|
| 0 | `id`, `revision`, `name`, `path`, `selfLink` |
| 1 | + `tenantID`, `status`, `hostID`, `revisionValidated`, `imageID`, `flavorID`, `addresses`, `attachedVolumes`, `concerns` |
| 2 | + `userID`, timestamps, `metadata`, `securityGroups`, `fault`, `tags`, `serverGroups` |

Provider aggregate (`detail>0`): `regionCount`, `projectCount`, `vmCount`, `imageCount`, `volumeCount`, `volumeTypeCount`, `networkCount`.

### Path builder

VM `path` = `project/parent/.../vmName` built from `TenantID → Project` hierarchy (`web/openstack/base.go` `PathBuilder`).

---

## Integration Points

**Calls:**
- `pkg/lib/client/openstack` — gophercloud auth and service clients
- `pkg/controller/validation/policy` — OPA agent (`policy.Agent.Submit`)
- `pkg/controller/plan/adapter/openstack` — migration builder/validator/client

**Called by:**
- Provider controller — starts collector, connection test
- Forklift API — mounts OpenStack web handlers
- Plan controller — OpenStack adapter for `provider.type=openstack`

**Storage mapping:** source storages are **Cinder volume types** (`VolumeType`); `api.GlanceSource` name handled for image-based disks.

---

## Configuration

### Provider spec

| Field | Purpose |
|-------|---------|
| `spec.url` | Keystone auth URL (e.g. `https://openstack.example.com:5000/v3`) |
| `spec.secret` | Ref to credentials Secret |

### Secret keys (`lib/client/openstack/client.go`)

| Key | Purpose |
|-----|---------|
| `authType` | `password` (default), `token`, `applicationcredential` |
| `username` / `userID` / `password` | Password auth |
| `applicationCredentialID` / `Name` / `Secret` | App credential auth |
| `token` | Token auth |
| `projectName` / `projectID` | Scoped project |
| `domainName` / `domainID`, `userDomainName` / `userDomainID`, `projectDomainName` / `projectDomainID`, `defaultDomain` | Keystone domains |
| `regionName` | OpenStack region |
| `insecureSkipVerify` | `"true"` to skip TLS verify |
| `cacert` | PEM CA certificate |
| `availability` | Endpoint type: `public` (default), `internal`, `admin` |

### Collector timing

| Constant | Value |
|----------|-------|
| `RefreshInterval` | 10s |
| `RetryInterval` | 5s (on phase error) |

### Migration client operations (used by plan adapter)

`VMStatus`, `VMStart`, `VMStop`, `VMCreateSnapshotImage`, `UploadImage`, `DownloadImage`, `VMRemoveSnapshotImage`.

---

## Error Patterns

- **Phase errors:** logged, 5s sleep, retry same phase; `parity=false` during failed refresh
- **Adapter List failure:** aborts load/refresh for that cycle
- **Volume full re-list:** higher API cost; comment notes gophercloud lacks `UpdatedAt` filter
- **Missing image on workload expand:** `NotFound` on image GET is tolerated (image may have been deleted)
- **Validation submit failure:** logged only; periodic search retries
- **Stale validation batch:** skipped when `task.Revision != latest.Revision`

### Status value reference

| Resource | Values |
|----------|--------|
| VM | `ACTIVE`, `SHUTOFF`, `ERROR`, `BUILD`, `MIGRATING`, `SUSPENDED`, `SOFT_DELETED`, … |
| Network | `ACTIVE`, `DOWN` |
| Image | `active`, `queued`, `deleted`, `pending_delete`, … |
| Volume | `available`, `in-use`, `deleting`, `error`, … |

Boot volume: `Volume.Bootable == "true"`; image ID in `VolumeImageMetadata["image_id"]`.

---

## Frontend Relevance

| Backend field / API | Frontend usage |
|---------------------|----------------|
| `provider.type=openstack` | Provider create wizard, type-specific credentials/details |
| `spec.url` | `OpenStackUrlField`, `validateOpenstackURL` |
| Secret keys above | `getOpenstackFieldsByAuthType`, credential modals (`OpenstackEditUIModal`) |
| `GET /providers/openstack/:uid/vms?detail=1` | VM inventory picker; `status`, `concerns`, `attachedVolumes` |
| `concerns[]` on VM | Migration readiness / warnings in VM list |
| `GET …/networks`, `GET …/subnets` | Network map source selection |
| `GET …/volumetypes` | Storage map source (Cinder volume types) |
| `GET …/workloads/:vm` | Deep inspection / expanded VM details |
| `GET …/tree/project` | Hierarchical VM browser |
| `revisionValidated` vs `revision` | Internal validation state; concerns drive UI warnings |
| `VM.Addresses` map keys | Network names — match Neutron `Network.Name` |
| UUID IDs | All OpenStack resources use string UUIDs as `id` |
| `Workload.IsWindows()` | `image.properties.os_distro` check for Windows detection |

### Auth types in UI

Three modes mirrored in create/edit forms: **password**, **token**, **applicationcredential**.
