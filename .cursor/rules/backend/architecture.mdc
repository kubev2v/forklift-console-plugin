---
description: Forklift backend architecture - entry points, deployment roles, controller-runtime framework
alwaysApply: false
---

# Backend Architecture

> Analyzed from commit: `baf9c7bcc` on `2026-09-17`
> Source paths: `cmd/forklift-controller/`, `cmd/forklift-api/`, `pkg/controller/controller.go`, `pkg/controller/base/`

## Package Purpose

The Forklift backend is a Go application built on **controller-runtime** (the Kubernetes operator framework). It ships as **two binaries** deployed as separate OpenShift workloads:

| Binary | Entry Point | Role |
|---|---|---|
| `forklift-controller` | `cmd/forklift-controller/main.go` | Runs CRD reconciliation controllers (split by `ROLE`), registers API schemes, starts controller-runtime Manager, exposes Prometheus on `:2112` and optional pprof on `localhost:6060`. |
| `forklift-api` | `cmd/forklift-api/forklift-api.go` | Runs admission webhooks (`:8443`) and a small REST services API (`:8444`). Uses plain `net/http` with TLS — **not** controller-runtime Manager. |

Both binaries share `pkg/` libraries but have independent lifecycles. The inventory REST API (VM/network/storage browsing) is **not** in `forklift-api`; it is started inside the **provider controller** when the inventory role is enabled.

## Key Types and Structs

### `settings.ControllerSettings` (`pkg/settings/settings.go`)

Global singleton at `settings.Settings`. Loaded from environment variables in `init()` before `main()` runs. Composes:

| Field | Type | Purpose |
|---|---|---|
| `Role` | `settings.Role` | Which controller sets to start (`main`, `inventory`, or both) |
| `Metrics` | `settings.Metrics` | Controller-runtime metrics bind address (`METRICS_PORT`, default `8080`; `0` disables) |
| `Inventory` | `settings.Inventory` | Inventory API host/port/TLS/CORS/auth/namespace |
| `Migration` | `settings.Migration` | VM concurrency, retry limits, virt-v2v images, container resource defaults |
| `PolicyAgent` | `settings.PolicyAgent` | Validation policy agent URL and TLS |
| `Logging` | `settings.Logging` | Log level and development mode |
| `Profiler` | `settings.Profiler` | CPU/memory profiling output |
| `Features` | `settings.Features` | Feature gates (warm migration, copy offload, live migration, Conversion CR, etc.) |
| `Providers` | `settings.Providers` | OVA/HyperV server images and resource limits |
| `OpenShift` | `bool` | Whether running on OpenShift (adds Route API scheme) |
| `Development` | `bool` | Development mode flag |

### `settings.Role` (`pkg/settings/role.go`)

Loaded from `ROLE` env var (comma-separated `main` and/or `inventory`). If unset, **both roles are enabled** (single-pod deployment). `Has(name)` checks membership.

### `base.Reconciler` (`pkg/controller/base/controller.go`)

Shared base struct embedded by every controller reconciler:

```go
type Reconciler struct {
    record.EventRecorder    // K8s event recording
    client.Client           // K8s API client (cached)
    Log logging.LevelLogger // Structured logger
}
```

Provides:
- `Started()` / `Ended(reQ, err)` — lifecycle logging with requeue duration calculation
- `Record(object, conditions)` — translates condition changes to K8s Events
- Requeue constants: `FastReQ` (500ms), `SlowReQ` (3s), `LongReQ` (30s)
- On conflict errors: logs info-level and returns `SlowReQ`
- On `ProviderNotReadyError`: logs at V(1) and returns `SlowReQ`

### `forklift_api.forkliftAPIApp` (`pkg/forklift-api/api.go`)

Wraps a controller-runtime `client.Client` and starts two TLS HTTP servers. `Execute()` runs services in a goroutine and blocks on webhooks.

### `controller.AddFunction` (`pkg/controller/controller.go`)

```go
type AddFunction func(manager.Manager) error
```

Each controller package exports `Add(mgr)` matching this signature.

## Interfaces and Implementations

