---
description: NetworkMap controller - validation, inventory-based checks, mapping structure, Hyper-V VLAN and NAD pool
alwaysApply: false
---

# NetworkMap Controller

> Analyzed from commit: `baf9c7bcc` on `2026-09-17`
> Source paths: `pkg/controller/map/network/`, `pkg/apis/forklift/v1beta1/mapping.go`, `pkg/controller/plan/adapter/base/network.go`, `pkg/controller/plan/adapter/hyperv/builder.go`

---

## Package Purpose

The NetworkMap controller reconciles `NetworkMap` CRs (`forklift.konveyor.io/v1beta1`). Each NetworkMap defines how source provider networks map to target OpenShift networks for VM migration. The controller validates provider references and inventory-backed source/destination networks, sets status conditions (including `networkIPMode` compatibility), and watches provider inventory so maps re-reconcile when referenced networks change.

**VLAN disambiguation and NAD pool allocation are not implemented in this controller** — they are CRD fields consumed at **plan execution time** by the Hyper-V (and shared `planbase`) adapter. The controller only persists and validates the base source ref + destination; `source.vlan` is ignored during inventory lookup.

---

## Mapping Structure

```
spec:
  provider:
    source:      { namespace, name }    # ref to source Provider CR
    destination: { namespace, name }    # ref to destination Provider CR (must be OpenShift)
  map:
    - source:                           # NetworkSourceRef
        id: "<inventory-id>"           # match by ID
        name: "<network-name>"          # OR match by name (path suffix on most providers)
        vlan: "100"                     # optional — Hyper-V multi-NIC VLAN qualifier (1–4094)
      destination:
        type: "pod" | "multus" | "ignored"
        namespace: "<ns>"               # required when type=multus
        name: "<nad-name>"              # NAD name when type=multus
      networkIPMode: "preserve" | "dhcp" | "none"   # optional — per-pair IP behavior
```

### Destination Types

| Type | Meaning | Validation |
|---|---|---|
| `pod` | Kubernetes pod network (default CNI) | Skipped — always valid |
| `multus` | Multus NetworkAttachmentDefinition (NAD) | Looked up as `<namespace>/<name>` via destination inventory; namespace required |
| `ignored` | Network excluded from mapping | Skipped — always valid |

### `source.vlan` (Hyper-V)

`NetworkSourceRef` extends `ref.Ref` with an optional `vlan` string (CRD pattern: `1`–`4094`). Used only at **migration build time** on Hyper-V when a VM has multiple NICs on the same switch with different VLAN tags. The NetworkMap controller does **not** validate VLAN values against inventory.

Hyper-V inventory captures per-NIC `vlanId` from PowerShell (`Get-VMNetworkAdapterVlan`). Only **Access-mode** VLANs are reported; Trunk-mode adapters (`NativeVlanId`) return `0`.

### `networkIPMode`

Per-pair override of plan-level `preserveStaticIPs`. Valid values: `preserve`, `dhcp`, `none`. Validated in `validateDestination`:

| Destination type | `networkIPMode` set | Result |
|---|---|---|
| `ignored` | any non-empty | `NetworkIPModeNotValid` / `NotValidForDestination` / **Critical** |
| `pod` | `preserve` | `NetworkIPModeNotValid` / `NotValidForDestination` / **Warn** (non-blocking) |
| `pod` | `dhcp` or `none` | Allowed |
| `multus` | any | Allowed |

---

## Key Types and Structs

From `pkg/apis/forklift/v1beta1/mapping.go`:

```go
type NetworkSourceRef struct {
    ref.Ref `json:",inline"`
    Vlan    string `json:"vlan,omitempty"`   // 1–4094, Hyper-V disambiguation
}

type DestinationNetwork struct {
    Type      string   // pod | multus | ignored
    Namespace string   // required for multus
    Name      string   // NAD name for multus
}

type NetworkPair struct {
    Source        NetworkSourceRef
    Destination   DestinationNetwork
    NetworkIPMode NetworkIPMode   // preserve | dhcp | none
}

type NetworkMapSpec struct {
    Provider provider.Pair
    Map      []NetworkPair
}
```

