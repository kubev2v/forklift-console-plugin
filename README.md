<img src="icons/forklift-logo-lightbg.svg" alt="Logo" width="100" />

# OpenShift Console Plugin For Forklift

[![Operator Repository on Quay](https://quay.io/repository/kubev2v/forklift-console-plugin/status "Plugin Repository on Quay")](https://quay.io/repository/kubev2v/forklift-console-plugin)
[![codecov](https://codecov.io/gh/kubev2v/forklift-console-plugin/branch/main/graph/badge.svg?token=NsQ3mmCTNw)](https://codecov.io/gh/kubev2v/forklift-console-plugin)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=kubev2v_forklift-console-plugin&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=kubev2v_forklift-console-plugin)

forklift-console-plugin is an [Openshift web console](https://github.com/openshift/console) plugin using [OpenShift Dynamic Plugin SDK](https://github.com/openshift/dynamic-plugin-sdk) providing a web based user interface for [kubevirt migration toolkit](https://github.com/kubev2v/forklift)

[kubevirt migration toolkit](https://github.com/kubev2v/forklift) (Forklift) is a suite of migration tools that facilitate the import of virtualization workloads to [OpenShift Virtualization](https://cloud.redhat.com/learn/topics/virtualization/).

## Prerequisites

* [__Forklift Operator 2.4.0+__](https://github.com/kubev2v/forklift/)
* [__OpenShift Console 4.12+__](https://www.openshift.com/)

## Quick start

forklift-console-plugin is automatically installed when installing the [Forklift operator](https://github.com/kubev2v/forklift/). A user can also install the plugin manually using [Helm](https://helm.sh/) on a cluster with forklift operator already installed.

When forklift-console-plugin is installed, [Openshift web console](https://github.com/openshift/console) will add new menu item under the `virtualization` secition for virtualization workloads import.

The folowing script will use [Helm](https://helm.sh/) to install the plugin on a cluster running forklift controller:

``` bash
# add the forklift helm repo
helm repo add forklift https://kubev2v.github.io/forklift-console-plugin

# install the chart using the repository package
helm install forklift-console-plugin forklift/forklift-console-plugin \
  --set forklift.namespace=<the forklift operator namespace>
```

For more information about forklift-console-plugin deployment, see the [forklift-console-plugin docs](https://github.com/kubev2v/forklift-console-plugin/tree/main/docs).

## Requirements

forklift-console-plugin development require web development tools, and a kubernetes or Openshift cluster. You can use any available [Openshift](https://www.openshift.com/) cluster, or deploy your own small development cluster on your local PC, using [OpenShift Local](https://developers.redhat.com/products/openshift-local) or [KinD](https://sigs.k8s.io/kind).

| requirements        |     |
|---|----|
| nodejs | JavaScript runtime environment |
| yarn | package manager for nodejs |
| kubernetes | An [Openshift]((https://www.openshift.com/)) or kubernetes cluster for development |

| optional        |     |
|---|----|
| kubectl | The Kubernetes command-line tool |
| forklift | [forklift](https://github.com/kubev2v/forklift/) controller running on the development cluster |
| kubevirt | [kubevirt](https://kubevirt.io/) controller running on the development cluster |

For more information about forklift-console-plugin deployment enviorment, see the [forklift-console-plugin docs](https://github.com/kubev2v/forklift-console-plugin/tree/main/docs).

### Spin your own small kubernetes

This example script is using [KinD](https://sigs.k8s.io/kind) to deploy a minimal kubernetes cluster for local development.

Before running the cluster deployment script, make sure `kind` command line urility is installed on your path, see [cli docs](https://github.com/kubev2v/forklift-console-plugin/blob/main/docs/cli-tools.md) for more information.

```bash
# deploy small local kubernetes cluster using kind command line utility
bash scripts/deploy-cluster.sh

# delete the cluster and local registry, this script will remove any
# workload or data currenly in the local cluster or the local registry
# this script may be usufull for development when starting a new session
#bash scripts/clean-cluster.sh
```

For more information about spinning a local development cluster, see the [forklift-console-plugin docs](https://github.com/kubev2v/forklift-console-plugin/tree/main/docs).

### Development

Using forklift console plugin code.

In one terminal window, run:

1. `yarn install`
2. `DATA_SOURCE=mock yarn start`

This will install the node modules needed for development and start the plugin development server.

| Enviorment varialbles | Description |
| --------------------|-------------|
| DATA_SOURCE         | 'mock' or 'remote', when set to 'mock', the plugin will show recorded data, (default 'remote') |
| BRAND_TYPE          | 'RedHat' or 'Konveyor', when set to 'RedHat' some strings will change to reflect downstream product names, (default 'Konveyor') |

When running with Openshift, in another terminal window, run:

1. `yarn run start:console`

Or, if running a kubernetes cluster run:

1. `yarn run start:console:k8s`

This will run the OpenShift console in a container connected to the cluster you are currently logged into. The plugin HTTP server runs on port 9001 with CORS enabled.

The development server will be available at http://localhost:9000

| Enviorment varialbles | Description  |
| -------|--------------|
| CONSOLE_IMAGE | The console image to run ( default `quay.io/openshift/origin-console:latest` )|
| CONSOLE_PORT | Expose the console web application on port ( default `9000` )|
| INVENTORY_SERVER_HOST | URL of Forklift inventory server ( default `http://localhost:8080` )|
| MUST_GATHER_API_SERVER_HOST | URL of Forklift must gather server ( default `http://localhost:8090` )|
| BRIDGE_K8S_AUTH_BEARER_TOKEN | Bearer token of user account ( on openshift token default to `$(oc whoami -t)` )|

For more information about plugin development options, see the [forklift-console-plugin docs](https://github.com/kubev2v/forklift-console-plugin/tree/main/docs).
