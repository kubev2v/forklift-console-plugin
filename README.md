<img src="docs/icons/forklift-logo-lightbg.svg" alt="Logo" width="100" />

# OpenShift Console Plugin For Forklift

[![CI Workflow](https://github.com/kubev2v/forklift-console-plugin/actions/workflows/on-push-main.yaml/badge.svg)](https://quay.io/repository/kubev2v/forklift-console-plugin)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=kubev2v_forklift-console-plugin&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=kubev2v_forklift-console-plugin)

Forklift Console Plugin is an [OpenShift Console](https://github.com/openshift/console) dynamic plugin that provides the web UI for [Migration Toolkit for Virtualization](https://github.com/kubev2v/forklift) (Forklift). It enables migrating virtual machines from VMware vSphere, oVirt/RHV, OpenStack, Hyper-V, OVA files, and AWS EC2 to [OpenShift Virtualization](https://github.com/kubevirt) (KubeVirt).

The Forklift Operator manages this plugin automatically -- installing the operator on an OpenShift cluster deploys the plugin and adds the **Migration for Virtualization** section to the console.

## Architecture Overview

The plugin runs inside OpenShift Console and communicates with the Kubernetes API and Forklift Inventory Service. Built with React 17, TypeScript, and PatternFly 6.

```text
Source Providers  ──►  Plan (NetworkMap + StorageMap)  ──►  Migration  ──►  VMs on OpenShift
(vSphere, oVirt,       (selects VMs, defines mappings)      (transfers      (KubeVirt
 OpenStack, etc.)                                            disks/config)   VirtualMachines)
```

For detailed architecture documentation, see [docs/architecture.md](docs/architecture.md).

## Prerequisites

- [**Forklift Operator**](https://github.com/kubev2v/forklift/) installed on an OpenShift cluster
- [**OpenShift Console**](https://github.com/openshift/console/) (v4.19+)
- **Node.js** 20+ and **npm** for local development

## Quick Start

Clone the repo and install dependencies:

```bash
git clone https://github.com/kubev2v/forklift-console-plugin.git
cd forklift-console-plugin
npm install
```

With a user logged in to an OpenShift cluster with the Forklift Operator available:

```bash
# Set environment variables for your cluster
export INVENTORY_SERVER_HOST=https://virt-konveyor-forklift.apps.<your-cluster-address>
export SERVICES_API_SERVER_HOST=https://virt-konveyor-forklift.apps.<your-cluster-address>
export CONSOLE_IMAGE=quay.io/openshift/origin-console:4.19

# Start the local console server (serves at http://localhost:9000)
npm run console

# Build the plugin (required on first run)
npm run build

# Start the plugin dev server with hot reload
npm start
```

To stop the console: `npm run console:stop`

### Loading Additional Console Plugins

The console startup script supports loading additional OpenShift console plugins alongside Forklift. This is useful for features that depend on other plugins (e.g., Prometheus metrics require the monitoring plugin) or for testing the full console experience locally.

Available plugins:

| Plugin | Port | Repository |
|--------|------|------------|
| `monitoring-plugin` | 9002 | [openshift/monitoring-plugin](https://github.com/openshift/monitoring-plugin) |
| `networking-console-plugin` | 9003 | [openshift/networking-console-plugin](https://github.com/openshift/networking-console-plugin) |
| `nmstate-console-plugin` | 9004 | [openshift/nmstate-console-plugin](https://github.com/openshift/nmstate-console-plugin) |
| `kubevirt-plugin` | 9005 | [kubevirt-ui/kubevirt-plugin](https://github.com/kubevirt-ui/kubevirt-plugin) |

```bash
npm run console -- --plugins monitoring-plugin          # single plugin
npm run console -- --plugins monitoring-plugin,kubevirt-plugin  # multiple
npm run console -- --plugins all                        # all plugins
npm run console -- --auth --plugins monitoring-plugin   # with OAuth
bash ./ci/start-console.sh --help                       # all options
```

Plugins are automatically cloned to sibling directories, dependencies installed, and dev servers started. On subsequent runs, existing clones are updated with `git pull`.

### Finding the Cluster Address

The cluster address is the part after `apps.` or `api.` in the cluster URL. For example, if your cluster API address is `api.example.com:6443`, the cluster address is `example.com`, and:

```bash
export INVENTORY_SERVER_HOST=https://virt-konveyor-forklift.apps.example.com
```

## Local Development Cluster

If you don't have access to an OpenShift cluster, you can set up a local [KinD](https://sigs.k8s.io/kind) cluster with the CI scripts:

```bash
# Setup a KinD cluster with Forklift operator and OKD console
npm run cluster:up

# With a mock provider (requires forkliftci)
git clone git@github.com:kubev2v/forkliftci.git ./ci/forkliftci
npm run cluster:up -- --with-ovirt-provider

# Cleanup
npm run cluster:delete
```

Options: `--with-all-providers`, `--with-ovirt-provider`, `--with-vmware-provider`, `--with-openstack-provider`. Mock providers require an NFS server -- see [forkliftci documentation](https://github.com/kubev2v/forkliftci) for details.

## Development Commands

```bash
npm install            # install dependencies
npm start              # dev server with hot reload
npm run build          # production build
npm run lint           # check linting (ESLint + Stylelint)
npm run lint:fix       # auto-fix linting issues
npm test               # run unit tests (Jest)
npm run test:coverage  # unit tests with coverage
npm run test:e2e       # run E2E tests (Playwright)
npm run i18n           # extract translation keys
npm run knip           # detect unused exports/deps
```

## Commit Message Format

All commits must be **signed off** (`git commit -s`) and include a `Resolves:` line. See [COMMIT_MESSAGE_GUIDE.md](COMMIT_MESSAGE_GUIDE.md) for the full specification.

```bash
npm run validate-commits                        # validate latest commit
npm run validate-commits-range "HEAD~5..HEAD"   # validate a range
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for coding standards, PR process, branching strategy, and testing guidelines.

## Learn More

| Resource | Description |
|---|---|
| [docs/architecture.md](docs/architecture.md) | System architecture and CRD relationships |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines |
| [AGENTS.md](AGENTS.md) | AI assistant and coding conventions |
| [COMMIT_MESSAGE_GUIDE.md](COMMIT_MESSAGE_GUIDE.md) | Commit message format specification |
| [docs/](docs/) | Additional development documentation |

| External Reference | |
|---|---|
| [Forklift](https://github.com/kubev2v/forklift/) | Migration toolkit for virtualization |
| [OpenShift Console](https://github.com/openshift/console) | OpenShift web console |
| [OpenShift Dynamic Plugin SDK](https://github.com/openshift/dynamic-plugin-sdk) | Dynamic plugin SDK |
| [Forklift Documentation](https://github.com/kubev2v/forklift-documentation) | Usage documentation |
| [Forklift CI](https://github.com/kubev2v/forkliftci) | CI scripts and tools |
| [PatternFly](https://www.patternfly.org/) | Design system for OpenShift UIs |