| Interface | Package | Implementations / Notes |
|---|---|---|
| `reconcile.Reconciler` | controller-runtime | Every controller's `Reconciler` struct (value receiver, not pointer) |
| `controller.AddFunction` | `pkg/controller` | `migration.Add`, `plan.Add`, `network.Add`, `storage.Add`, `host.Add`, `hook.Add`, `conversion.Add`, `provider.Add`, `ova.Add`, `hyperv.Add` |
| `forklift_api.ForkliftApi` | `pkg/forklift-api` | `forkliftAPIApp` — `NewForkliftApi(client)` / `Execute()` |
| Provider web `Client` | `pkg/controller/provider/web/` | Per-provider clients (vSphere, oVirt, OpenStack, OVA, HyperV, OCP, EC2, Nutanix, Azure) registered via `web.All()` |
| Inventory container | `pkg/lib/inventory/container` | File-backed DB per provider; started by provider controller |
| Policy agent | `pkg/controller/validation/policy` | Optional external validation service; started when `POLICY_AGENT_URL` is set |

Extension hooks (currently empty slices, reserved for compile-time registration):
- `pkg/webhook.AddToManagerFuncs` — manager-level webhooks in `forklift-controller`
- `pkg/forklift-api/webhooks.AddToManagerFuncs` — unused; webhooks registered via HTTP mux instead

## Reconciliation / Execution Flow

### Startup Sequence (`forklift-controller`)

```
init()
  └─ Settings.Load()          ← reads ALL env vars (role, features, migration, etc.)
  └─ logging.Factory.New()    ← configures structured logger

main()
  ├─ profiler()               ← optional CPU/memory profiler
  ├─ http ":2112/metrics"     ← Prometheus scrape endpoint (goroutine)
  ├─ http "localhost:6060"    ← pprof debug endpoint (goroutine)
  ├─ config.GetConfig()       ← kubeconfig / in-cluster config
  ├─ manager.New(cfg, opts)   ← controller-runtime Manager (metrics via Settings.Address())
  ├─ apis.AddToScheme()       ← Forklift CRDs
  ├─ [external schemes]       ← storage, CNI, KubeVirt, CDI, export, instancetype, multicluster, CSI snapshot, Route (OCP), Template (optional)
  ├─ controller.AddToManager(mgr)  ← register controllers by role
  ├─ webhook.AddToManager(mgr)   ← register manager-level webhooks (extension point)
  └─ mgr.Start(signals)       ← blocks until termination
```

### Two Deployment Roles

The `ROLE` env var splits controllers into two groups for separate Deployment scaling:

**Main role** (`settings.MainRole = "main"`):

| Controller | CRD | Package |
|---|---|---|
| `migration` | `Migration` | `pkg/controller/migration/` |
| `plan` | `Plan` | `pkg/controller/plan/` |
| `network` | `NetworkMap` | `pkg/controller/map/network/` |
| `storage` | `StorageMap` | `pkg/controller/map/storage/` |
| `host` | `Host` | `pkg/controller/host/` |
| `hook` | `Hook` | `pkg/controller/hook/` |
| `conversion` | `Conversion` | `pkg/controller/conversion/` |

**Inventory role** (`settings.InventoryRole = "inventory"`):

| Controller | CRD | Package |
|---|---|---|
| `provider` | `Provider` | `pkg/controller/provider/` |
| `ova` | `OVAProviderServer` | `pkg/controller/ova/` |
| `hyperv` | `HyperVProviderServer` | `pkg/controller/hyperv/` |

The inventory role is special — the **provider controller** also starts:
- An **inventory web server** (`libweb.WebServer`) on `API_PORT` (default `8080`) with TLS/CORS
- A **policy agent** (`policy.Agent.Start()`) when `POLICY_AGENT_URL` is configured

### Controller Registration Pattern

Every controller follows the same `Add(mgr manager.Manager) error` pattern:

```go
func Add(mgr manager.Manager) error {
    reconciler := &Reconciler{
        Reconciler: base.Reconciler{
            EventRecorder: mgr.GetEventRecorderFor(Name),
            Client:        mgr.GetClient(),
            Log:           log,
        },
    }
    cnt, err := controller.New(Name, mgr, controller.Options{
        Reconciler:              reconciler,
        MaxConcurrentReconciles: Settings.MaxConcurrentReconciles,
    })
    cnt.Watch(source.Kind(mgr.GetCache(), &api.PrimaryCRD{}, ...))
    cnt.Watch(source.Kind(mgr.GetCache(), &api.ReferencedCRD{},
        libref.TypedHandler[*api.ReferencedCRD](&api.PrimaryCRD{}), ...))
    return nil
}
```

Key points:
- `MaxConcurrentReconciles` defaults to **10** (`MAX_CONCURRENT_RECONCILES`)
- Controllers watch primary CRs plus referenced resources via `libref.TypedHandler`
- Plan controller adds a **channel source** to requeue when provider inventory changes
- Provider controller watches `Secret`, `OVAProviderServer`, `HyperVProviderServer` references
- Reconcilers use **value receivers** (not pointers) to avoid shared logger/state