### Lookup helpers on `NetworkMap`

| Method | Returns | Use |
|---|---|---|
| `FindNetwork(id)` | First pair matching `source.id` | Legacy 1:1 lookup |
| `FindNetworkByType(type)` | First pair matching `source.type` | Provider-specific (e.g. OCP source) |
| `FindNetworkByNameAndNamespace(ns, name)` | First pair matching name | Name-based lookup |
| `FindAllNetworks(id)` | **All** pairs matching `source.id` | NAD pool / 1:N mapping |
| `FindAllNetworksByType(type)` | All pairs matching `source.type` | Multi-row by type |
| `FindAllNetworksByNameAndNamespace(ns, name)` | All pairs matching name | Multi-row by name |

Multiple rows with the same `source.id` are valid — required for multi-NIC VMs that map one source network to several destination NADs.

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
| vSphere | `handler/vsphere` | `vsphere.Network` | `ref.ID == network.ID` or `HasSuffix(network.Path, ref.Name)` |
| oVirt | `handler/ovirt` | `ovirt.Network` | Same as vSphere |
| OpenStack | `handler/openstack` | `openstack.Network` | Same as vSphere |
| OVA | `handler/ova` | `ova.Network` | Same as vSphere |
| Hyper-V | `handler/hyperv` | `hyperv.Network` | `ref.ID == network.ID` or `ref.Name == network.Name` |
| Nutanix | `handler/nutanix` | `nutanix.Network` | `ref.ID == network.ID` or `ref.Name == network.Name` |
| OpenShift (destination) | `handler/ocp` | `ocp.NetworkAttachmentDefinition` | Periodic polling — no real-time watch |
| EC2 | `pkg/provider/ec2/controller/handler` | EC2 network handler | Separate provider package |
| Azure | `pkg/provider/azure/controller/handler` | Azure network handler | Separate provider package |

**OCP special case**: `handler/ocp` uses `EnsurePeriodicEvents()` at `DefaultEventInterval` because OCP inventory does not support web watches. Reconciles all NetworkMaps referencing the OCP provider as source **or** destination.

**Hyper-V inventory watch**: Triggers on network create/delete and on **name change** (not VLAN or other fields).

---

## Reconciliation / Execution Flow

```
Reconcile()
 ├─ Fetch NetworkMap CR (return if NotFound)
 ├─ BeginStagingConditions()
 ├─ validate(mp)
 │   ├─ ProviderPair.Validate() — source + destination providers
 │   │   └─ Short-circuit if any provider condition is set
 │   ├─ validateSource(mp) — source networks vs source provider inventory
 │   └─ validateDestination(mp) — destination NADs + networkIPMode rules
 ├─ Set Ready condition (if no blocker conditions)
 ├─ EndStagingConditions()
 ├─ Record Kubernetes events
 └─ Update status (ObservedGeneration = Generation)
```

```mermaid
flowchart TD
    A[NetworkMap event] --> B[Reconcile]
    B --> C{Provider pair valid?}
    C -->|No| D[Provider conditions only]
    C -->|Yes| E[validateSource via inventory.Network]
    E --> F[validateDestination NAD + networkIPMode]
    F --> G{HasBlockerCondition?}
    G -->|No| H[Set Ready=True]
    G -->|Yes| I[Skip Ready]
    H --> J[Status.Update]
    I --> J
```

### Watch Triggers

1. **NetworkMap CR** — Create always (registers `libref.Mapper`); Update only when `ObservedGeneration < Generation`; Delete cleans mapper.
2. **Provider CR** — On reconciled provider update, `ensureWatch()` starts inventory watch when provider has `Ready` condition.
3. **Inventory channel** — Buffered channel (size 10) receives generic events from per-provider inventory watchers; enqueues affected NetworkMaps.

