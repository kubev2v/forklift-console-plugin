# Develop using kind command line utitlty

## Install KinD

See kind installation instructions in the [cli-tools](cli-tools.md) section.

## Deploy a cluster

``` bash
# optional, this step will delete any data currently on the cluster
bash scripts/clean-cluster.sh

# run the cluster deployment script as a none root user
bash scripts/deploy-cluster.sh
```

### Deploy using the root user

Running the cluster with normal user permissions is prefered, but some features are not available, 
for example the `kubevirt` operator will not run currectly without root permissions.

``` bash
# optional, this step will delete any data currently on the cluster
sudo bash scripts/clean-cluster.sh

# run the cluster deployment script as a none root user
sudo bash scripts/deploy-cluster.sh

# when running multiple Openshift/Kubernetes environment, you can also [re-]login
# to your local KinD cluster using oc command:
#   oc login https://127.0.0.1:6443 --token abcdef.0123456789abcdef
```

### Log into the cluster

When the cluster is ready, a kubeconfig file is set and you can start using `kubectl` command as cluster admin.

For information of creating new users see the [create-dev-token](create-dev-token.md) section.

## Deployo forklift

You can install the released or development version of forklift.

### Install development versions of forklift and kubevirt

See the [CI](https://github.com/kubev2v/forkliftci) and [development](https://github.com/kubev2v/forklift) documentation for
instructions.

### Install released forklift and kubevirt

Optionally you can deploy the released versions forklift and kubevirt

``` bash
bash scripts/deploy-olm.sh
bash scripts/deploy-forklift.sh

# optionaly, if the cluster was deployed using root permissions
# you can also install the kubevirt operator
bash scripts/deploy-kubevirt.sh
```

Optionally, you can use NodePort to expose forklift APIs on ports 30089 and 30088.

``` bash
NAMESPACE=konveyor-forklift

kubectl patch service forklift-inventory --type='merge' -p '{"spec":{"ports":[{"name":"api-http","protocol":"TCP","port":8080,"targetPort":8080,"nodePort":30088}],"type":"NodePort"}}' -n ${NAMESPACE}

kubectl patch service forklift-must-gather-api --type='merge' -p '{"spec":{"ports":[{"name":"api-http","protocol":"TCP","port":8080,"targetPort":8080,"nodePort":30089}],"type":"NodePort"}}' -n ${NAMESPACE}
```

## Run the plugin development pod

### Create and push the plugin development pod

Create a development container image, and push it to the local registry

``` bash
podman build -t localhost:5001/kubev2v/forklift-console-plugin-dev -f Containerfile.dev
podman push localhost:5001/kubev2v/forklift-console-plugin-dev --tls-verify=false
```

### Deploy the plugin development pod:

``` bash
# if konveyor-forklift is not ready, create it
kubectl create namespace konveyor-forklift

# deploy the devlopment environment
kubectl apply -f scripts/yaml/forklift-plugin-dev.yaml
```

### SSH into the development environment

``` bash
HOST=127.0.0.1
PORT=30022

ssh dev@${HOST} -p ${PORT} # password: dev
```

For more information about remote development, see [develop-remote](develop-remote.md).