### `controller.AddToManager` dispatcher

```go
var MainControllers = []AddFunction{
    migration.Add, plan.Add, network.Add, storage.Add,
    host.Add, hook.Add, conversion.Add,
}
var InventoryControllers = []AddFunction{provider.Add, ova.Add, hyperv.Add}

func AddToManager(m manager.Manager) error {
    if Settings.Has(settings.InventoryRole) { load(InventoryControllers) }
    if Settings.Has(settings.MainRole)      { load(MainControllers) }
}
```

### `forklift-api` Startup

```
main()
  ├─ apis.AddToScheme(scheme.Scheme)
  ├─ rest.InClusterConfig()           ← requires in-cluster credentials
  ├─ client.New(config, ...)          ← controller-runtime client (not Manager)
  └─ forklift_api.NewForkliftApi(client).Execute()
        ├─ goroutine: serveServices() on :8444 (TLS)
        └─ blocking: serveWebhooks() on :8443 (TLS)
```

## Status Conditions

Forklift uses a shared condition framework (`pkg/lib/condition`) embedded inline in CRD status via `libcnd.Conditions`.

### Condition Categories

| Category | Effect |
|---|---|
| `Critical` | Blocks reconcile and `Ready` condition |
| `Error` | Blocks `Ready` condition |
| `Warn` | Advisory; does not block `Ready` |
| `Required` | Required for `Ready` |
| `Advisory` | Informational |

Common condition types from `pkg/lib/condition`: `Ready`, `ReconcileFailed`. API-level types in `pkg/apis/forklift/v1beta1/doc.go`: `Executing`, `Running`, `Pending`, `Canceled`, `Succeeded`, `Failed`, `Blocked`, `Deleted`.

### Staging Pattern

Controllers call `BeginStagingConditions()` at reconcile start and `EndStagingConditions()` before status update. Unstaged conditions are removed — this is how transient errors clear between passes. `base.Reconciler.Record()` emits K8s Events for added/updated/deleted conditions (Warning for Critical/Error/Warn).

### Per-Resource Status Summary

| Resource | Controller | Key Status Fields |
|---|---|---|
| `Provider` | `provider` | `status.phase` (`Staging`, `Ready`, `ValidationFailed`, `ConnectionFailed`), `status.conditions` |
| `Plan` | `plan` | `status.conditions` (`Ready`, `Executing`, `Succeeded`, `Failed`), `status.migration` |
| `Migration` | `migration` | `status.vms[].phase` (pipeline phases from `doc.go`) |
| `NetworkMap` | `network` | `status.conditions` |
| `StorageMap` | `storage` | `status.conditions` |
| `Conversion` | `conversion` | `status.phase` (`Pending`, `Running`, `Succeeded`, `Failed`, `Canceled`), `status.conditions` |
| `Host` | `host` | `status.conditions` |
| `Hook` | `hook` | `status.conditions` |

Provider auth failures set `ConnectionAuthRetry` (requeue after 3 min) or `ConnectionAuthFailed` conditions before phase transitions.

## REST API Endpoints

### Admission Webhooks (`forklift-api`, `:8443`)

| Path | Type | Resource |
|---|---|---|
| `/secret-validate` | Validating | Secret (provider credentials) |
| `/secret-mutate` | Mutating | Secret |
| `/plan-validate` | Validating | Plan |
| `/plan-mutate` | Mutating | Plan (sets transfer network, `populatorLabels` annotation) |
| `/provider-validate` | Validating | Provider |
| `/provider-mutate` | Mutating | Provider |
| `/migration-validate` | Validating | Migration |

TLS via `API_TLS_CERTIFICATE` / `API_TLS_KEY`.

### Services API (`forklift-api`, `:8444`)

| Path | Method | Purpose |
|---|---|---|
| `/tls-certificate?URL=...` | GET | Fetches TLS certificate from a URL (`insecureSkipVerify: true`); returns PEM. Used by frontend "Fetch certificate" in provider creation. |

TLS via `SERVICES_TLS_CERTIFICATE` / `SERVICES_TLS_KEY`.

### Inventory REST API (`forklift-controller`, inventory role)

