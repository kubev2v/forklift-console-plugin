<img src="icons/forklift-logo-lightbg.svg" alt="Logo" width="100" />

# OpenShift Console Plugin For Forklift

[![Operator Repository on Quay](https://quay.io/repository/kubev2v/forklift-console-plugin/status "Plugin Repository on Quay")](https://quay.io/repository/kubev2v/forklift-console-plugin)
[![codecov](https://codecov.io/gh/kubev2v/forklift-console-plugin/branch/main/graph/badge.svg?token=NsQ3mmCTNw)](https://codecov.io/gh/kubev2v/forklift-console-plugin)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=kubev2v_forklift-console-plugin&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=kubev2v_forklift-console-plugin)

forklift-console-plugin is an open source project providing [Openshift web console](https://github.com/openshift/console) plugin for [Migration Toolkit for Virtualization](https://github.com/kubev2v/forklift). The plugin adds a web based user interface for [Migration Toolkit for Virtualization](https://github.com/kubev2v/forklift) inside Openshift web console.

Migration Toolkit for Virtualization (Forklift) is a suite of migration tools that facilitate the import of virtualization workloads from [oVirt](https://www.ovirt.org/), vmWare and [OpenStack](https://www.openstack.org/) to [OpenShift Virtualization](https://cloud.redhat.com/learn/topics/virtualization/).

### Prerequisites

* [__Forklift Operator 2.4.0+__](https://github.com/kubev2v/forklift/)
* [__OpenShift Console 4.12+__](https://www.openshift.com/)

## Quick start

forklift-console-plugin is automatically installed when installing the [Forklift operator](https://github.com/kubev2v/forklift/) (ver 2.4+). A user can also install the plugin manually using [Helm](https://helm.sh/) on a cluster with forklift operator already installed.

The folowing script will use [Helm](https://helm.sh/) to install the plugin on Openshift with a running forklift controller:

``` bash
# add the forklift helm repo
helm repo add forklift https://kubev2v.github.io/forklift-console-plugin

# install the chart using the repository package
helm install forklift-console-plugin forklift/forklift-console-plugin \
  --set forklift.namespace=<the forklift operator namespace>
```

forklift-console-plugin will add new menu item under the `virtualization` section for virtualization workloads import in [Openshift web console](https://github.com/openshift/console).

## Development

### Using the development constainer image

Use an Openshift cluster you have admin privileges on, or spin your own [OpenShift Local](https://developers.redhat.com/products/openshift-local) cluster, Install Forklift with console plugin feature turned off.
On your cluster, grant privileged capabilites to the development service account, and deploy the development environment,
if you do not have admin access to an Openshift cluster, you can use [KinD](https://sigs.k8s.io/kind) or [OpenShift Local](https://developers.redhat.com/products/openshift-local) to create a small development cluster on your PC.

``` bash
# deploy the development pod
NAMESPACE=konveyor-forklift
IMAGE=quay.io/kubev2v/forklift-console-plugin-dev
TEMPLATE=https://raw.githubusercontent.com/kubev2v/forklift-console-plugin/main/scripts/yaml/forklift-plugin-dev.tpl.yaml

# give the development service accoun privileged capabilites
oc create namespace ${NAMESPACE}
oc adm policy add-scc-to-user privileged system:serviceaccount:${NAMESPACE}:default

oc process -f ${TEMPLATE} -p=NAMESPACE=${NAMESPACE} -p=IMAGE=${IMAGE} | oc apply -f -
```

You can enable the plugin using the web console, or using an `oc patch` command

``` bash
oc patch consoles.operator.openshift.io cluster \
  --patch '{ "spec": { "plugins": ["forklift-console-plugin"] } }' --type=merge
```

login into the develoment environment using user:dev password: dev.

``` bash
# use the IP of any node in the cluster your network setup can reach
# for example, use crc command to get the crc node ip
HOST=$(crc ip) 
ssh dev@${HOST} -p 30022 # password: dev
```

``` bash
# inside the develpment environment
cd forklift-console-plugin

# add your git remote
# edit the code

# start a develoment server on port 9443
yarn start --port 9443 \
  --server-type https \
  --server-options-key /var/serving-cert/tls.key \
  --server-options-cert /var/serving-cert/tls.crt
```

See [develop-with-crc](https://github.com/kubev2v/forklift-console-plugin/blob/main/docs/develop-with-crc.md) for more information about Forklift plugin development environment on Openshift.

Alternatively, see [develop-with-kind](https://github.com/kubev2v/forklift-console-plugin/blob/main/docs/develop-with-kind.md) for more information about Forklift plugin development environment on kubernetes cluster deployed using KinD.

## Development on local PC

### Requirements

forklift-console-plugin development require web development tools, and a kubernetes or Openshift cluster. You can use any available [Openshift](https://www.openshift.com/) cluster, or deploy your own small development cluster on your local PC, using [OpenShift Local](https://developers.redhat.com/products/openshift-local) or [KinD](https://sigs.k8s.io/kind).

| requirements        |     |
|---|----|
| [nodejs](https://nodejs.org/) | JavaScript runtime environment |
| [yarn](https://yarnpkg.com/) | package manager for nodejs |
| [kubernetes]() | An [Openshift]((https://www.openshift.com/)) or kubernetes cluster for development |
| [kubectl](https://kubernetes.io/docs/tasks/tools/) | The Kubernetes command-line tool |

Mock data is avaliable for development without needing to use forklift API servers, it is also posible to use the forklift API servers for development. you can install forklift and kubevirt operators if you want to interact with these APIs.

| optional        |     |
|---|----|
| [oc](https://mirror.openshift.com/pub/openshift-v4/x86_64/clients/oc/latest/) | The Openshift command-line tool |
| [forklift](https://github.com/kubev2v/forklift/) | forklift controller running on the development cluster |
| [kubevirt](https://kubevirt.io/) | kubevirtcontroller running on the development cluster |

### Spin your own small kubernetes

It is posible to create a small Openshift environment using [OpenShift Local](https://developers.redhat.com/products/openshift-local) or [KinD](https://sigs.k8s.io/kind). Openshift local will install all the neccary services. When installing a cluster using KinD, you may want to setup a custom development enviormnet manually.

This example script is using [KinD](https://sigs.k8s.io/kind) to deploy a minimal kubernetes cluster with storage, registry and admin user.

``` bash
# deploy small local kubernetes cluster using kind command line utility
bash scripts/deploy-cluster.sh

# delete the cluster and local registry, this script will remove any
# workload or data currenly in the local cluster or the local registry
# this script may be usufull for development when starting a new session
bash scripts/clean-cluster.sh
```

Note:
Running virtualized workloads (e.g. virtual machines) on this cluster requires starting the cluster using the root user (e.g. `sudo bash scripts/deploy-cluster.sh`)

See [cli docs](https://github.com/kubev2v/forklift-console-plugin/blob/main/docs/cli-tools.md) for more information about Openshift local and Kind.

### Running development server on local PC using mock data

In one terminal window, run:

1. `yarn install`
2. `DATA_SOURCE=mock yarn start`

This will install the node modules needed for development and start the plugin development server,
the `start` script uses this environment varialbles:

| Environment varialbles | Description |
| --------------------|-------------|
| DATA_SOURCE         | 'mock' or 'remote', when set to 'mock', the plugin will show recorded data, (default 'remote') |
| BRAND_TYPE          | 'RedHat' or 'Konveyor', when set to 'RedHat' some strings will change to reflect downstream product names, (default 'Konveyor') |

Make sure you are connected to your kubernetes cluster and in another terminal window, run:

1. `yarn run start:console`

[ Optional, if running using Openshift cluster you can use `yarn run start:console:oauth`, this command will run the Openshift console using the clusters oAuth server. ]

This will run the OpenShift console in a container connected to the cluster you are currently logged into. The plugin HTTP server runs on port 9001 with CORS enabled, the development server will be available at http://localhost:9000

`start:console` script uses this environment varialbles:

| Environment varialbles | Description  |
| -------|--------------|
| CONSOLE_IMAGE | The console image to run ( default `quay.io/openshift/origin-console:latest` )|
| CONSOLE_PORT | Expose the console web application on port ( default `9000` )|
| INVENTORY_SERVER_HOST | URL of Forklift inventory server ( default `http://localhost:30088` )|
| MUST_GATHER_API_SERVER_HOST | URL of Forklift must gather server ( default `http://localhost:30089` )|
| BRIDGE_K8S_AUTH_BEARER_TOKEN | Bearer token of user account ( on openshift token default to `$(oc whoami -t)` )|
| BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT | Kubernetes API servere URL (default, guess useing kubeconfig file) |

Note:
when running the plugin on a cluster with no forklift install, you can install only the missing CRDs using this command:

``` bash
kubectl apply -f scripts/yaml/crds
```

### Running development server on local PC using remote forklift API server

When running [OpenShift Local](https://developers.redhat.com/products/openshift-local) you can install forklift and kubevirt using 
the OperatorHub, on [KinD](https://sigs.k8s.io/kind) you can use the [CI scripts](https://github.com/kubev2v/forklift-console-plugin/tree/main/scripts).

Before starting the development server, set the inventory and must-gather hosts to match the forklift API servers, for example:

``` bash
# example of using forklift API running inside our Openshift cluster (using the oc command line utility)
export BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT:=$(oc whoami --show-server)
export BRIDGE_K8S_AUTH_BEARER_TOKEN=$(oc whoami --show-token)
export INVENTORY_SERVER_HOST=https://$(oc get routes -o custom-columns=HOST:.spec.host -A | grep 'forklift-inventory' | head -n 1)
export MUST_GATHER_API_SERVER_HOST=https://$(oc get routes -o custom-columns=HOST:.spec.host -A | grep 'forklift-mustgather' | head -n 1)

# start the openshift web console using Openshift oAuth server
# NOTE:
# when using forklift API server with authentication feature turned on
# we need to run the development server using openshift oauth service
yarn start:console:oauth

# start the forklift console plugin (default is DATA_SOURCE=remote)
yarn start
```

For more information about plugin development options, see the [forklift-console-plugin docs](https://github.com/kubev2v/forklift-console-plugin/tree/main/docs).

## Learn more

| Reference |  |
|---|----|
| [Forklift](https://github.com/kubev2v/forklift/) | Migration toolkit for virtualization |
| [Openshift web console](https://github.com/openshift/console) | Openshift web console is a web based user interface for Openshift. |
| [OpenShift Dynamic Plugin SDK](https://github.com/openshift/dynamic-plugin-sdk) | Dynamic plugin SDK for Openshift user interfaces. |
| [Forklift documentation](https://github.com/kubev2v/forklift-documentation) | Usage documentation for the migration toolkit for viertualization. |
| [Forklict CI](https://github.com/kubev2v/forkliftci) | Collection of scripts and tools used in forklict development. |
| [Patternfly](https://www.patternfly.org/) | Open source design system used for Openshift user interfaces development. |
