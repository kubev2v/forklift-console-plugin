# CI scripts

Scripts and tools to run Forklift console plugin on top of Openshift console web application.

| Environment varialbles | Description  |
| -------|--------------|
| K8S_MODE_OFF_CLUSTER_ENDPOINT | k8s cluster API endpoint |
| K8S_AUTH_BEARER_TOKEN | k8s cluster token (example: `abcdef.0123456789abcdef` ) |
| CONSOLE_IMAGE | The console image to run ( example: `quay.io/openshift/origin-console:4.12` )|
| FORKLIFT_PLUGIN_IMAGE | The plugin image to build and use ( example: `localhost:5001/forklift-console-plugin:latest` )|
| INVENTORY_SERVER_HOST | URL of Forklift inventory server ( default `http://localhost:30088` )|
| MUST_GATHER_API_SERVER_HOST | URL of Forklift must gather server ( default `http://localhost:30089` )|

| Environment varialbles | Description  |
| -------|--------------|
| DATA_SOURCE | for webpack development server only, can be `mock` or `remote` ( example: `DATA_SOURCE=mock npm run start` ) |

| Script | Description  |
| -------|--------------|
| [deploy-all.sh](./deploy-all.sh) | Start K8S kind cluster with UI and forklift operator installed. |
| [clean-cluster.sh](./clean-cluster.sh) | Delete the cluster. |
| [start-console.sh](./start-console.sh) | Start a locally hosted OKD console waiting for development plugin. |

# References

## Openshift console web application

The console is a more friendly kubectl in the form of a single page webapp. It also integrates with other services like monitoring, chargeback, and OLM. Some things that go on behind the scenes include:
https://github.com/openshift/console

## Forklift CI

Scripts and tools for creating and deploying forklift cluster infrastructure and running integration tests against it.
See instructions about how to [install forklift on kind](https://github.com/kubev2v/forkliftci).

https://github.com/kubev2v/forkliftci

## Hyperconverged Cluster Operator

It is recomended to install Kubevirt using HCO operator. HCO operator makes sure the different parts of Kubevirt match, Forklift CI scripts install Kubevirt using the HCO versioning system.

https://github.com/kubevirt/hyperconverged-cluster-operator/blob/main/hack/config
