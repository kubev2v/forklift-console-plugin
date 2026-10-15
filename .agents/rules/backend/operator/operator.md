---
description: Forklift operator - Ansible-based deployment, feature flags, container images, ForkliftController CRD
alwaysApply: false
---

# Forklift Operator

> Analyzed from commit: `baf9c7bcc307ed9358ad59886a5536366a050012` on 2026-09-17
> Source paths: `operator/`

## Package Purpose

The Forklift operator is an **Ansible-based operator** (operator-sdk) that watches the `ForkliftController` CRD and reconciles all Forklift components into the target namespace. It uses a single Ansible role (`forkliftcontroller`) with Jinja2 templates. The CR's `.spec` fields map to Ansible variables that override defaults in `roles/forkliftcontroller/defaults/main.yml`.

---

## Key Types and Structs

### `ForkliftController` CRD

- **Group**: `forklift.konveyor.io`, **Version**: `v1beta1`, **Kind**: `ForkliftController`
- Watched resource defined in `operator/watches.yaml`
- Finalizer: `forklift.konveyor.io/finalizer` (cleanup on deletion via `finalize: true`)

```go
type ForkliftControllerSpec struct {
    // Feature gates (string "true"/"false")
    FeatureUIPlugin, FeatureValidation, FeatureVolumePopulator, FeatureCopyOffload,
    FeatureOCPLiveMigration, FeatureOVAApplianceManagement, FeatureVMwareSystemSerialNumber,
    FeatureAuthRequired, FeatureCLIDownload, FeatureMCPServer,
    FeatureVSphereVMwareDriverRemoval, FeatureWindowsRegistryNetworkConfig,
    FeatureWindowsWaitForReboot, FeatureUseConversionCR string

    // Container image overrides (FQIN)
    ControllerImageFQIN, VirtV2VImageFQIN, VirtV2VImageXFSFQIN,
    DeepInspectionImageFQIN, DeepInspectionImageXFSFQIN, VDDKImage,
    APIImageFQIN, CLIDownloadImageFQIN, UIPluginImageFQIN, ValidationImageFQIN,
    PopulatorControllerImageFQIN, PopulatorOvirtImageFQIN, PopulatorOpenstackImageFQIN,
    PopulatorVSphereCopyOffloadImageFQIN, OVAProviderServerFQIN, HyperVProviderServerFQIN,
    MustGatherImageFQIN, OVAProxyFQIN string

    // Controller tuning, AAP settings, MCP server config, resource limits...
}
```

---

## Feature Flags

Feature flags flow from the ForkliftController CR through Ansible into controller pod env vars:

```
ForkliftController CR spec
  → Ansible role variables
    → deployment-controller.yml.j2
      → Pod env vars (FEATURE_*)
        → pkg/settings/features.go
```

### CR feature gates → env vars

| CR field | Env var | Default | Description |
|----------|---------|---------|-------------|
| `feature_copy_offload` | `FEATURE_COPY_OFFLOAD` | true | vSphere XCOPY copy offload |
| `feature_ocp_live_migration` | `FEATURE_OCP_LIVE_MIGRATION` | true | Cross-cluster live migration |
| `feature_volume_populator` | — | true | Deploys volume populator controller |
| `feature_ui_plugin` | — | true | Console UI plugin (OCP only) |
| `feature_validation` | — | true | OPA validation service |
| `feature_cli_download` | — | true | kubectl-mtv download (OCP only) |
| `feature_mcp_server` | — | false | MCP server for Lightspeed |
| `feature_ova_appliance_management` | `FEATURE_OVF_APPLIANCE_MANAGEMENT` | true | OVA/HyperV appliance endpoints |
| `feature_vmware_system_serial_number` | `FEATURE_VMWARE_SYSTEM_SERIAL_NUMBER` | true | VMware serial number (OCP ≥ 4.20) |
| `feature_vsphere_vmware_driver_removal` | `FEATURE_VSPHERE_VMWARE_DRIVER_REMOVAL` | false | Windows driver removal |
| `feature_windows_registry_network_config` | `FEATURE_WINDOWS_REGISTRY_NETWORK_CONFIG` | false | Windows static IP via registry |
| `feature_windows_wait_for_reboot` | `FEATURE_WINDOWS_WAIT_FOR_REBOOT` | true | WaitForGuestReboots pipeline step |
| `feature_use_conversion_cr` | `FEATURE_USE_CONVERSION_CR` | true | Delegate conversion to Conversion CRs |
| `controller_vsphere_incremental_backup` | `FEATURE_VSPHERE_INCREMENTAL_BACKUP` | true | changeID incremental backup |
| `controller_ovirt_warm_migration` | `FEATURE_OVIRT_WARM_MIGRATION` | true | oVirt warm migration |
| `controller_retain_precopy_importer_pods` | `FEATURE_RETAIN_PRECOPY_IMPORTER_PODS` | false | Keep precopy pods |
| `controller_retain_populator_pods` | `FEATURE_RETAIN_POPULATOR_PODS` | false | Keep populator pods for debug |

