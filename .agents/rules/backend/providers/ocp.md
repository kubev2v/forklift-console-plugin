---
description: OpenShift provider - target/source provider, namespace inventory, StorageClass, NetworkAttachmentDefinition
alwaysApply: false
---

# OpenShift (OCP) Provider

> Analyzed from commit: `baf9c7bcc` on `2026-09-17`
> Source paths: `pkg/controller/provider/container/ocp/`, `pkg/controller/provider/model/ocp/`, `pkg/controller/provider/web/ocp/`

Source: [forklift](https://github.com/kubev2v/forklift) backend — watches native Kubernetes/KubeVirt resources instead of a vendor API.

---

## Package Purpose

The OpenShift provider is unique among Forklift providers: it serves as the **migration target** in every migration and can act as a **source** for OCP-to-OCP live migrations. It watches native Kubernetes/KubeVirt/CDI resources via `controller-runtime` client watches, caches them in SQLite, and exposes inventory through the Forklift REST API. Unlike source-only providers, OCP handlers make **live K8s API calls** (via `UserClient()`) for restricted host providers to enforce RBAC.

```
pkg/controller/provider/
├── container/ocp/   # Collector wrapping libocp.Collector + 9 collection types
├── model/ocp/       # SQLite models mirroring K8s objects
└── web/ocp/         # Gin REST handlers with UserClient RBAC pattern
```

---

## Key Types and Structs

### Collector (`container/ocp/collector.go`)

```go
type Collector struct {
    *libocp.Collector  // pkg/lib/inventory/container/ocp
}

func New(db, provider, secret) libcontainer.Collector {
    return &Collector{
        Collector: libocp.New(provider, secret,
            &Namespace{}, &NetworkAttachmentDefinition{}, &StorageClass{},
            &InstanceType{}, &ClusterInstanceType{}, &VM{},
            &PersistentVolumeClaim{}, &DataVolume{}, &KubeVirt{}),
    }
}
```

`Version()` is a no-op (returns empty strings). Auth via `libocp.RestCfg()`: in-cluster SA for host provider, `spec.url` + `secret.data["token"]` for remote.

### Base model (`model/ocp/model.go`)

```go
type Base struct {
    UID       string  `sql:"pk"`
    Version   string  `sql:"d0"`      // resourceVersion
    Namespace string  `sql:"key"`
    Name      string  `sql:"key"`
    labels    libmodel.Labels
}
```

### Resource models

| Model | K8s object | Notes |
|-------|-----------|-------|
| `Namespace` | `core/v1.Namespace` | |
| `StorageClass` | `storage/v1.StorageClass` | Cluster-scoped |
| `NetworkAttachmentDefinition` | `k8s.cni.cncf.io/v1.NetworkAttachmentDefinition` | UDN filtering at REST layer |
| `VM` | `kubevirt.io/v1.VirtualMachine` + optional `VirtualMachineInstance` | `WithVMI()` attaches runtime state |
| `InstanceType` | `instancetype.kubevirt.io/v1beta1.VirtualMachineInstancetype` | Namespaced |
| `ClusterInstanceType` | `instancetype.kubevirt.io/v1beta1.VirtualMachineClusterInstancetype` | Cluster-scoped |
| `PersistentVolumeClaim` | `core/v1.PersistentVolumeClaim` | |
| `DataVolume` | `cdi.kubevirt.io/v1beta1.DataVolume` | |
| `KubeVirt` | `kubevirt.io/v1.KubeVirt` | Tracked at runtime; not in `doc.go All()` |

### UDN network config (`model/ocp/model.go`)

```go
type NetworkConfig struct {
    Type     NadType      // "ovn-k8s-cni-overlay"
    Role     RoleType     // "primary" | "secondary"
    Topology TopologyType // "layer2" | "layer3"
    // ...
}

func (m *NetworkConfig) IsUnsupportedUdn() bool {
    return m.Type == OvnOverlayType &&
        (m.Role == RolePrimary || m.Topology == TopologyLayer3)
}
```

---

## Interfaces and Implementations

| Interface | Location | Implementations |
|-----------|----------|-----------------|
| `libcontainer.Collector` | `container/ocp/collector.go` | `Collector` (wraps `libocp.Collector`) |
| `libocp.Collection` | `container/ocp/collection.go` | 9 types: Namespace, NAD, StorageClass, InstanceType, ClusterInstanceType, VM, PVC, DataVolume, KubeVirt |
| `libweb.RequestHandler` | `web/ocp/doc.go` | Provider, Namespace, StorageClass, Nad, InstanceType, ClusterInstanceType, VM, Tree, PVC, DataVolume, KubeVirt |
| `base.Finder` | `web/ocp/client.go` | `Finder` — resolves refs for Plans/Mappings |

---

## Reconciliation / Execution Flow

### Inventory collection

```
libocp.Collector.Start()
  → buildClient() (in-cluster SA or remote bearer token)
  → register controller-runtime watches for 9 resource types
  → on Create/Update/Delete: upsert/delete in SQLite DB
  → set parity=true when initial sync completes
```

Each collection type embeds `libocp.BaseCollection` and returns its K8s `client.Object` via `Object()`.

### REST handler data access

Most list/get handlers call live K8s API via `UserClient(ctx)`:

1. **Restricted host provider** (`provider.IsRestrictedHost()`): builds client with **requesting user's bearer token** from HTTP `Authorization` header
2. **Non-restricted** (cluster-wide host or remote): uses collector's cached client (SA or secret token)

NAD listing does **not** support WebSocket watch (`501 Not Implemented`).

### Namespace tree (`web/ocp/tree.go`)

`GET …/tree/namespace` builds Namespace → VM hierarchy. Only namespaces containing at least one VM are included.

---

## Status Conditions

OCP providers do not set provider-specific validation conditions. Connection status follows the common provider controller phases (`Ready`, `ConnectionFailed`, `Staging`).

Collector errors per resource kind are tracked via `SetError()`/`ClearError()` on the collector when live API list calls fail.

---

## REST API Endpoints

### Base path

```
/providers/openshift/:provider
```

All endpoints are GET-only (inventory is read-only).

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/providers/openshift` | List OCP providers |
| `GET` | `/providers/openshift/:provider` | Provider with counts |
| `GET` | `…/namespaces`, `…/namespaces/:namespace` | Namespaces |
| `GET` | `…/storageclasses`, `…/storageclasses/:sc` | Storage classes |
| `GET` | `…/networkattachmentdefinitions`, `…/networkattachmentdefinitions/:network` | NADs (UDN-filtered) |
| `GET` | `…/vms`, `…/vms/:vm` | VMs with VMI data |
| `GET` | `…/instancetypes`, `…/instancetypes/:instancetype` | Namespaced instance types |
| `GET` | `…/clusterinstancetypes`, `…/clusterinstancetypes/:id` | Cluster instance types |
| `GET` | `…/persistentvolumeclaims`, `…/persistentvolumeclaims/:pvc` | PVCs |
| `GET` | `…/datavolumes`, `…/datavolumes/:dv` | CDI DataVolumes |
| `GET` | `…/kubevirts`, `…/kubevirts/:kubevirt` | KubeVirt operator CRs |
| `GET` | `…/tree/namespace` | Namespace → VM tree |

### Query parameters

| Param | Key | Description |
|-------|-----|-------------|
| Namespace | `namespace` | Filter namespaced resources |
| Name | `name` | Filter by resource name |
| Detail | `detail` | `0` = summary; `1+`/`all` = full K8s object in `object` field |

### Provider detail response (`detail > 0`)

```json
{
  "vmCount": 42,
  "networkCount": 6,
  "storageClassCount": 3
}
```

`networkCount` = NAD count **+ 1** (implicit default pod network).

### REST resource shape

```json
{
  "uid": "k8s-uid",
  "version": "resourceVersion",
  "namespace": "ns",
  "name": "resource-name",
  "selfLink": "/providers/openshift/<uid>/...",
  "id": "k8s-uid",
  "object": { /* full K8s object */ }
}
```

`id` duplicates `uid` for compatibility with providers using separate ID systems.

---

## Integration Points

| Caller / callee | Direction | Purpose |
|-----------------|-----------|---------|
| Every Plan | → OCP provider | Target namespace, StorageClass, NAD selection |
| OCP-to-OCP live migration | ← OCP provider as source | VM inventory from `/vms` |
| `pkg/controller/plan/adapter/ocp/` | reads inventory / live API | Migration builder |
| `pkg/controller/map/network/`, `storage/` | → OCP Finder | Resolve target refs |
| `pkg/forklift-api/services/` | → `web/ocp` handlers | HTTP routing |

Registry: `container/doc.go` → `ocp.New()`, `web/doc.go` → `ocp.Handlers()`.

---

## Configuration

### Provider roles

| Role | Detection | Auth |
|------|-----------|------|
| **Host** (local cluster) | `provider.IsHost()` (`spec.url == ""`) | In-cluster ServiceAccount |
| **Restricted host** | Host provider outside operator namespace | User's bearer token per request |
| **Remote OCP** | `spec.url` set | `secret.data["token"]` bearer token |

### Secret fields (remote provider)

| Field | Purpose |
|-------|---------|
| `token` | Bearer token for remote API |
| `cacert` | PEM CA certificate (optional) |
| `insecure` | Skip TLS verification |

### Restricted host scoping

When `provider.IsRestrictedHost()`:

| Resource | Scope |
|----------|-------|
| Namespaces, VMs, InstanceTypes, PVCs, DataVolumes, KubeVirts | Provider's namespace only |
| NADs | Provider namespace + `default` namespace |
| StorageClasses, ClusterInstanceTypes | All (cluster-scoped, readable by any user) |

---

## Error Patterns

| Scenario | Behavior |
|----------|----------|
| No auth token (restricted host) | `UserClient()` → "No authentication token found" |
| NAD config unparseable | Logged; NAD included (not treated as UDN) |
| Unsupported UDN NAD | Skipped in list response with info log |
| K8s list failure | `setError()` on collector for that resource kind |
| `Host(ref)` lookup | Always `NotFound` (OCP has no host concept) |

---

## Frontend Relevance

| Backend field / behavior | Frontend usage |
|--------------------------|----------------|
| `provider.type=openshift` | Target provider (auto-created host provider) |
| `GET …/storageclasses` | Storage map target dropdown |
| `GET …/networkattachmentdefinitions` | Network map target dropdown (UDN-incompatible NADs excluded) |
| `GET …/namespaces` | Plan target namespace selection |
| `GET …/vms` | OCP-to-OCP source VM picker |
| `GET …/tree/namespace` | Browse VMs by namespace |
| `GET …/instancetypes`, `…/clusterinstancetypes` | Instance type selection for target VMs |
| `vmCount`, `networkCount`, `storageClassCount` | Provider details page summary |
| `networkCount` includes +1 | UI should account for default pod network in network map |
| Restricted host provider | Resources scoped to provider namespace; uses user's RBAC token |
| `object` field in responses | Full K8s CR embedded — use for YAML/details views |
| NAD UDN filtering | Primary-role or layer3 OVN overlay NADs never appear — do not offer as migration targets |

### Finder ref resolution (Plans/Mappings)

Refs resolved by UID (`ref.ID`) or `namespace/name` (`ref.Namespace` + `ref.Name`). `Host(ref)` always fails — OCP has no ESXi-style hosts.
