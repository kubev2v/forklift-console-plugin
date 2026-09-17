---
description: Forklift inventory REST API - endpoints, per-provider routes, authentication, pagination, and web server setup
alwaysApply: false
---

# Forklift Inventory REST API

> Analyzed from commit: `baf9c7bcc307ed9358ad59886a5536366a050012` on 2026-09-17
> Source paths: `pkg/forklift-api/services/`, `pkg/controller/provider/web/`

## Package Purpose

The inventory REST API exposes provider inventory data (VMs, networks, storage, hosts, trees,
workloads) collected by per-provider inventory collectors. Handlers live in
`pkg/controller/provider/web/` and register on a **gin** router started by the **inventory
controller** (`pkg/controller/provider/controller.go`). The console plugin proxies these
endpoints through the OpenShift Console inventory API.

A separate **forklift-api** process (`pkg/forklift-api/`) serves TLS utilities on port **8444**
and admission webhooks on **8443** — it does **not** host inventory routes.

---

## Server Setup

### Inventory API (provider controller)

```
pkg/controller/provider/controller.go  →  Add()
  ├── libcontainer.New()
  ├── libweb.New(container, web.All(container, k8sClient)...)
  ├── web.Port = Settings.Inventory.Port   (env: API_PORT, default 8080)
  └── web.Start()   (TLS when Settings.Inventory.TLS.Key is set)
```

- **Port**: `API_PORT` env var (default `8080` in `pkg/settings/inventory.go`)
- **Framework**: `gin-gonic/gin`
- **Handler registration**: `web.All()` aggregates all `libweb.RequestHandler` implementations;
  each calls `AddRoutes(*gin.Engine)`
- **Proxied path**: Console plugin calls `getInventoryApiUrl(path)` — paths are relative
  (`providers/...`), not absolute

### forklift-api services (port 8444, ServeMux)

```
pkg/forklift-api/api.go  →  serveServices()  →  :8444
  └── services.RegisterServices()  →  /tls-certificate
```

| Path | Method | Purpose |
|------|--------|---------|
| `/tls-certificate` | GET | Fetch TLS certificate from remote `?URL=` (used during provider CA discovery) |

TLS certs from env: `SERVICES_TLS_CERTIFICATE`, `SERVICES_TLS_KEY`.

---

## Key Types and Structs

### base.Handler (`pkg/controller/provider/web/base/handler.go`)

Embeds `libweb.Parity`, `libweb.Watched`, `libweb.Paged` and holds:

| Field | Role |
|-------|------|
| `Container` | All inventory collectors |
| `Provider` | Resolved Provider CR (from `:provider` UID param) |
| `Collector` | Collector for the resolved provider |
| `Detail` | Parsed `detail` query level (int; `all` → `MaxDetail`) |

`Prepare(ctx)` order: pagination → WebSocket watch → `setDetail` → `setProvider` → `permit` (auth).

### Provider REST resource (all types)

Common shape returned at `detail >= 1`:

```go
type Provider struct {
    // ocp.Resource base: id, name, selfLink, revision, path
    Type         string       `json:"type"`
    Object       api.Provider `json:"object"`
    APIVersion   string       `json:"apiVersion"`
    Product      string       `json:"product"`
    VMCount      int64        `json:"vmCount"`      // AddDerived — detail > 0 only
    NetworkCount int64        `json:"networkCount"` // AddDerived — detail > 0 only
    // Provider-specific derived counts (detail > 0 only):
    //   OVA: diskCount, storageCount
    //   Hyper-V: storageCount
    //   Nutanix: storageContainerCount
    //   OCP: storageClassCount
    //   vSphere: datastoreCount (+ DatacenterCount, ClusterCount, HostCount, ...)
    //   OpenStack: volumeCount, volumeTypeCount
}
```

`AddDerived()` on provider handlers **skips all count fields when `h.Detail == 0`**. Provider
`Get` handlers on OVA, vSphere, oVirt, OpenStack, OCP, and Nutanix force `h.Detail =
model.MaxDetail` before `AddDerived`. Hyper-V and EC2 root fetches remain caller-dependent —
the caller must pass `?detail=1` (or higher) to populate derived counts.

