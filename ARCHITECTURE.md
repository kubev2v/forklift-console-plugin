# Architecture

This document describes the architecture of the Forklift Console Plugin -- an [OpenShift Console dynamic plugin](https://github.com/openshift/console) that provides the web UI for [Forklift](https://github.com/kubev2v/forklift) (Migration Toolkit for Virtualization).

For coding standards and conventions, see [AGENTS.md](AGENTS.md). For the full directory layout and file organization rules, see [AGENTS.md - File Organization](AGENTS.md#file-organization).

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

## Core CRDs and Migration Flow

For CRD resource relationships, the migration flow diagram, and detailed CRD descriptions, see [docs/architecture.md](docs/architecture.md#core-crds).

In summary: Provider, Plan, Migration, NetworkMap, StorageMap, Hook, Host, and ForkliftController CRDs belong to API group `forklift.konveyor.io/v1beta1`. TypeScript types are provided by `@forklift-ui/types`. A migration creates a Plan referencing NetworkMap and StorageMap, which spawns a Migration resource that transfers disks via DataVolumes.

## Key Architectural Patterns

### Kubernetes Resource Interaction

The plugin uses the [Console Dynamic Plugin SDK](https://github.com/openshift/dynamic-plugin-sdk) for all Kubernetes operations:

- **Watching resources**: `useK8sWatchResource` hook with GVK constants (`ProviderModelGroupVersionKind`, `PlanModelGroupVersionKind`, etc.)
- **CRUD operations**: `k8sCreate`, `k8sUpdate`, `k8sPatch`, `k8sDelete` from the SDK
- **Resource references**: GVK constants defined per CRD type

### State Management

No global store (Redux, etc.). State flows through:

- Kubernetes watch subscriptions (live cluster state)
- React component state and hooks
- URL parameters for navigation context
- react-hook-form for form state in wizards

### Feature Module Structure

Each feature (providers, plans, networkMaps, storageMaps, overview) is self-contained with its own components, hooks, and utils. A typical feature module contains:

```text
src/{feature}/
├── dynamic-plugin.ts          # Console extension and module registration
├── components/                # Feature-specific React components
├── hooks/                     # Feature-specific custom hooks
├── utils/                     # Feature-specific utilities and types
├── create/                    # Creation flows (wizards, forms)
└── details/                   # Detail view sub-pages
    └── components/
```

Each feature registers its pages and navigation items through `dynamic-plugin.ts`, which exports `extensions` (console extensions array) and `exposedModules` (lazy-loaded component map).

### Dependency Flow

For the authoritative dependency flow rules and import constraints, see [AGENTS.md - Dependency Flow](AGENTS.md#dependency-flow-critical).

## Build and Deploy Pipeline

### PR Workflow

Every pull request triggers these CI checks:

| Check | What it runs |
|---|---|
| Linters | `npm run lint`, `npm run test:i18n`, `npm run knip` |
| Build | `npm run build` |
| Tests + Coverage | `npm run test:coverage` (uploaded to Codecov) |
| E2E | Playwright upstream tests against a KinD cluster |
| Commit validation | Validates `Resolves:` line format |

### Container Build

The container uses a two-stage build:

1. **Builder stage** -- UBI 9 Node.js image compiles the plugin
2. **Runtime stage** -- UBI 9 Nginx image serves the built assets

### Image Destinations

- **Merge to `main`** -- pushes `quay.io/kubev2v/forklift-console-plugin:latest`
- **Push to `release-vX.Y.Z`** -- pushes tagged image `quay.io/kubev2v/forklift-console-plugin:release-vX.Y.Z`

### Deployment

The Forklift Operator manages the plugin Deployment, Service, and `ConsolePlugin` resource on the cluster. No manual deployment is needed after the operator is installed.

## Release Strategy

Development happens on `main`. Release branches follow the pattern `release-X.Y` (e.g., `release-2.11`). Active release branches receive cherry-picks from `main` using the `/backport release-X.Y` comment command. Z-stream versions are bumped via `release.conf`.

Konflux references (build pipeline metadata) are managed by automated bot PRs.
