<img src="icons/forklift-logo-lightbg.svg" alt="Logo" width="100" />

# OpenShift Console Plugin For Forklift

[![Operator Repository on Quay](https://quay.io/repository/kubevirt-ui/forklift-console-plugin/status "Plugin Repository on Quay")](https://quay.io/repository/kubevirt-ui/forklift-console-plugin)
[![codecov](https://codecov.io/gh/kubev2v/forklift-console-plugin/branch/main/graph/badge.svg?token=NsQ3mmCTNw)](https://codecov.io/gh/kubev2v/forklift-console-plugin)

Forklift is a suite of migration tools that facilitate the migration of VM workloads to [OpenShift Virtualization](https://cloud.redhat.com/learn/topics/virtualization/).

## Prerequisites

* [__Forklift Operator__](https://github.com/kubev2v/forklift-operator/)
* [__OpenShift Console 4.12+__](https://www.openshift.com/)

## Development

### Start the UI:

Using forklift console plugin code.

In one terminal window, run:

1. `yarn install`
2. `yarn start`

| Enviorment varialbles | Description |
| --------------------|-------------|
| DATA_SOURCE         | 'mock' or 'remote', when set to 'mock', the plugin will show recorded data, (default 'remote') |
| BRAND_TYPE          | 'RedHat' or 'Konveyor', when set to 'RedHat' some strings will change to reflect downstream product names, (default 'Konveyor') |

In another terminal window, run:

1. `oc login # if not loggedin` (requires [oc](https://console.redhat.com/openshift/downloads) and an [OpenShift cluster](https://console.redhat.com/openshift/create))
2. `yarn run start:console` (requires [docker](https://www.docker.com) or [podman 3.2.0+](https://podman.io))

| Enviorment varialbles | Description  |
| -------|--------------|
| CONSOLE_IMAGE | The console image to run ( default `quay.io/openshift/origin-console:latest` )|
| CONSOLE_PORT | Expose the console web application on port ( default `9000` )|
| INVENTORY_SERVER_HOST | URL of Forklift inventory server ( default `http://localhost:8080` )|
| MUST_GATHER_API_SERVER_HOST | URL of Forklift must gather server ( default `http://localhost:9200` )|
| BRIDGE_K8S_AUTH_BEARER_TOKEN | Bearer token of user account ( on openshift token default to `$(oc whoami -t)` )|

This will run the OpenShift console in a container connected to the cluster
you've logged into. The plugin HTTP server runs on port 9001 with CORS enabled.

## Deployment on cluster

See: [docs/helm](/docs/helm.md) for details.

After pushing an image with your changes to a registry, you can deploy the
plugin to a cluster by using [helm](https://helm.sh/).

```bash
# Add the forklift helm repo
helm repo add forklift https://kubev2v.github.io/forklift-console-plugin

# Install the forklift console plugin using current namespace
helm install forklift-console-plugin forklift/forklift-console-plugin
```

### Helm templates optional values:

```bash
# for example, if forklift-operator is not installed in konveyor-forklift namespace,
# set "forkliftNamespace" value to the currect namespace:
helm install forklift-console-plugin \
   forklift/forklift-console-plugin \
   --set forkliftNamespace=openshift-mtv 
```

Once deployed on the cluster, our plugin must be enabled before it can be loaded by Console.

To enable the plugin manually, edit Console operator config and make sure the plugin's name is listed in the spec.plugins sequence (add one if missing):

```bash
oc patch consoles.operator.openshift.io cluster \
  --patch '{ "spec": { "plugins": ["forklift-console-plugin"] } }' --type=merge
```