---

## Inventory REST Endpoints

Inventory read endpoints are **GET-only** (except vSphere VDDK POST). Base path: `/providers`.

### Cross-Provider Endpoints

| Route | Description |
|-------|-------------|
| `GET /providers` | List all providers, grouped by type |
| `GET /providers/` | Same as above |

Aggregated response keys (from `provider.go` `List`):

```json
{
  "openshift": [...],
  "vsphere": [...],
  "ovirt": [...],
  "openstack": [...],
  "ova": [...],
  "ec2": [...],
  "hyperv": [...],
  "nutanix": [...]
}
```

**Note:** Azure handlers are registered in `web.All()` but are **not** included in the aggregated
`/providers` response at this commit.

### Per-Provider Route Pattern

```
/providers/<type>                        # List providers of this type
/providers/<type>/:provider              # Get provider (by K8s UID)
/providers/<type>/:provider/<resource>   # List resources
/providers/<type>/:provider/<resource>/:id  # Get resource
/providers/<type>/:provider/workloads/:vm     # Migration-ready VM view
/providers/<type>/:provider/tree/<variant>    # Hierarchical tree (where supported)
```

`:provider` is always the **K8s UID** of the Provider CR.

### Non-Provider Inventory Routes

| Route | Description |
|-------|-------------|
| `GET /aap/job-templates` | AAP job templates for hook UI (`pkg/controller/provider/web/aap/`) |
| OpenAPI schema | `libweb.SchemaHandler` (registered in `web.All()`) |

---

## Per-Provider Routes

### vSphere (`/providers/vsphere`)

| Resource | Routes |
|----------|--------|
| Provider | list, get |
| Datacenters, clusters, hosts, networks, datastores, folders | list + get |
| VMs | list + get (`detail` tiers: 0=base, 1=VM1, 2+=full) |
| Workloads | get |
| Trees | `tree/host`, `tree/vm` |
| Custom field defs | list + get |
| VDDK (OpenShift only) | `POST vddk/build-image`, `GET vddk/image-url`, `GET vddk/download-tar` |

### oVirt (`/providers/ovirt`)

Datacenters, clusters, hosts, VMs, networks, nicprofiles, diskprofiles, storagedomains, disks,
servercpus, workloads, `tree/cluster`.

### OpenStack (`/providers/openstack`)

Regions, projects, flavors, images, VMs, volumes, volumetypes, snapshots, networks, subnets,
workloads, `tree/project`.

### OpenShift (`/providers/openshift`)

Namespaces, storageclasses, networkattachmentdefinitions, instancetypes, clusterinstancetypes,
VMs, persistentvolumeclaims, datavolumes, kubevirts, `tree/namespace`.

Uses **user-scoped K8s client** (request Bearer token) for restricted host providers so RBAC
on the remote cluster is enforced.

### OVA (`/providers/ova`)

Delegates to `ovfbase` handlers: provider, VMs, networks, disks, storages, workloads, `tree/vm`.

### Hyper-V (`/providers/hyperv`)

Provider, clusters, hosts, VMs, networks, storages, disks, workloads, `tree/vm`.

### EC2 (`/providers/ec2`)

Provider, VMs, volumes, networks, storage, snapshots, workloads.
Handlers in `pkg/provider/ec2/inventory/web/`.

### Nutanix (`/providers/nutanix`)

Provider, clusters, hosts, networks, storagecontainers, images, VMs, workloads.

### Azure (`/providers/azure`)

Provider, VMs, disks, networks, storage.
Handlers in `pkg/provider/azure/inventory/web/` (registered but not in aggregated `/providers`).

---

## Query Parameters

### `detail` (critical for UI)

Parsed in `base.Handler.setDetail()`:

| Value | Effect |
|-------|--------|
| *(omitted)* | `Detail = 0` — minimal resource shape; **no derived provider counts** |
| `0` | Same as omitted |
| `1`, `2`, … `9` | Integer detail level; semantics vary per resource type |
| `all` | `Detail = MaxDetail` (9, from `lib/inventory/model/field.go`) |