---

## Status Conditions

| Condition | Category | Reason | Blocker? | Meaning |
|---|---|---|---|---|
| `Ready` | Required | — | No | Map is valid and usable |
| `SourceProviderNotValid` | Critical | `NotSet`, `NotFound` | Yes | Source provider ref missing or not found |
| `SourceProviderNotReady` | Critical | — | Yes | Source provider not reconciled |
| `DestinationProviderNotValid` | Critical | `NotSet`, `NotFound`, `TypeNotValid` | Yes | Dest provider invalid or not OpenShift |
| `DestinationProviderNotReady` | Critical | — | Yes | Dest provider not reconciled |
| `SourceNetworkNotValid` | Critical/Warn | `NotSet`, `NotFound`, `Ambiguous` | Yes for `NotSet`/`Ambiguous`; **No** for `NotFound` | Source network ref issue |
| `DestinationNetworkNotValid` | Critical | `NotFound`, `Ambiguous` | Yes | Dest NAD not found or missing namespace |
| `NetworkIPModeNotValid` | Critical/Warn | `NotValidForDestination` | Yes for `ignored`; **No** for `pod`+`preserve` | `networkIPMode` incompatible with destination type |

Provider-pair conditions come from shared `validation.ProviderPair` (`pkg/controller/validation/provider.go`).

### Validation Detail

#### Provider pair (`validate`)

Uses `validation.ProviderPair.Validate(mp.Spec.Provider)`. Destination must be type `OpenShift`. On any provider failure, source/destination network validation is skipped.

#### Source network (`validateSource`)

For each `spec.map` entry:

1. If `source.ID` and `source.Name` are both empty → `SourceNetworkNotValid` / `NotSet` / `Critical` (per entry, `continue`).
2. Look up via `inventory.Network(&ref.Ref)` on the **source** provider (VLAN field not used in lookup).
3. `NotFoundError` → collected into `notValid` list.
4. `RefNotUniqueError` → collected into `ambiguous` list.
5. Valid refs appended to `status.refs`.

Batch conditions:

- `SourceNetworkNotValid` / `NotFound` / **Warn** — non-blocking; `Items` lists invalid refs.
- `SourceNetworkNotValid` / `Ambiguous` / **Critical** — blocking; `Items` lists ambiguous refs.

#### Destination network (`validateDestination`)

For each `spec.map` entry:

1. `networkIPMode` on `ignored` → collected (Critical); `preserve` on `pod` → collected (Warn).
2. `type=pod` or `type=ignored` → skip NAD lookup.
3. `type=multus` with empty `namespace` → `Ambiguous`.
4. `type=multus` → look up NAD as `<namespace>/<name>` via destination inventory.
5. `NotFoundError` → collected into `notFound` list.

---

## Hyper-V VLAN Disambiguation and NAD Pool (Plan Layer)

These behaviors are implemented outside `pkg/controller/map/network/` but depend on NetworkMap CR shape.

### VLAN-qualified keys (Hyper-V builder)

`pkg/controller/plan/adapter/hyperv/builder.go` — `buildNICResolver` / `buildNICKeys` / `buildPairKey`:

1. Count NICs per source network ID on the VM.
2. If the NetworkMap has **any** entry with `source.vlan` set for a network ID, that network is "VLAN-qualified".
3. For VLAN-qualified networks with **multiple NICs** on the same switch:
   - Map pair key: `networkID/vlan` (e.g. `net-a/100`) when `source.vlan` is set and `networkCount > 1`.
   - NIC key: `networkID/vlanId` when `nic.VlanId > 0`; untagged NICs (`VlanId == 0`) use plain `networkID`.
4. If the map has **no** VLAN-qualified entries, keys stay plain `networkID` (backward-compatible 1:1 / NAD-pool fallback).

