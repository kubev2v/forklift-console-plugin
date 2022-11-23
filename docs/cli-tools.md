
# Command line tools for OpenShift and Kubernetes

This tools allow users to run Kubernetes and OpenShift locally, run commands against Kubernetes clusters, and debug workloads running localy or on remote clusters.

## kubectl

The Kubernetes command-line tool, [kubectl](https://kubernetes.io/docs/reference/kubectl/kubectl/), allows you to run commands against Kubernetes clusters. You can use kubectl to deploy applications, inspect and manage cluster resources, and view logs. For more information including a complete list of kubectl operations, see the [kubectl reference documentation](https://kubernetes.io/docs/reference/kubectl/).

Installation/Downloads: https://kubernetes.io/docs/tasks/tools/#kubectl 

Example (latest):

``` bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install kubectl /usr/local/bin/kubectl
```

## oc

The OpenShift client `oc` simplifies working with Kubernetes and OpenShift
clusters, offering a number of advantages over `kubectl` such as easy login,
kube config file management, and access to developer tools. The `kubectl`
binary is included alongside for when strict Kubernetes compliance is necessary.

To learn more about OpenShift, visit [docs.openshift.com](https://docs.openshift.com)
and select the version of OpenShift you are using.  

Installation/Documentation: https://mirror.openshift.com/pub/openshift-v4/x86_64/clients/oc/latest/

Example (latest):

``` bash
curl -LO https://mirror.openshift.com/pub/openshift-v4/clients/oc/latest/linux/oc.tar.gz
tar -xvf oc.tar.gz

sudo install oc /usr/local/bin/oc
sudo install kubectl /usr/local/bin/kubectl
```

## virtctl

Basic VirtualMachineInstance operations can be performed with the stock kubectl utility. However, the virtctl binary utility is required to use advanced features, such as Serial and graphical console access.

Installation/Documentation: https://kubevirt.io/user-guide/operations/virtctl_client_tool/

Example (v0.58.0):
``` bash
export VERSION=v0.58.0
curl -LO https://github.com/kubevirt/kubevirt/releases/download/${VERSION}/virtctl-${VERSION}-linux-amd64
sudo install virtctl-${VERSION}-linux-amd64 /usr/local/bin/virtctl
```

## kind

[kind](https://sigs.k8s.io/kind) is a tool for running local Kubernetes clusters using Docker container “nodes”.
kind was primarily designed for testing Kubernetes itself, but may be used for local development or CI.

Installation/Documentation: https://kind.sigs.k8s.io/docs/user/quick-start/

Example (v0.17.0):

``` bash
export VERSION=v0.17.0
curl -LO https://kind.sigs.k8s.io/dl/${VERSION}/kind-linux-amd64
sudo install kind-linux-amd64 /usr/local/bin/kind
```

Note: for kubevirt to run virtual machines on kind cluster, kind need to run from root account.

## CRC

Red Hat CodeReady Containers allows you to spin up a small Red Hat OpenShift cluster on your local PC, without the need for a server, a cloud, or a team of operations people.

Installation/Documentation: https://developers.redhat.com/products/openshift-local/overview

Example (latest):

``` bash
curl -LO https://developers.redhat.com/content-gateway/rest/mirror/pub/openshift-v4/clients/crc/latest/crc-linux-amd64.tar.xz
tar -xvf crc-linux-amd64.tar.xz

sudo install crc-linux-2.10.1-amd64/crc /usr/local/bin/crc

# Get pull request from https://console.redhat.com/openshift/create/local
# and run
crc setup
crc start
```