Started by provider controller via `libweb.WebServer`. Routes are per-provider-type handlers under `pkg/controller/provider/web/`. Configured via `Inventory` settings (`API_HOST`, `API_PORT`, `INVENTORY_SERVICE_SCHEME`, `CORS_ALLOWED_ORIGINS`, `AUTH_REQUIRED`). This is the API the **console plugin** uses to browse source inventory.

## Integration Points

```
forklift-controller (main role)
  ├─ KubeVirt / CDI / export / snapshot APIs  ← creates VMs, DVs, exports during migration
  ├─ StorageClass, NAD (CNI)                  ← mapping validation
  └─ Plan → Migration CR lifecycle

forklift-controller (inventory role)
  ├─ Provider source APIs (vSphere, oVirt, etc.)  ← inventory collection
  ├─ lib/inventory (file-backed DB)               ← cached inventory per provider
  ├─ OVA/HyperV provider server CRs               ← sidecar pods for file-based providers
  └─ Policy agent (optional)                      ← VM validation rules

forklift-api
  ├─ K8s API (in-cluster client)  ← webhook admitters read Plans, Providers, Secrets
  └─ util.GetTlsCertificate       ← TLS cert discovery service
```

### Scheme Registration (`forklift-controller`)

Required (exit on failure): Forklift CRDs, StorageClass, CNI, KubeVirt, CDI, export.
Optional (log and continue): OpenShift Template, instancetype, multicluster ServiceImport, CSI VolumeSnapshot.
OpenShift-only: Route API when `OPENSHIFT=true`.

### Dependency Direction

```
cmd/ → pkg/controller/* → pkg/controller/base, pkg/lib/*, pkg/apis/*
cmd/forklift-api → pkg/forklift-api → pkg/apis, pkg/lib/*
```

Feature controllers never import `cmd/`. Shared `pkg/lib/` must not import feature controllers.

## Configuration

### Deployment Role

| Env Var | Default | Description |
|---|---|---|
| `ROLE` | `main,inventory` (both) | Comma-separated `main` and/or `inventory` |
| `OPENSHIFT` | `false` | Enable OpenShift Route API |
| `DEVELOPMENT` | `false` | Development mode |
| `OPENSHIFT_VERSION` | (none) | Semantic version for feature gate floor checks |
| `POD_NAMESPACE` | (none) | Controller pod namespace |

### Feature Gates

| Env Var | Default | Description |
|---|---|---|
| `FEATURE_OVIRT_WARM_MIGRATION` | `false` | oVirt warm migration |
| `FEATURE_RETAIN_PRECOPY_IMPORTER_PODS` | `false` | Retain importer pods during warm migration |
| `FEATURE_VSPHERE_INCREMENTAL_BACKUP` | `false` | vSphere changeID incremental backup |
| `FEATURE_COPY_OFFLOAD` | `false` | Storage copy offload plugins |
| `FEATURE_OCP_LIVE_MIGRATION` | `false` | Cross-cluster live migration |
| `FEATURE_VMWARE_SYSTEM_SERIAL_NUMBER` | `true` | VMware serial number (requires OCP ≥ 4.20) |
| `FEATURE_STATIC_UDN_IP_ADDRESSES` | `false` | Static IPs in UDN (requires OCP ≥ 4.20) |
| `FEATURE_OVF_APPLIANCE_MANAGEMENT` | `false` | OVA/HyperV appliance management endpoints |
| `FEATURE_VSPHERE_VMWARE_DRIVER_REMOVAL` | `false` | VMware driver removal during Windows conversion |
| `FEATURE_WINDOWS_REGISTRY_NETWORK_CONFIG` | `false` | Registry-based Windows static IP scripts |
| `FEATURE_WINDOWS_WAIT_FOR_REBOOT` | `true` | Wait-for-reboot pipeline step for Windows VMs |
| `FEATURE_USE_CONVERSION_CR` | `true` | Delegate conversion to Conversion CRs |
| `FEATURE_RETAIN_POPULATOR_PODS` | `false` | Retain populator pods after migration |
| `FEATURE_XFS_REPAIR_IGNORE` | `false` | Ignore xfs_repair exit status |

Version-derived (no env var): `UdnSupportsMac` (OCP ≥ 4.20), `InsecureSkipVerifySupported` (OCP ≥ 4.21). Gates with OCP floor checks are silently disabled when `OPENSHIFT_VERSION` is below minimum.

### Migration Tuning