```
NetworkMap entries          VM NICs (same switch)
─────────────────          ─────────────────────
net-a vlan=100 → nad-1     net-a VlanId=100  → key net-a/100 → nad-1
net-a vlan=200 → nad-2     net-a VlanId=200  → key net-a/200 → nad-2
net-a (no vlan) → nad-3    net-a VlanId=0    → key net-a     → nad-3
```

### NAD pool (multi-NIC, shared source network)

`pkg/controller/plan/adapter/base/network.go` — `NADPool` / `AllocateNetwork`:

- One `NADPool` per VM (`NewNADPool()`).
- Multiple `spec.map` rows with the **same** `source.id` map to **distinct** Multus NADs.
- `AllocateNetwork`: non-Multus destinations (`pod`, `ignored`) pass through immediately; Multus destinations are deduplicated via pool (`namespace/name` key).
- When NIC count exceeds available NAD rows for a source network, extra NICs get no allocation — `ResolveNICModes` skips them; `ValidateNetworkDuplicates` flags NAD exhaustion.

Used by Hyper-V `mapNetworks`, vSphere, oVirt, OVF, Nutanix, EC2, and Azure builders.

### Plan validation

`pkg/controller/plan/validation.go`:

- `NetworksMapped` — per-provider check that every connected NIC has a map entry (Hyper-V checks `source.id` only, not VLAN).
- `ValidatePodNetworkDuplicates` — warns when multiple NICs resolve to `pod` network (duplicate Multus NADs allowed via pool).
- `ResolveNICModes` — builds MAC→`networkIPMode` map using NAD pool allocation.

---

## Integration Points

| Caller / callee | Relationship |
|---|---|
| `validation.ProviderPair` | Shared provider validation with StorageMap |
| `controller/provider/web` | `NewClient(provider)` → `inventory.Network(ref)` for validation |
| `controller/watch/handler` | Base watch manager for inventory event handlers |
| `lib/ref.Mapper` | Tracks NetworkMap refs on create/update/delete |
| `pkg/controller/plan/adapter/base/network.go` | `NADPool`, `AllocateNetwork`, `ResolveNICModes`, `ValidateNetworkDuplicates` |
| `pkg/controller/plan/adapter/hyperv/builder.go` | VLAN key resolution + NAD pool in `mapNetworks` |
| `pkg/controller/plan/validation.go` | `NetworksMapped`, `ValidatePodNetworkDuplicates` |

**Dependency direction**: NetworkMap controller → validation, provider web client, watch handlers. Plan controller → NetworkMap CR (read-only for mapping, VLAN, NAD pool, `networkIPMode`).

---

## Configuration

| Setting | Source | Effect on NetworkMap |
|---|---|---|
| Inventory refresh interval | `handler.DefaultEventInterval` | OCP destination NAD polling cadence |
| Plan `preserveStaticIPs` | `Plan.spec.preserveStaticIPs` | Default `networkIPMode` when per-pair field is empty (plan layer) |

No feature flags gate NetworkMap controller behavior.

---

## Error Patterns

- **Inventory client creation failure** — `validateSource` / `validateDestination` return error; reconcile retries.
- **Non-NotFound inventory errors** — Propagate immediately (not collected into condition lists).
- **Source `NotFound`** — Warn category: map can still become `Ready`.
- **Source `Ambiguous` / `NotSet`, destination `NotFound` / `Ambiguous`** — Critical blockers; `Ready` not set.
- **`NetworkIPModeNotValid` on `pod`+`preserve`** — Warn only; map can still be `Ready`.
- **`NetworkIPModeNotValid` on `ignored`** — Critical blocker.
- **Watch setup failure** — Logged via `log.Trace`; does not fail NetworkMap reconcile.

---

## Differences from StorageMap