**Provider `AddDerived` counts** (`vmCount`, `networkCount`, plus provider-specific storage
counts — see shape above): populated only when `h.Detail > 0`. OVA, vSphere, oVirt, OpenStack,
OCP, and Nutanix `Get` handlers force `MaxDetail` before deriving; Hyper-V and EC2 rely on
caller-supplied detail.

**VM detail tiers** (vSphere, oVirt, OVA/ovfbase, Nutanix — same pattern):

| Level | Returns |
|-------|---------|
| `0` | Base `Resource` (`id`, `name`, `selfLink`, `revision`, `path`) |
| `1` | `VM1` — disks, networks, concerns, `revisionValidated` |
| `2+` / `all` | Full VM — CPU, memory, firmware, NICs, policy fields, etc. |

**List handlers with `detail > 0`**: many providers upgrade list queries to `MaxDetail` internally
(e.g. `hyperv.Handler.ListOptions`, `ovfbase.Handler.ListOptions` — any `detail > 0` → `MaxDetail`
for DB list).

**vSphere hosts**: `buildAdapters()` (network adapters, SCSI disks) runs only when `h.Detail != 0`.
Frontend passes `hosts?detail=4` via `buildProviderInventoryPath` subPath to ensure extended host
fields are returned.

### Other query parameters

| Parameter | Description |
|-----------|-------------|
| `name` | Filter by resource name or hierarchical path |
| `namespace` | Filter providers by namespace (list endpoints) |
| `offset`, `limit` | Pagination (`libweb.Paged`) |
| `max` | AAP job-templates cap |

### WebSocket watch

Send `X-Watch: true` on list endpoints to upgrade to WebSocket for inventory change events.

---

## OVA and Hyper-V JSON Field Casing (MTV-5734)

### OVA — dual casing by endpoint context

| Context | Endpoint example | `id` / `name` casing | Nested disk/network fields |
|---------|------------------|----------------------|----------------------------|
| **Standalone collection** | `GET .../networks`, `.../storages`, `.../disks` | **camelCase** via `ovfbase.Resource` (`json:"id"`, `json:"name"`) | camelCase on `Resource`; extra disk fields without `json` tags serialize as PascalCase (`FilePath`, `DiskId`) |
| **Embedded in VM** | `GET .../vms?detail=1` → `disks[]`, `networks[]` | **PascalCase** (`ID`, `Name`) | `model.Disk` / `model.Network` from `pkg/controller/provider/model/ovf/` have **no `json` tags** — Go emits struct field names as-is (`DiskId`, `FilePath`, …) |

VM handler embeds raw model types:

```go
Networks []model.Network `json:"networks"`
Disks    []model.Disk    `json:"disks"`
```

**Frontend rule:** never use `disk.id` on VM-embedded OVA disks — use
`(disk as unknown as { ID?: string }).ID ?? disk.id`.

### Hyper-V — consistent camelCase on model base

`pkg/controller/provider/model/hyperv/model.go` defines `json:"id"`, `json:"name"` on `Base`.
Hyper-V does **not** share OVA's PascalCase embedded-object bug. Casing is uniform across
standalone and VM-embedded resources.

**Hyper-V `AddDerived` still requires `detail > 0`** for `vmCount`, `networkCount`,
`storageCount` on provider root responses — same as all other providers.

---

## Authentication & Authorization

All inventory endpoints require `Authorization: Bearer <token>` when `Settings.AuthRequired`
(default in production).

1. **TokenReview** — validate token
2. **SubjectAccessReview** — `get`/`list` on `providers.forklift.konveyor.io`
3. **Token cache** — 10 s TTL per `(token, namespace, name)`

| Status | Header | Meaning |
|--------|--------|---------|
| 401 | — | Missing/invalid token |
| 403 | — | RBAC denied |
| 404 | `X-Reason: ProviderNotFound` | Provider UID not in inventory |
| 206 | — | Provider not fully reconciled |
| 500 | `forklift-error-message` | Internal error |

---

## Response Format

Every inventory resource includes at minimum:

