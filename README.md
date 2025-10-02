<img src="docs/icons/forklift-logo-lightbg.svg" alt="Logo" width="100" />

# OpenShift Console Plugin For Forklift

[![CI Workflow](https://github.com/kubev2v/forklift-console-plugin/actions/workflows/on-push-main.yaml/badge.svg)](https://quay.io/repository/kubev2v/forklift-console-plugin)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=kubev2v_forklift-console-plugin&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=kubev2v_forklift-console-plugin)

forklift-console-plugin is an open source project providing [Openshift web console](https://github.com/openshift/console) plugin for [Migration Toolkit for Virtualization](https://github.com/kubev2v/forklift). The plugin adds a web based user interface for Migration Toolkit for Virtualization inside Openshift web console.

Migration Toolkit for Virtualization (Forklift) is a suite of migration tools that facilitate the import of virtualization workloads from [oVirt](https://www.ovirt.org/), VMware and [OpenStack](https://www.openstack.org/) to [OpenShift Virtualization](https://github.com/kubevirt).

Forklift console plugin is managed by Migration Toolkit for Virtualization operator, when installing the operator on Openshift cluster, the plugin will be installed automatically, and the Migration menu item will be added to the Openshift web console.

### Prerequisites

- [**Forklift Operator**](https://github.com/kubev2v/forklift/)
- [**OpenShift Console**](https://github.com/openshift/console/)

## Installation

To get started, clone the repo to your development workstation and install the required dependencies locally with yarn.

```bash
git clone https://github.com/kubev2v/forklift-console-plugin.git
cd forklift-console-plugin
yarn install
```

## Quick start

With a user logged in to existing Kubernetes or Openshift environment with Forklift operator available, one can start a locally served forklift-console-plugin instance ( running on http://localhost:9000 ) with:

```bash
# Start a local Openshift console server on the background.
# - The console will be available in http://localhost:9000
# - The inventory URL can be set using an environment variable,
#   ( default value for INVENTORY_SERVER_HOST is https://localhost:30444 )
#   for example:
#     export INVENTORY_SERVER_HOST=https://virt-konveyor-forklift.apps.example.com
# - To close the console server run:
#   yarn console:stop

# Setting the console image and forklift service URLs as environment variables:
#
# Note: default values works with the local development cluster, you can create using the CI.
#       set this variables if you use a different cluster.
export INVENTORY_SERVER_HOST=https://virt-konveyor-forklift.apps.<your cluster address>
export SERVICES_API_SERVER_HOST=https://virt-konveyor-forklift.apps.<your cluster address>
export CONSOLE_IMAGE=quay.io/openshift/origin-console:4.18

# Run the web console locally (uses the environment variables we defined above)
yarn console

# If this is the first time running, yarn build will build the required dependencies
yarn build

# Start the plugin in development mode
yarn start
```

#### How to find the cluster address

The cluster address will be the part of the address after the `apps.` or `api.` in the cluster services or API service address.

For example, if your cluster API address is `api.example.com:6443`, the cluster address will be `example.com`, and
the inventory service address will be:

```bash
export INVENTORY_SERVER_HOST=https://virt-konveyor-forklift.apps.example.com
```

Note: use this method to find the inventory and services address when using an Openshift cluster, when using K8s use the inventory service address.

## Setup a local cluster for development

Forklift console plugin requires the user to be logged into an openshift or kubernetes cluster, if you do not have access to one, you can setup your own using [Openshift local](https://developers.redhat.com/products/openshift-local/overview) or use the CI script to build a local [KinD](https://sigs.k8s.io/kind) cluster.

```bash
# Setup a kind cluster with Forklift operator and an OKD web console
yarn cluster:up

# Example: setup a local KinD cluster with ovirt mock provider
#          [ options: --with-all-providers --with-ovirt-provider, --with-vmware-provider, --with-openstack-provider]
#
# Note I:  mock providers requires forkliftci, clone on the ci directory
# Note II: mock providers requires NFS server running, look at forkliftci documentation for more details.
#          See: forkliftci/cluster/providers/utils/install_nfs.sh
git clone git@github.com:kubev2v/forkliftci.git ./ci/forkliftci
yarn cluster:up -- --with-ovirt-provider

# run cleanup to stop and delete the cluster.
yarn cluster:delete
```

## Development

### Commit Message Format

All commits must include one of these formats in the **commit description** (the body of the commit message):

**Primary format**: `Resolves: MTV-<number>`

Example commit:
```
Subject: Fix bug in data processing
Description: Resolves: MTV-123
```

**Exclusion format**: `Resolves: None`

Example commit:
```
Subject: Update documentation
Description: Resolves: None
```

**Chore commits**: Any commit containing "chore" in the message (case insensitive) is automatically skipped.

Example chore commits:
```
chore: update dependencies
CHORE: clean up build files
Update dependencies and chore tasks
```

**Note**: The commit description validation is enforced via a GitHub Action that runs on all branches for push and pull request events. The validation automatically skips:
- Bot users (dependabot, renovate, ci, github-actions, etc.)
- Commits containing "chore" in the message (case insensitive)

### Local Validation

You can validate commit messages locally using the provided script or yarn commands:

**Using yarn commands:**
```bash
# Validate the latest commit
yarn validate-commits

# Validate a range of commits
yarn validate-commits-range "HEAD~5..HEAD"
```

**Using the script directly:**
```bash
# Validate the latest commit
./scripts/validate-commits.sh

# Validate a range of commits
./scripts/validate-commits.sh --range HEAD~5..HEAD

# Validate with verbose output
./scripts/validate-commits.sh --verbose

# Get help
./scripts/validate-commits.sh --help
```

### Detailed Commit Message Guide

For comprehensive information about commit message formatting, supported issue tracking systems, and troubleshooting, see [COMMIT_MESSAGE_GUIDE.md](./COMMIT_MESSAGE_GUIDE.md).

## Learn more

More documentation is available in the [docs](./docs) directory.

| Reference                                                                       |                                                                           |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [Forklift](https://github.com/kubev2v/forklift/)                                | Migration toolkit for virtualization                                      |
| [Openshift web console](https://github.com/openshift/console)                   | Openshift web console is a web based user interface for Openshift.        |
| [OpenShift Dynamic Plugin SDK](https://github.com/openshift/dynamic-plugin-sdk) | Dynamic plugin SDK for Openshift user interfaces.                         |
| [Forklift documentation](https://github.com/kubev2v/forklift-documentation)     | Usage documentation for the migration toolkit for virtualization.         |
| [Forklift CI](https://github.com/kubev2v/forkliftci)                            | Collection of scripts and tools used in forklift development.             |
| [Patternfly](https://www.patternfly.org/)                                       | Open source design system used for Openshift user interfaces development. |