| Aspect | NetworkMap | StorageMap |
|---|---|---|
| Destination | `pod` / `multus` / `ignored` + NAD ref | StorageClass + optional PVC modes |
| Multi-row same source | Yes — NAD pool for multi-NIC | Yes — different target SC/offload (MTV-6324) |
| VLAN qualifier | `source.vlan` (Hyper-V) | N/A |
| Per-pair mode | `networkIPMode` | N/A |
| Offload plugin | N/A | `vsphereXcopyConfig` / `csiVolumeImport` |
| Hyper-V inventory watch | Watches `hyperv.Network` | No-op (single SMB share) |
| Source `NotFound` severity | Warn (non-blocking) | Warn (non-blocking) |

---

## Frontend Relevance

### CR shape ↔ TypeScript

| Backend field | Frontend location |
|---|---|
| `spec.map[].source` | `V1beta1NetworkMapSpecMapSource` / `NetworkMapFieldId.SourceNetwork` |
| `spec.map[].source.vlan` | `MappingValue.vlan` in plan wizard; `buildNetworkMappings` round-trip |
| `spec.map[].destination.type` | `pod` / `multus` / `ignored` target selector |
| `spec.map[].destination.namespace` + `name` | NAD selection for `multus` |
| `spec.map[].networkIPMode` | Per-pair IP mode in plan wizard network map step |
| `status.conditions` | List/details validation indicators |
| `status.refs` | Valid source refs after reconciliation |

### Hyper-V multi-NIC / VLAN (plan wizard only)

- `getHypervVlanQualifiedNetworks` (`src/plans/create/steps/network-map/hypervVlanNetworks.ts`) — detects VMs with multiple NICs on the same switch but different VLAN IDs; emits VLAN-qualified source options.
- `getSourceNetworkValues` replaces plain inventory entries when VLAN conflicts exist.
- **Standalone** network map create (`InventorySourceNetworkField`) does **not** VLAN-disambiguate — no VM context at provider inventory level.
- Multi-NIC NAD pool (MTV-5511): duplicate source network rows allowed; `TargetNetworkField` uses `hideNonNadTargets={true}` for multi-NIC sources (NAD targets only).

### Condition display expectations

| Condition | UI impact |
|---|---|
| `Ready=True` | Map usable in plan wizard/details |
| `SourceNetworkNotValid` / `NotFound` / Warn | Show warning; map may still be Ready |
| `SourceNetworkNotValid` / `Ambiguous` / Critical | Blocking error with `Items` list |
| `DestinationNetworkNotValid` / `NotFound` | Blocking — NAD missing on target |
| `NetworkIPModeNotValid` / Warn | Warning for `preserve` on pod network |
| `NetworkIPModeNotValid` / Critical | Blocking for `networkIPMode` on `ignored` |
| Provider conditions | Same patterns as StorageMap |

### Plan integration

- Plan validation surfaces `UnmappedNetwork` and `MultiplePodNetworkMappings` conditions — not shown on network map pages.
- Hyper-V `NetworksMapped` validator checks `source.id` match only; VLAN-qualified rows must still share the same underlying network ID.

---

## Key Code Locations

| File | Purpose |
|---|---|
| `controller.go` | Controller setup, watches, `Reconcile()` |
| `validation.go` | Provider pair, source/destination validation, `networkIPMode` rules |
| `predicate.go` | Event filtering; `ensureWatch()` for inventory |
| `network_test.go` | Condition categories, `NetworkIPMode`, `FindAllNetworks` tests |
| `handler/doc.go` | Handler factory per provider type |
| `handler/<provider>/handler.go` | Inventory watch + enqueue affected NetworkMaps |
| `pkg/apis/forklift/v1beta1/mapping.go` | CRD types, `FindAllNetworks*` helpers |
| `pkg/controller/plan/adapter/base/network.go` | `NADPool`, `AllocateNetwork`, `ResolveNICModes` |
| `pkg/controller/plan/adapter/hyperv/builder.go` | VLAN key resolution, `mapNetworks` with NAD pool |