```json
{
  "uid": "<provider-uid>",
  "version": "<resource-version>",
  "namespace": "<namespace>",
  "name": "<display-name>",
  "selfLink": "/providers/<type>/<uid>/<collection>/<id>",
  "path": "<hierarchical/path>",
  "id": "<provider-internal-id>"
}
```

Additional fields depend on resource type and `detail` level.

---

## Reconciliation / Request Flow

```
HTTP GET /providers/<type>/:uid?detail=N
  → base.Handler.Prepare()
      → Paged.Prepare (offset/limit)
      → Watched.Prepare (X-Watch?)
      → setDetail (parse detail param)
      → setProvider (resolve UID → Collector, EnsureParity)
      → permit (TokenReview + SAR)
  → ProviderHandler.Get / ListContent
      → AddDerived (counts if detail > 0)
      → Resource.Content(detail)  (tiered response shape)
  → JSON response
```

---

## Integration Points

| Consumer | Usage |
|----------|-------|
| Console plugin | `consoleFetchJSON(getInventoryApiUrl(path))` |
| Plan adapters / controllers | `web.NewClient(provider)` — typed `Get`, `List`, `Watch`, `Find` |
| AAP hook UI | `GET /aap/job-templates` |

`web.NewClient` supported types: `openshift`, `vsphere`, `ovirt`, `openstack`, `ova`, `ec2`,
`hyperv`, `nutanix`, `azure`.

---

## Frontend Relevance

### `buildProviderInventoryPath` (`src/utils/inventory/buildProviderInventoryPath.ts`)

Central path builder for all provider inventory GETs:

```typescript
// Root fetch (no subPath) — ALWAYS appends ?detail=1
providers/${type}/${uid}?detail=1

// SubPath with existing query — passed through unchanged
providers/${type}/${uid}/hosts?detail=4

// SubPath without query — no detail appended (handler default detail=0)
providers/${type}/${uid}/networks
```

| Rule | Why |
|------|-----|
| Root fetches **must** use `buildProviderInventoryPath` (or `useProviderInventory` without `subPath`) | `AddDerived` skips `vmCount`/`networkCount`/`storageCount` when `detail=0` |
| Do **not** Hyper-V-gate `?detail=1` on root fetches | All provider types need `detail > 0` for derived counts; Hyper-V is the common failure case but not the only one |
| SubPath callers own their `detail` | e.g. `hosts?detail=4` for vSphere host adapters; `vms?detail=4` for full VM lists |
| OVA VM disk/network access | Use PascalCase fallback for embedded `disks[]`/`networks[]` on VM responses (see MTV-5734 above) |

### Frontend consumers

| Hook / util | Path built by |
|-------------|---------------|
| `useProviderInventory({ provider, subPath? })` | `buildProviderInventoryPath(type, uid, subPath)` |
| `getProvidersInventoryByNamespace` | Per-provider root via `buildProviderInventoryPath` (not aggregated `/providers`) |
| `useProvidersInventoryList` | Aggregated `GET providers?detail=1` or per-provider fallback |

### TypeScript types

Provider inventory shapes come from `@forklift-ui/types` (`VSphereProvider`, `OvaProvider`,
`HypervProvider`, etc.). Count fields (`vmCount`, `networkCount`, `storageCount`) are only
present when the backend received `detail >= 1`.

---

## Source File Map

```
pkg/forklift-api/
├── api.go                    # 8443 webhooks, 8444 services
└── services/
    ├── services.go           # /tls-certificate registration
    └── tls-certificate.go

pkg/controller/provider/
├── controller.go             # Inventory web server startup
└── web/
    ├── doc.go                # web.All() handler aggregation
    ├── provider.go           # Aggregated GET /providers
    ├── client.go             # NewClient factory
    ├── aap/handler.go        # AAP job templates
    ├── base/                 # Handler, auth, client, tree
    ├── vsphere/              # vSphere + VDDK
    ├── ovirt/
    ├── openstack/
    ├── ocp/
    ├── ovfbase/              # Shared OVF handlers (OVA)
    ├── ova/                  # OVA config → ovfbase
    ├── hyperv/
    └── nutanix/

pkg/provider/ec2/inventory/web/    # EC2 handlers
pkg/provider/azure/inventory/web/  # Azure handlers
```