| Env Var | Default | Description |
|---|---|---|
| `MAX_VM_INFLIGHT` | `20` | Max concurrent VM migrations |
| `MAX_CONCURRENT_RECONCILES` | `10` | Controller-runtime reconciler concurrency |
| `VIRT_V2V_IMAGE` | (required for main) | Guest conversion image |
| `BLOCKER_GRACE_PERIOD_MINUTES` | `5` | Critical/Error blocker persistence before failing active migration |
| `PRECOPY_INTERVAL` | `60` | Warm migration precopy interval (minutes) |
| `METRICS_PORT` | `8080` | Controller-runtime metrics bind port (`0` = disabled) |

### Inventory API

| Env Var | Default | Description |
|---|---|---|
| `API_HOST` | `localhost` | Inventory API bind host |
| `API_PORT` | `8080` | Inventory API port |
| `INVENTORY_SERVICE_SCHEME` | `https` | `http` or `https` |
| `AUTH_REQUIRED` | `true` | Whether auth is required |
| `CORS_ALLOWED_ORIGINS` | (empty) | Space-separated allowed origins |
| `POLICY_AGENT_URL` | (none) | External policy agent; disabled when unset |

## Error Patterns

| Pattern | Handling |
|---|---|
| `k8serr.IsConflict` | Log info, requeue `SlowReQ` (3s) — optimistic concurrency |
| `k8serr.IsNotFound` | Treat as deleted; cleanup sidecars (provider inventory DB) |
| `web.ProviderNotReadyError` | Log V(1), requeue `SlowReQ` — inventory not yet populated |
| Reconcile error (other) | Log error, requeue `SlowReQ` via `Ended()` |
| Provider auth failure | Set `ConnectionAuthRetry` → requeue 3 min; or `ConnectionAuthFailed` → stop |
| Blocker conditions during migration | Must persist `BLOCKER_GRACE_PERIOD_MINUTES` before plan fails executing migration |
| Missing TLS env in `forklift-api` | Server goroutine logs and returns without starting |

Reconcilers always nil the returned `err` after `Ended()` sets `RequeueAfter` — errors drive requeue timing, not controller crash.

## Frontend Relevance

### What the frontend talks to

1. **Inventory REST API** (provider controller web server, inventory role) — Browse VMs, networks, datastores. Proxied through console to `API_PORT` (default 8080). Use `buildProviderInventoryPath` with `?detail=1` on root fetches.

2. **TLS certificate service** (`:8444/tls-certificate?URL=...`) — Provider creation "Fetch certificate" button.

3. **Kubernetes API** (OpenShift Console SDK) — CRUD on Forklift CRDs. Admission webhooks on `:8443` validate/mutate transparently.

4. **ForkliftController CR** — Feature gates (`spec.feature_*`) mirror `FEATURE_*` env vars for UI show/hide logic.

### Status → UI mapping

| Frontend Page | Backend Source | Key Fields |
|---|---|---|
| Providers | `provider` controller | `status.phase`, `status.conditions` |
| Plans | `plan` controller | `status.conditions` (Ready/Executing/Succeeded/Failed) |
| Migrations | `migration` controller | `status.vms[].phase`, pipeline steps |
| Conversions / Deep Inspection | `conversion` controller | `status.phase`, `status.inspectionResult` |
| Network/Storage Maps | `network`/`storage` controllers | `status.conditions` |

### Webhook side effects on UI operations

- **Plan mutate**: Auto-sets transfer network from destination provider default; adds `populatorLabels` annotation (`AnnPopulatorLabels`).
- **Plan validate**: Rejects invalid storage mappings (e.g., RWO with live migration on non-vSphere).
- **Secret mutate/validate**: Normalizes and validates provider credential Secrets.
- **Provider mutate/validate**: Provider-specific defaults and validation.

### Feature gates the frontend should mirror

| ForkliftController `spec` field | UI impact |
|---|---|
| `feature_copy_offload` | Storage vendor offload options in StorageMap |
| `feature_ocp_live_migration` | Live migration type in plan wizard |
| `feature_ovf_appliance_management` | Appliance management UI for OVA/HyperV |
| `feature_windows_wait_for_reboot` | `WaitForGuestReboots` pipeline step visibility |

### New since prior analysis

- **Conversion controller** (`FEATURE_USE_CONVERSION_CR`, default `true`) — Deep inspection and guest conversion now managed via `Conversion` CR; frontend has local types in `src/utils/crds/conversion/`.
- **Provider types** Nutanix and Azure added to API (`ProviderType` enum).
- **Windows wait-for-reboot** pipeline step gated by `FEATURE_WINDOWS_WAIT_FOR_REBOOT` (default on).
