# Develop using Openshift local cluster

## Install CRC

See CRC installation instructions in the [cli-tools](cli-tools.md) section.

## Deploy a cluster

``` bash
# set up the Openshift local tool
crc setup

# start a new Openshift cluster
crc start
```

### Login using kubeadmin user

When the cluster is ready, you can log into the cluster using the `oc` command.

``` bash
# use this command to get the login commands, to log into the cluster
crc console --credentials
```

For information of creating new users see the [create-dev-token](create-dev-token.md) section.

## Deployo forklift

You can install the released or development version of forklift.

### Install development versions of forklift and kubevirt

See the Forklift [CI](https://github.com/kubev2v/forkliftci) and [development](https://github.com/kubev2v/forklift) documentation for
instructions.

Installing kubevirt is optional.

### Install released forklift and kubevirt

Optionally you can deploy the released versions forklift and kubevirt, use the Openshift web console Operator Hub
and install forklift operator, or `openshift migration tool for virtualization`, and kubevirt operator (or `openshift virtualization`)

## Run the plugin development pod

### Setup the local registry

``` bash
REGISTRY_ROUTE=$(oc get route default-route -n openshift-image-registry --template='{{ .spec.host }}')
podman login -u kubeadmin -p $(oc whoami -t) ${REGISTRY_ROUTE} --tls-verify=false

NAMESPACE=kubev2v
IMAGE_NAME=forklift-console-plugin-dev

oc create namespace ${NAMESPACE}
oc create imagestream ${IMAGE_NAME} -n ${NAMESPACE}
```

For more information about setting up the local registry on CRC see [using-local-registry](using-local-registry.md).

### Create and push the plugin development pod

Create a development container image, and push it to the local registry

``` bash
REGISTRY_ROUTE=$(oc get route default-route -n openshift-image-registry --template='{{ .spec.host }}')
NAMESPACE=kubev2v
IMAGE_NAME=forklift-console-plugin-dev

podman build -t ${REGISTRY_ROUTE}/${NAMESPACE}/${IMAGE_NAME} -f ./build/Containerfile.dev
podman push ${REGISTRY_ROUTE}/${NAMESPACE}/${IMAGE_NAME} --tls-verify=false
```

### Deploy the plugin development pod:

Add super user capabilites to pods running using the development user account:

``` bash
NAMESPACE=openshift-mtv

oc adm policy add-scc-to-user privileged system:serviceaccount:${NAMESPACE}:default
```

Deploy the development template

``` bash
NAMESPACE=openshift-mtv
IMAGE=image-registry.openshift-image-registry.svc:5000/kubev2v/forklift-console-plugin-dev

oc process -f scripts/yaml/forklift-plugin-dev.tpl.yaml -p=NAMESPACE=${NAMESPACE} -p=IMAGE=${IMAGE} | oc apply -f -
```

### SSH into the development environment

Remember to use tmux when using ssh connection

``` bash
HOST=127.0.0.1
PORT=30022

ssh dev@${HOST} -p ${PORT} # password: dev
```

For more information about remote development, see [develop-remote](develop-remote.md).
