---
description: Provider controller - common reconciliation loop, inventory lifecycle, credentials, status phases
alwaysApply: false
---

# Provider Controller (Common)

> Analyzed from commit: `baf9c7bcc` on `2026-09-17`
> Source paths: `pkg/controller/provider/controller.go`, `pkg/controller/provider/validation.go`, `pkg/controller/provider/validation/`, `pkg/controller/provider/container/`, `pkg/controller/provider/web/`

Source: [forklift](https://github.com/kubev2v/forklift) backend — runs inside the **Inventory** controller (`forklift-controller` with inventory role).

---

## Package Purpose

The provider controller reconciles `Provider` CRs: validates credentials and settings, manages OVA/Hyper-V provider-server sidecars, builds per-provider inventory collectors (SQLite-backed), serves the inventory REST API, and publishes `status.phase` plus conditions the console reads. It is the central orchestrator for all source/target provider types.

---

## Key Types and Structs

```go
type Reconciler struct {
    base.Reconciler
    catalog   *Catalog          // thread-safe map for post-delete collector lookup
    container *libcontainer.Container
    web       *libweb.WebServer
}

type Catalog struct {
    mutex   sync.Mutex
    content map[reconcile.Request]*api.Provider
}
```

Phase constants (`validation.go`):

```go
const (
    ValidationFailed = "ValidationFailed"
    ConnectionFailed = "ConnectionFailed"
    Ready            = "Ready"
    Staging          = "Staging"
)
```

---

## Interfaces and Implementations

### `validation.Runner` (breaks import cycle)

`pkg/controller/provider/validation/` dispatches provider-type-specific checks via a `Runner` interface implemented by `Reconciler`:

| Method | Provider types |
|--------|----------------|
| `ValidateForkliftInstalled` | `openshift` (remote only) |
| `ValidateVSpherePrivileges` | `vsphere` |
| `ValidateSSHReadiness` | `vsphere` (when `esxiCloneMethod=ssh`) |
| `ValidateSMBCSI` | `hyperv` |
| `ValidateHyperVSettings` | `hyperv` |

EC2 validation runs via `pkg/provider/ec2/controller/validation.Validator` directly (no Runner method).

### `libcontainer.Collector`

Built by `container.Build(db, provider, secret)`:

| Type | Collector package |
|------|-------------------|
| `openshift` | `container/ocp` |
| `vsphere` | `container/vsphere` |
| `ovirt` | `container/ovirt` |
| `openstack` | `container/openstack` |
| `ova` | `container/ova` |
| `ec2` | `pkg/provider/ec2/inventory/collector` |
| `hyperv` | `container/hyperv` |
| `nutanix` | `container/nutanix` |
| `azure` | `pkg/provider/azure/inventory/collector` |

Each collector implements `Test()`, `Start()`, `Shutdown()`, `HasParity()`, `DB()`, `Owner()`.

---

## Reconciliation / Execution Flow

Watches: `Provider`, `Secret`, `OVAProviderServer`, `HyperVProviderServer`.

```
Reconcile(request)
│
├─ 1. Fetch Provider CR
│     └─ NotFound → shutdown collector, close DB, return
├─ 2. Catalog.add(provider)
├─ 3. Deferred auth handling (checked last):
│     ├─ ConnectionAuthRetry present → RequeueAfter = 3 min (Hyper-V only)
│     └─ ConnectionAuthFailed (no retry) → RequeueAfter = 0 (stops reconcile)
├─ 4. Generation change (!HasReconciled) → shutdown old collector
├─ 5. phase = Staging, BeginStagingConditions
├─ 6. Provider-server lifecycle (OVA / HyperV)
│     ├─ Deleting → cleanupProviderServer (legacy PV cleanup for OVA, delete server CR, remove finalizer)
│     └─ Alive → delete old server if spec changed, then ensureProviderServer
├─ 7. validate()
│     ├─ validateType
│     ├─ validateURL
│     ├─ validateSecret (type-specific keys + TLS fingerprint for vSphere)
│     ├─ testConnection (ephemeral collector, Test())
│     ├─ inventoryCreated (HasParity check on live collector)
│     └─ validation.Build(r, client).Validate() — type-specific (see table above)
├─ 8. ensureSSHKeys (vSphere only)
├─ 9. updateContainer (build/replace collector when ready)
├─ 10. Ready check
│      └─ no blocker + ConnectionTestSucceeded + InventoryCreated
│         → phase = Ready, set Ready condition
├─ 11. updateProvider (sync provider into collector owner)
├─ 12. Requeue
│      ├─ SlowReQ  if missing ConnectionTestSucceeded or InventoryCreated
│      └─ LongReQ  for periodic re-testing once ready
│
└─ deferred: EndStagingConditions → updateProviderStatus (ObservedGeneration, events)
```

### Key behaviors

- **Generation tracking**: `HasReconciled()` compares `ObservedGeneration` with `Generation`. Spec changes shut down the old collector and close its DB.
- **Secret change detection**: `SecretResourceVersion` in status; secret rotation forces collector replacement even when spec is unchanged.
- **Auth failure handling**:
  - HTTP 401/400 → `ConnectionAuthFailed`, `phase = ConnectionFailed`.
  - **Hyper-V**: also sets `ConnectionAuthRetry` (WinRM Basic auth may be disabled, not wrong creds) → reconcile continues every **3 minutes** (`AuthRetryReQ`).
  - **All other types**: `ConnectionAuthFailed` with no retry → `RequeueAfter = 0` until spec/secret changes (prevents account lockout).
- **Hyper-V transient WinRM**: if collector has parity, connection test failures are suppressed and `ConnectionTestSucceeded` is still set.
- **Staging conditions**: `BeginStagingConditions` / `EndStagingConditions` prune stale conditions each cycle.

---

## Status Phases

Backend sets exactly four phase values on `provider.status.phase`:

| Phase | Constant | Set when |
|-------|----------|----------|
| `Staging` | `Staging` | Start of every reconcile (before validations complete) |
| `Ready` | `Ready` | No blocker condition **and** `ConnectionTestSucceeded` **and** `InventoryCreated` |
| `ValidationFailed` | `ValidationFailed` | Type/URL/secret/settings validation fails, SMB CSI missing, SMB mount stuck, OVA/Hyper-V pod image errors |
| `ConnectionFailed` | `ConnectionFailed` | Connection test fails, TLS cert error, auth failure (401/400) |

Phase is **not** a blocker by itself — the console should also inspect `status.conditions` for detail. `Ready` phase additionally sets a `Ready` condition (category `Required`).

---

## Condition Types

### Blocker / Critical conditions

| Condition | Category | Trigger |
|-----------|----------|---------|
| `ProviderTypeNotSupported` | Critical | `provider.Type()` not in `api.ProviderTypes` |
| `UrlNotValid` | Critical | URL empty, malformed, invalid NFS (OVA), or missing Hyper-V host |
| `SecretNotValid` | Critical | Secret ref missing, secret not found, or required keys absent |
| `SettingsNotValid` | Critical | Hyper-V: invalid `managementType` (must be `standalone`, `cluster`, or empty) |
| `ConnectionAuthFailed` | Critical | HTTP 401/400 from connection test |
| `ConnectionTestFailed` | Critical | Other connection test failure or TLS verification error |
| `SMBCSIDriverNotReady` | Critical | Hyper-V: `smb.csi.k8s.io` CSIDriver not found |
| `SMBMountFailed` | Critical | Hyper-V: provider-server pod stuck pending on SMB mount beyond timeout |

### Required conditions (must be present for Ready)

| Condition | Category | Trigger |
|-----------|----------|---------|
| `ConnectionTestSucceeded` | Required | Connection test passes (or Hyper-V transient failure suppressed) |
| `InventoryCreated` | Required | Collector `HasParity()` is true |

### Advisory / Warning conditions

| Condition | Category | Trigger |
|-----------|----------|---------|
| `Validated` | Advisory | All validations pass with no blockers |
| `LoadInventory` | Advisory | Collector exists but hasn't reached parity |
| `WaitingForService` | Advisory | OVA/Hyper-V provider-server pod not yet ready |
| `ConnectionInsecure` | Warn | `insecureSkipVerify` set in secret |
| `ConnectionAuthRetry` | Advisory | Hyper-V auth failure with periodic retry enabled |
| `SSHReady` | Advisory | vSphere SSH: some hosts pass SSH test (partial success) |
| `SSHNotReady` | Warn | vSphere SSH: keys missing or hosts fail SSH test |
| `InsufficientPrivileges` | Warn | vSphere: service account missing migration privileges |
| `ForkliftNotInstalled` | Warn | Remote OpenShift: `forkliftcontrollers` CRD not found on target cluster |

### Defined but unused

`InventoryError` is declared in `validation.go` but not set anywhere at this commit.

---

## Secret / Credentials Handling

| Provider | Required secret keys | Optional / TLS |
|----------|---------------------|----------------|
| `openshift` | `token` | — |
| `vsphere` | `user`, `password` | `ca.crt` (required unless `insecureSkipVerify`); sets `status.fingerprint` |
| `ovirt` | `user`, `password` | `ca.crt` (required unless `insecureSkipVerify`) |
| `openstack` | *(validated by collector)* | — |
| `ova` | `url` (NFS path) | — |
| `hyperv` | `username`, `password`, `smbUrl` | `insecureSkipVerify=true` (backend always skips TLS verification via `NewWinRMDriver(..., true, nil)` — `ca.crt` is not consumed) |
| `nutanix` | `user`, `password` | `ca.crt` (required unless `insecureSkipVerify`) |
| `ec2` | *(validated by EC2 validator)* | — |
| `azure` | *(validated by collector)* | — |

`insecureSkipVerify` is read via `base.GetInsecureSkipVerifyFlag(secret)` → sets `ConnectionInsecure` warning.

---

## SSH Key Management (vSphere)

When `provider.Spec.Settings["esxiCloneMethod"] == "ssh"`:

1. **Key generation** (`ensureSSHKeys`): 2048-bit RSA pair stored in secrets `{sanitized-name}-ssh-private` / `-ssh-public` with `ownerReferences` on the Provider.
2. **SSH validation** (`ValidateSSHReadiness`): runs only after `InventoryCreated`. Tests every ESXi host:
   - **vCenter**: hosts from inventory DB; IP from `Host` CRD `IpAddress` (migration network) or `ManagementIPs`.
   - **Direct ESXi**: IP from `provider.Spec.URL`.
   - Sets `SSHReady` (partial success with `Items` as `id|name|ip`) and/or `SSHNotReady` (setup instructions in `Suggestion`).

---

## Inventory Container Lifecycle

### Container update flow

```
updateContainer(provider)
│
├─ getSecret → check SecretResourceVersion changed?
├─ Skip if blocker or no ConnectionTestSucceeded
├─ Skip if secret unchanged AND HasReconciled AND collector exists
├─ Open SQLite DB: {WorkingDir}/{namespace}/{name}/{uid}.db
├─ container.Build(db, provider, secret) → new collector
├─ container.Replace(collector) → old collector DB closed
└─ Update provider.Status.SecretResourceVersion
```

### Connection testing

`testConnection` builds an **ephemeral** collector (`db=nil`) and calls `Test()`. OVA/Hyper-V gate on provider-server pod readiness (`checkOVAServiceReady` / `checkHyperVServiceReady`).

---

## Provider-Server Lifecycle (OVA / HyperV)

| Provider | CR type | Finalizer |
|----------|---------|-----------|
| OVA | `OVAProviderServer` | `api.OvaProviderFinalizer` |
| HyperV | `HyperVProviderServer` | `api.HyperVProviderFinalizer` |

1. **Ensure**: creates provider-server CR; deletes old server when `!HasReconciled()` to force redeploy.
2. **Readiness**: OVA checks Deployment `ReadyReplicas`; Hyper-V checks pod readiness and stuck SMB mounts (timeout from `Settings.ProviderPendingTimeoutSeconds`).
3. **Cleanup on deletion**: OVA legacy PV cleanup (`subapp=ova-server`, `app=forklift`, `provider={name}`), delete server CR, remove finalizer.

---

## REST API Handlers

Inventory REST API served by `libweb.WebServer` on `Settings.Inventory.Port` (optional TLS). Started in `Add()` alongside `policy.Agent.Start()`.

### Handler registration (`web.All(container, k8sClient)`)

1. `SchemaHandler` — OpenAPI schema
2. `ProviderHandler` — `GET /providers` (aggregated list)
3. `aap.Handler` — Ansible Automation Platform integration (uses k8s client)
4. Per-type handlers via `{type}.Handlers(container)`:
   - `ocp`, `vsphere`, `ovirt`, `openstack`, `ova`, `ec2web`, `hyperv`, `nutanix`, `azureweb`

### Provider list endpoint

`GET /providers` aggregates inventory from provider types into JSON keyed by type string:

`openshift`, `vsphere`, `ovirt`, `openstack`, `ova`, `ec2`, `hyperv`, `nutanix`

**Note:** Azure handlers are registered for per-provider inventory routes but Azure is **not** included in the aggregated `GET /providers` response at this commit.

Per-provider routes use `base.Handler.Prepare()` which resolves the collector from the in-memory container; missing provider returns 404 with `X-Reason: ProviderNotFound`.

---

## Base Model Types

`pkg/controller/provider/model/base/model.go`:

- **`Ref`**: `{ Kind, ID }` — generic inventory object reference.
- **`Concern`**: `{ Id, Label, Category, Assessment }` — VM migration concern (UI concerns table).
- **`ConcernHolder`** interface: `GetConcerns() []Concern`.

DB schema from `model.Models(provider)` → provider-type-specific model slices.

---

## DB Storage

```
{Settings.Inventory.WorkingDir}/{namespace}/{name}/{uid}.db
```

---

## Catalog

Thread-safe in-memory map (`sync.Mutex` + `map[reconcile.Request]*api.Provider`). Used during deletion to retrieve the provider reference after the CR is gone (needed to shut down the correct collector).

---

## Configuration

| Setting | Purpose |
|---------|---------|
| `Settings.Inventory.Port` | Inventory REST API port |
| `Settings.Inventory.TLS.*` | Optional TLS for inventory API |
| `Settings.Inventory.WorkingDir` | SQLite DB root directory |
| `Settings.WorkingDir` | File-backed working directory (`libfb.WorkingDir`) |
| `Settings.Namespace` | Namespace for OVA/Hyper-V provider-server pods |
| `Settings.ProviderPendingTimeoutSeconds` | Pod pending timeout for OVA/Hyper-V service readiness |
| `Settings.MaxConcurrentReconciles` | Controller concurrency |
| `Settings.CORS.AllowedOrigins` | CORS when TLS enabled |

---

## Error Patterns

- Validation functions set conditions and phase inline; most return `nil` error (non-blocking) so reconcile continues to update status.
- `ConnectionAuthFailed` without `ConnectionAuthRetry` → reconciliation stops (`RequeueAfter = 0`).
- `ConnectionAuthRetry` (Hyper-V) → `RequeueAfter = 3m`, reconcile continues.
- OVA image pull / crash loop errors → `ValidationFailed` + `ConnectionTestFailed`.
- Transient API errors during `ValidateForkliftInstalled` discovery → returned as reconcile error (retry by controller-runtime).
- Collector build/replace errors propagate and abort the reconcile cycle.

---

## Frontend Relevance

### Phase mapping

| Backend `status.phase` | Console constant (`src/utils/constants.ts`) | UI behavior |
|------------------------|---------------------------------------------|-------------|
| `Staging` | `CATEGORY_TYPES.STAGING` | In-progress icon in `PhaseCell` |
| `Ready` | `CATEGORY_TYPES.READY` | Provider usable for plans/maps; inventory API calls succeed |
| `ValidationFailed` | `CATEGORY_TYPES.VALIDATION_FAILED` | Error status cell with conditions tooltip |
| `ConnectionFailed` | `CATEGORY_TYPES.CONNECTION_FAILED` | Error status cell with conditions tooltip |

Frontend-only phases (not set by this controller): `ApplianceManagementEnabled` (OVA), `Unknown`.

### Conditions the UI should surface

- **Provider list/details**: all `status.conditions` — especially blockers (`Category: Critical`) and warnings (`Category: Warn`).
- **Plan creation**: providers filtered to `status.phase === 'Ready'` (`getProvidersInventoryByNamespace`).
- **vSphere SSH**: `SSHNotReady.Suggestion` and `SSHReady.Items` contain host setup instructions.
- **vSphere privileges**: `InsufficientPrivileges.Suggestion` lists missing privileges (non-blocking).
- **Remote OpenShift**: `ForkliftNotInstalled` warns operator is absent on target cluster.
- **Hyper-V**: `SMBCSIDriverNotReady`, `SMBMountFailed`, `WaitingForService`, `SettingsNotValid`.
- **Fingerprint**: `status.fingerprint` displayed for vSphere TLS trust.

### Inventory API

Console inventory GETs go through the forklift-api proxy to the inventory service. Provider must be `Ready` with a running collector for sub-resource endpoints (`/providers/{type}/vms`, etc.). Use `detail` query param for derived counts (see project-context OVA/Hyper-V notes).