Some features are gated by OpenShift version in `pkg/settings/features.go` (e.g., `VmwareSystemSerialNumber` requires OCP ≥ 4.20, `InsecureSkipVerify` requires OCP ≥ 4.21).

---

## Container Images

Defined in `operator/related_images.yaml` (referenced via `RELATED_IMAGE_*` env vars injected by OLM/CSV):

| Name | Env var | Purpose |
|------|---------|---------|
| `controller` | `CONTROLLER_IMAGE` | Main controller + inventory binary |
| `api` | `API_IMAGE` | Webhook/validation API server |
| `validation` | `VALIDATION_IMAGE` | OPA policy agent |
| `ui_plugin` | `UI_PLUGIN_IMAGE` | Console UI plugin (this project) |
| `virt_v2v` | `VIRT_V2V_IMAGE` | Guest conversion |
| `virt_v2v_rhel9` | `VIRT_V2V_IMAGE_RHEL9` | RHEL9 virt-v2v variant |
| `deep-inspection` | `DEEP_INSPECTION_IMAGE` | Deep inspection pods |
| `deep-inspection-rhel9` | `DEEP_INSPECTION_IMAGE_RHEL9` | RHEL9 deep inspection |
| `populator_controller` | `POPULATOR_CONTROLLER_IMAGE` | Volume populator controller |
| `rhv_populator` | `OVIRT_POPULATOR_IMAGE` | oVirt disk populator |
| `openstack_populator` | `OPENSTACK_POPULATOR_IMAGE` | OpenStack disk populator |
| `vsphere_copy_offload_populator` | `VSPHERE_COPY_OFFLOAD_POPULATOR_IMAGE` | vSphere XCOPY offload |
| `ova_provider_server` | `OVA_PROVIDER_SERVER_IMAGE` | OVA inventory server |
| `hyperv_provider_server` | `HYPERV_PROVIDER_SERVER_IMAGE` | Hyper-V inventory server |
| `ova_proxy` | `OVA_PROXY_IMAGE` | OVA inventory proxy |
| `cli_download` | `CLI_DOWNLOAD_IMAGE` | kubectl-mtv CLI download |
| `must_gather` | `MUST_GATHER_IMAGE` | Must-gather diagnostics |

---

## Deployment Topology

The operator creates these Deployments in the Forklift namespace:

### forklift-controller (single pod, two containers)

| Container | Role | Binary | Key env |
|-----------|------|--------|---------|
| `main` | Migration reconciler | `forklift-controller` | `ROLE=main` |
| `inventory` | Inventory API server | `forklift-controller` | `ROLE=inventory` |

Both share the same image but run different roles per `ROLE` env var (`pkg/settings/role.go`).

### Always deployed

- **forklift-controller** — controller ConfigMap + Deployment, inventory service/route
- **forklift-api** — admission webhooks (validating + mutating)
- **forklift-ova-proxy** — OVA inventory proxy

### Conditionally deployed

| Deployment | Gate | Platform |
|------------|------|----------|
| forklift-validation | `feature_validation` | All |
| forklift-ui-plugin | `feature_ui_plugin` | OCP only |
| forklift-cli-download | `feature_cli_download` | OCP only |
| forklift-volume-populator-controller | `feature_volume_populator` | All |
| forklift-mcp-server | `feature_mcp_server` | OCP + `ols.openshift.io` API |

### MCP server + Lightspeed integration

When `feature_mcp_server=true` and `ols.openshift.io` API is present:
- Deploys MCP server service + deployment
- Optionally registers with OpenShift Lightspeed `OLSConfig` (`mcp_server_lightspeed_integration`, default true)
- Adds `kubectl-mtv` to `OLSConfig.spec.mcpServers`
- Optional `mcp_server_lightspeed_set_mcp_gate` adds `MCPServer` to `OLSConfig.featureGates`

---

## Reconciliation Flow

`roles/forkliftcontroller/tasks/main.yml`:

1. Evaluate feature flags → set `*_state` facts (`present`/`absent`)
2. Detect cluster type (OpenShift vs plain k8s via `route.openshift.io` API group)
3. Deploy controller ConfigMap + Deployment (always)
4. Deploy OVA proxy (always)
5. Deploy monitoring resources (OCP only: ServiceMonitor, PrometheusRules, alerts)
6. Deploy volume populator controller (if enabled)
7. Configure TLS certificates (k8s: cert-manager; OCP: service-serving-cert)
8. Deploy API server + webhooks
9. Create default host Provider (if KubeVirt present)
10. Deploy validation (if enabled)
11. Deploy UI plugin + register ConsolePlugin (if enabled, OCP only)
12. Deploy CLI download (if enabled, OCP only)
13. Deploy MCP server + Lightspeed registration (if enabled, OCP + OLS)
14. Cleanup disabled features

On finalize (`finalize: true`): remove webhooks, ConsolePlugin, OLSConfig MCP registration.

---

## Ansible Role Structure

