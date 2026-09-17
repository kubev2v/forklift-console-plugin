---
description: Host controller - ESXi host management, connection testing, inventory watches
alwaysApply: false
---

# Host Controller

> Analyzed from commit: `baf9c7bcc307ed9358ad59886a5536366a050012` on 2026-09-17
> Source paths: `pkg/controller/host/`

## Package Purpose

The Host CRD represents an ESXi host used for **direct disk transfer** during vSphere migrations. The controller validates the host configuration (provider, inventory ref, IP, credentials) and tests connectivity to the ESXi SDK endpoint. Only **vSphere** providers are supported for host operations — all other provider types set a `TypeNotValid` blocker condition. Non-vSphere inventory handlers are no-ops.

---

## Key Types and Structs

### `HostSpec` (`pkg/apis/forklift/v1beta1/host.go`)

```go
type HostSpec struct {
    ref.Ref `json:",inline"`              // inventory host ref (id/name)
    Provider core.ObjectReference         // vSphere Provider ref
    IpAddress string                      // ESXi IP for disk transfer
    Secret core.ObjectReference           // credentials Secret
}
```

### `Reconciler` (`pkg/controller/host/controller.go`)

```go
type Reconciler struct {
    base.Reconciler
}
```

Runtime fields populated during validation: `host.Provider.Source` (Provider CR), `host.Secret` (Secret CR).

### Handler factory (`pkg/controller/host/handler/doc.go`)

Provider-type dispatch for inventory watches:

| Provider type | Handler | Behavior |
|---------------|---------|----------|
| `vSphere` | `handler/vsphere` | Watches `vsphere.Host` inventory model |
| `oVirt`, `OpenStack`, `Ova`, `HyperV`, `OpenShift` | per-provider handlers | No-op `Watch()` |
| `EC2`, `Azure` | `NoOpHostHandler` | No host-level operations |
| `Nutanix` | `handler/nutanix` | No-op (no ESXi-style hosts) |

---

## Interfaces and Implementations

```go
type Handler interface {
    Watch(m *handler.WatchManager) error
}
```

- **vSphere handler** (`handler/vsphere/handler.go`): implements inventory event callbacks (`Created`, `Updated`, `Deleted`) and enqueues reconcile events for matching Host CRs.
- **ProviderPredicate** (`predicate.go`): embeds `handler.WatchManager`; calls `handler.New()` and `Watch()` when a Provider becomes Ready.

---

## Reconciliation / Execution Flow

```
Fetch Host CR
  → BeginStagingConditions
  → validate()
    → validateProvider()   — provider exists, reconciled; must be vSphere
    → validateRef()        — host ref resolves in provider inventory
    → validateIp()         — ipAddress is set
    → validateSecret()     — secret exists, has required keys, TLS validates
    → Set Validated (Advisory)
    → testConnection()     — ESXi SDK connect, maintenance/health checks
  → Set Ready if no blockers AND ConnectionTestSucceeded
  → EndStagingConditions
  → Record events, update status
  → If ConnectionTestFailed: requeue after 15 minutes
```

### Watched resources

| Resource | Watch type | Purpose |
|----------|-----------|---------|
| `Host` | Primary | Reconcile on create/update/delete |
| `Provider` | Reference + predicate | Re-reconcile hosts; start inventory watches for Ready providers |
| `Secret` | Reference | Re-reconcile when host credentials change |
| Channel | Generic events | Inventory watch events from vSphere handler |

---

## Status Conditions

| Condition | Category | When set |
|-----------|----------|----------|
| `Validated` | Advisory | All field validations pass |
| `RefNotValid` | Critical | Ref not set, not found, or ambiguous |
| `SecretNotValid` | Critical | Secret missing, not found, missing keys, or TLS failure |
| `TypeNotValid` | Critical | Provider is not vSphere |
| `IpNotValid` | Critical | `ipAddress` is empty |
| `ConnectionTestSucceeded` | Required | ESXi SDK connection successful |
| `ConnectionTestFailed` | Critical | Cannot connect to ESXi host |
| `InMaintenance` | Critical | ESXi host is in maintenance mode |
| `NotHealthy` | Critical | Host `overallStatus` is `red` |
| `HostStatusNotGreen` | Warn | Host `overallStatus` is not `green` (non-red values) |
| `Ready` | Required | No blockers + connection test succeeded |

`setOverallStatusConditions()` maps vSphere `HostSystem.overallStatus`: only **red** blocks Ready via `NotHealthy`; any non-green value also surfaces `HostStatusNotGreen` as a Warn concern.

---

## Connection Testing

`testConnection()` runs only when there are no blocker conditions:

1. Queries inventory for the host model (`Thumbprint`, `InMaintenanceMode`, `Status`).
2. Sets `InMaintenance` / `NotHealthy` / `HostStatusNotGreen` as applicable.
3. Injects host thumbprint into secret data (`secret.Data["thumbprint"]`).
4. Constructs URL: `https://{ipAddress}/sdk`.
5. Creates `adapter.EsxHost` (from `pkg/controller/plan/adapter/vsphere`) and calls `TestConnection()`.
6. On failure: requeues with a **15-minute** backoff to avoid ESXi DOS protection.

---

## Inventory Watch (vSphere Handler)

File: `handler/vsphere/handler.go`

Watches `vsphere.Host` inventory objects:

- **Created/Deleted**: finds all Host CRs referencing the same provider and enqueues reconcile events.
- **Updated**: triggers when `Path`, `InMaintenanceMode`, or `Status` changed.
- Matching: compares `host.Spec.Ref.ID` against inventory ID or path suffix against ref name.

---

## Predicate Logic

- **HostPredicate**: reconciles on create/delete; on update only when `ObservedGeneration < Generation` (spec changed).
- **ProviderPredicate**: triggers on provider updates when reconciled (`ObservedGeneration == Generation`); ensures inventory watch is started for Ready providers.

---

## Configuration

### Secret requirements (vSphere)

| Key | Required | Purpose |
|-----|----------|---------|
| `user` | Yes | ESXi username |
| `password` | Yes | ESXi password |
| `insecureSkipVerify` | No | Skips TLS verification when set |
| `thumbprint` | Injected | Written by controller from inventory |

TLS is verified via `base.VerifyTLSConnection()` unless `insecureSkipVerify` is set.

---

## Error Patterns

- Validation errors set conditions and return without error (reconcile succeeds).
- Inventory client / API errors during `validateRef` or `testConnection` propagate and fail the reconcile.
- `ConnectionTestFailed` triggers automatic requeue after 15 minutes.
- Non-vSphere providers: `TypeNotValid` set, connection test skipped.

---

## Frontend Relevance

- Host CRs are surfaced under vSphere provider details (Hosts tab).
- `determineHostStatus()` in `src/providers/details/tabs/Hosts/utils/helpers/determineHostStatus.ts` maps conditions to UI status:
  - **Ready**: `Ready=True`
  - **Error**: `ConnectionTestFailed`, `NotHealthy`, `RefNotValid`, `SecretNotValid`, `TypeNotValid`, `IpNotValid`, `InMaintenance`
  - **Running**: `ConnectionTestSucceeded`, `Validated`
- `HostStatusNotGreen` (Warn) is **not** in the frontend error list — consider surfacing as a warning if product requires it.
- Plan execution uses Host resources for direct ESXi disk transfers.
- Type: `V1beta1Host` from `@forklift-ui/types`; conditions are in `status.conditions[]`.
