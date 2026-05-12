# Architecture

This document describes the architecture of the Forklift Console Plugin -- an [OpenShift Console dynamic plugin](https://github.com/openshift/console) that provides the web UI for [Forklift](https://github.com/kubev2v/forklift) (Migration Toolkit for Virtualization).

## System Context

Forklift migrates virtual machines from external virtualization platforms to [OpenShift Virtualization](https://github.com/kubevirt) (KubeVirt). The ecosystem has three main components:

```text
┌──────────────────────────────────────────────────────────────────┐
│                     OpenShift Cluster                             │
│                                                                  │
│  ┌──────────────────┐   ┌──────────────────┐                    │
│  │  OpenShift        │   │  Forklift         │                    │
│  │  Console          │   │  Operator         │                    │
│  │  ┌──────────────┐ │   │  ┌──────────────┐ │                    │
│  │  │ Forklift     │◄├───┤► │ Controller   │ │                    │
│  │  │ Console      │ │   │  │ (Go)         │ │                    │
│  │  │ Plugin       │ │   │  └──────┬───────┘ │                    │
│  │  │ (this repo)  │ │   │         │         │                    │
│  │  └──────────────┘ │   │  ┌──────▼───────┐ │                    │
│  │                    │   │  │ Inventory    │ │                    │
│  └──────────────────┘   │  │ Service      │ │                    │
│                          │  └──────────────┘ │                    │
│                          └──────────────────┘                    │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐     │
│  │  KubeVirt       │  │  CDI            │  │  Multus         │     │
│  │  (target VMs)   │  │  (disk import)  │  │  (networking)   │     │
│  └────────────────┘  └────────────────┘  └────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
         ▲                    ▲                    ▲
         │                    │                    │
    ┌────┴──────┐   ┌────────┴──────┐   ┌────────┴──────┐
    │  VMware    │   │  oVirt / RHV   │   │  OpenStack     │
    │  vSphere   │   │                │   │                │
    └───────────┘   └───────────────┘   └───────────────┘
```

- **Forklift Console Plugin** (this repo) -- React/TypeScript UI running inside OpenShift Console. Communicates with the Kubernetes API and Forklift Inventory Service.
- **Forklift Operator** ([kubev2v/forklift](https://github.com/kubev2v/forklift)) -- Go controllers that reconcile CRDs and orchestrate the migration. Includes the Inventory Service that discovers source provider resources.
- **OpenShift Console** -- the host application. Loads this plugin dynamically via the [Dynamic Plugin SDK](https://github.com/openshift/dynamic-plugin-sdk).

## Plugin Architecture

The plugin registers itself with OpenShift Console through two entry points:

- `plugin-metadata.ts` -- declares the plugin name, version, and exposed modules
- `plugin-extensions.ts` -- registers navigation sections, pages, and other console extensions

Console loads the plugin at runtime from a container image (`quay.io/kubev2v/forklift-console-plugin`) served by an Nginx web server. The Forklift Operator manages the plugin deployment and `ConsolePlugin` resource automatically.

### Technology Stack

| Layer | Technology |
|---|---|
| UI framework | React 17, TypeScript (strict mode) |
| Component library | PatternFly 6 |
| Forms | react-hook-form |
| Internationalization | react-i18next |
| State management | React hooks + Kubernetes watch subscriptions |
| Bundler | Webpack |
| Unit testing | Jest + Testing Library |
| E2E testing | Playwright |
| Container | UBI 9 + Nginx |

## Core CRDs

All Forklift CRDs belong to API group `forklift.konveyor.io`, version `v1beta1`. TypeScript types are provided by the `@forklift-ui/types` package.

### Resource Relationships

```text
                    ┌─────────────┐
                    │  Provider    │
                    │  (source)    │
                    └──────┬──────┘
                           │ inventory discovery
                           ▼
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│ NetworkMap   │◄───│    Plan       │───►│ StorageMap   │
└─────────────┘    └──────┬───────┘    └─────────────┘
                          │ start
                          ▼
                   ┌──────────────┐
                   │  Migration    │
                   └──────┬───────┘
                          │ creates
                          ▼
                   ┌──────────────┐
                   │  Pods, Jobs,  │
                   │  DataVolumes, │
                   │  PVCs         │
                   └──────┬───────┘
                          │ result
                          ▼
                   ┌──────────────┐
                   │  Provider     │
                   │  (target:     │
                   │   openshift)  │
                   └──────────────┘
```

| CRD | Purpose |
|---|---|
| **Provider** | Source or target infrastructure connection. Source types: `vsphere`, `ovirt`, `openstack`, `ova`, `hyperv`, `ec2`. Target type: `openshift`. |
| **Plan** | Migration plan selecting VMs and referencing mappings. Supports Cold, Warm, Live, and Conversion migration types. |
| **Migration** | Active migration execution created when a Plan starts. Tracks per-VM status. |
| **NetworkMap** | Maps source networks to target networks. Referenced by Plans. |
| **StorageMap** | Maps source storage to target storage. Referenced by Plans. Supports copy-offload plugins. |
| **Hook** | Pre/post migration scripts executed as containers. |
| **Host** | ESXi hosts for direct disk transfer with vSphere providers. |
| **ForkliftController** | Operator configuration resource. Controls feature flags: `feature_copy_offload`, `feature_ocp_live_migration`, `feature_volume_populator`. |

## Migration Flow

1. Connect **source** and **target** Providers (credentials, inventory discovery)
2. Create a **NetworkMap** and **StorageMap** for the migration
3. Create a **Plan** selecting VMs and referencing the mappings
4. Start the Plan, which creates a **Migration** resource
5. Migration creates worker Pods/Jobs that transfer disks via DataVolumes
6. VMs are created on the target OpenShift cluster as KubeVirt VirtualMachine resources

## Source Directory Structure

For the full directory layout and conventions, see [AGENTS.md](../AGENTS.md#file-organization).

The plugin organizes code by feature domain, with shared code in `components/` and `utils/`:

```text
src/
├── providers/       # Provider CRUD, details, inventory
├── plans/           # Plan CRUD, wizard, details, migration management
├── networkMaps/     # Network mapping management
├── storageMaps/     # Storage mapping management
├── overview/        # Dashboard and overview pages
├── onlineHelp/      # In-app help and quickstarts
├── components/      # Shared/reusable UI components
├── utils/           # Shared utilities, hooks, CRD helpers
└── test-utils/      # Testing utilities
```

### Dependency Flow

Shared code (`components/`, `utils/`) must **never** import from feature-specific code. The dependency direction is always:

```text
Feature code  →  Shared code  →  External libraries
```

### Feature Module Structure

A typical feature module (e.g., `providers/`) contains:

```text
src/providers/
├── dynamic-plugin.ts          # Console extension and module registration
├── components/                # Feature-specific React components
├── hooks/                     # Feature-specific custom hooks
├── utils/                     # Feature-specific utilities and types
└── details/                   # Detail view sub-pages
    └── components/
```

Each feature registers its pages and navigation items through `dynamic-plugin.ts`, which exports `extensions` (console extensions array) and `exposedModules` (lazy-loaded component map).

## Key Patterns

### Kubernetes Resource Interaction

The plugin uses the [Console Dynamic Plugin SDK](https://github.com/openshift/dynamic-plugin-sdk) for all Kubernetes operations:

- **Watching resources**: `useK8sWatchResource` hook with GVK (GroupVersionKind) constants like `ProviderModelGroupVersionKind`, `PlanModelGroupVersionKind`
- **CRUD operations**: `k8sCreate`, `k8sUpdate`, `k8sPatch`, `k8sDelete` from the SDK
- **Resource references**: GVK constants defined per CRD type

### State Management

No global store (Redux, etc.). State flows through:

- Kubernetes watch subscriptions (live cluster state)
- React component state and hooks
- URL parameters for navigation context
- react-hook-form for form state

### Build and Deploy Pipeline

- **PR**: lint, build, test, E2E (upstream Playwright against KinD)
- **Merge to `main`**: build and push container image to `quay.io/kubev2v/forklift-console-plugin:latest`
- **Push to `release-vX.Y.Z`**: build and push tagged image to `quay.io/kubev2v/forklift-console-plugin:release-vX.Y.Z`
- **Container**: two-stage build (UBI 9 Node.js builder + UBI 9 Nginx server)
- **Deployment**: the Forklift Operator manages the plugin Deployment, Service, and ConsolePlugin resource on the cluster