```
operator/roles/forkliftcontroller/
├── defaults/main.yml      # Image refs, computed names, internal state vars
├── tasks/main.yml         # Reconciliation logic
├── tasks/cleanup.yml      # Resource cleanup for disabled features
├── tasks/webhooks.yml     # Webhook configuration
└── templates/
    ├── controller/        # Controller deployment, configmap, services, routes, SCC, VDDK
    ├── api/               # API deployment, webhooks, certificates
    ├── validation/        # Validation deployment, configmap
    ├── ui-plugin/         # UI plugin deployment, ConsolePlugin CR
    ├── populator/         # Volume populator controller
    ├── ova-proxy/         # OVA proxy deployment, service, route
    ├── cli-download/      # CLI download server, ConsoleCLIDownload CR
    ├── mcp-server/        # MCP server deployment, service
    ├── monitor/           # ServiceMonitor, PrometheusRules, alerts
    └── smb-csi/           # SMB CSI driver (HyperV)
```

---

## Environment Variable Propagation

Configuration reaches the controller via:

1. **Direct env vars** in Deployment template (feature flags, image refs, tuning)
2. **ConfigMap** (`forklift-controller-config`) mounted as `envFrom`

Go controller loads settings at startup via `pkg/settings.Settings.Load()`:
- `role.go` — `ROLE` (main, inventory)
- `features.go` — `FEATURE_*` flags
- `migration.go` — `MAX_VM_INFLIGHT`, `VIRT_V2V_IMAGE`, `HOOK_RETRY`, `AAP_*`, etc.
- `inventory.go` — API server config
- `policy.go` — Validation policy agent URL
- `metrics.go`, `logging.go`, `profiler.go`, `providers.go`

### Key tuning parameters (CR → env)

| CR field | Env var | Default | Description |
|----------|---------|---------|-------------|
| `controller_max_vm_inflight` | `MAX_VM_INFLIGHT` | 20 | Concurrent VMs per migration |
| `controller_precopy_interval` | `PRECOPY_INTERVAL` | 60 min | Warm migration precopy frequency |
| `controller_vddk_job_active_deadline_sec` | `VDDK_JOB_ACTIVE_DEADLINE` | 300 sec | VDDK validation job timeout |
| `controller_max_concurrent_reconciles` | `MAX_CONCURRENT_RECONCILES` | 10 | Reconcile parallelism |
| `controller_log_level` | `LOG_LEVEL` | 3 | Log verbosity (0–9) |
| `controller_tls_connection_timeout_sec` | `TLS_CONNECTION_TIMEOUT` | 5 sec | TLS handshake timeout |
| `controller_snapshot_removal_timeout_minuts` | `SNAPSHOT_REMOVAL_TIMEOUT_MINUTES` | 120 min | vSphere snapshot removal |
| `controller_windows_reboot_timeout` | `CONTROLLER_WINDOWS_REBOOT_TIMEOUT` | 1800 sec | WaitForGuestReboots timeout |
| `aap_url` | `AAP_URL` | — | Cluster AAP base URL |
| `aap_token_secret_name` | `AAP_TOKEN_SECRET_NAME` | — | AAP token Secret name |
| `aap_timeout` | `AAP_TIMEOUT` | — | Default AAP poll timeout |

---

## OCP vs K8s Differences

Detected by checking for `route.openshift.io` API group:

| Capability | OpenShift | Plain K8s |
|------------|-----------|-----------|
| Routes | Yes | No (Ingress) |
| UI Plugin | Yes | No |
| CLI download | Yes | No |
| MCP server / Lightspeed | Yes (if OLS installed) | No |
| TLS certs | service-serving-cert annotation | cert-manager Issuer/Certificate |
| SCC | Applied | Skipped |
| Monitoring | ServiceMonitor + PrometheusRules | Skipped |
| VDDK BuildConfig/ImageStream | Yes | No |

---

## Streams (Upstream vs Downstream)

| Property | Upstream (Forklift) | Downstream (MTV) |
|----------|-------------------|-----------------|
| CSV name | `forklift-operator` | `mtv-operator` |
| Display name | Forklift Operator | Migration Toolkit for Virtualization Operator |
| Namespace | `konveyor-forklift` | `openshift-mtv` |
| Provider | Konveyor | Red Hat |
| Certified | No | Yes |

---

## Frontend Relevance

- `ForkliftController` CR feature flags control UI-visible behavior:
  - `feature_ui_plugin` — whether this console plugin is deployed
  - `feature_ova_appliance_management` — OVA/HyperV appliance management UI
  - `feature_windows_wait_for_reboot` — `WaitForGuestReboots` pipeline step
  - `feature_copy_offload` — storage map offload plugin availability
  - `feature_mcp_server` — MCP server for AI assistant integration
- AAP settings (`aap_url`, `aap_token_secret_name`) enable cluster-wide AAP hooks without per-hook URL/token.
- Overview settings page reads ForkliftController spec for operator-configurable values.
- Feature flags in `pkg/settings/features.go` gate runtime UI behavior (e.g., warm migration, copy offload, Windows reboot step).
