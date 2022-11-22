# CI scripts

Scripts and tools to run Forklift console plugin on top of Openshift console web application.

## Setting up K8S before running Openshift console

Running Openshift console requires a user account with valid bearer token. On openshift
a default user account is created during the install process. On base k8s a user account
should be created manually.

| Script | Description  |
| -------|--------------|
| [configure-kind.sh](./configure-kind.sh) | Start K8S kind cluster with a cluster admin user and bearer toekn. |
| [configure-minikube.sh](./configure-minikube.sh) | Start K8S Minikube cluster with a cluster admin user and bearer toekn. |

## Start Openshift console

This scripts will start Openshift console using latest devel container image. It is required to be logged into the cluster
you are using before running this script. After running this script, the Openshift console will be available on [http://127.0.0.1:9000](http://127.0.0.1:9000). It will proxy Forklift inventory and must gather services.

| Script | Description  |
| -------|--------------|
| [start-console-k8s.sh](./start-console-k8s.sh) | Start Openshift web console when logged into a K8S cluster. |
| [start-console.sh](./start-console.sh) | Start Openshift web console when logged into a Openshift. |
| [start-console-with-oauth.sh](./start-console-with-oauth.sh) | Start Openshift web console when logged into a Openshift, requires the user to log into the web console. |

Available enviorment varialbles

| Enviorment varialbles | Description  |
| -------|--------------|
| CONSOLE_IMAGE | The console image to run ( default `quay.io/openshift/origin-console:latest` )|
| CONSOLE_PORT | Expose the console web application on port ( default `9000` )|
| INVENTORY_SERVER_HOST | URL of Forklift inventory server ( default `http://localhost:8080` )|
| MUST_GATHER_API_SERVER_HOST | URL of Forklift must gather server ( default `http://localhost:8090` )|
| BRIDGE_K8S_AUTH_BEARER_TOKEN | Bearer token of user account ( on openshift token default to `$(oc whoami -t)` )|

## Deploy Forklift and Kubevirt

Some CI flows require Forklift and/or Kubevirt to be installed on the cluster.  It is possible to use Operator Hub
and OLM to install them when Operator Hub is available.  The following scripts automate a minimal install if needed:

| Script | Description  |
| -------|--------------|
| [k8s-deploy-forklift.sh](./k8s-deploy-forklift.sh) | Deploy Forklift operator using OLM. |
| [k8s-deploy-kubevirt.sh](./k8s-deploy-kubevirt.sh) | Deploy CDI, CNA and Kubevirt. |

Kubevirt components versions should follow HCO versions per [HCO](https://github.com/kubevirt/hyperconverged-cluster-operator)
release.  To get a valid combination of Kubevirt components, we can use HCO recommendation found in this
[HCO config file](https://github.com/kubevirt/hyperconverged-cluster-operator/blob/main/hack/config).
Older versions matching some HCO release can be found by checking out older versions for this file.

# References

## Openshift console web application

The console is a more friendly kubectl in the form of a single page webapp. It also integrates with other services like monitoring, chargeback, and OLM. Some things that go on behind the scenes include:
https://github.com/openshift/console

## Forklift CI

Scripts and tools for creating and deploying forklift cluster infrastructure and running integration tests against it.
Instructions about how to [install forklift on kind](https://github.com/kubev2v/forkliftci/blob/main/INSTALL_FORKLIFT_ON_KIND.md).

https://github.com/kubev2v/forkliftci

## Hyperconverged Cluster Operator

It is recomended to install Kubevirt using HCO operator. HCO operator makes sure the different parts of Kubevirt match, Forklift CI scripts install Kubevirt using the HCO versioning system.

https://github.com/kubevirt/hyperconverged-cluster-operator/blob/main/hack/config