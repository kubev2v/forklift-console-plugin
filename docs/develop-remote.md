
# Develop inside the cluster using a development pod

It is recomended to use the internal registry when developing in the cluster, see [using-local-registry](./using-local-registry.md)
for more information.

Example of buiding the development image and pushing into the local registry,

``` bash
HOST=localhost:5001 # for KinD internal registry

podman build -t quay.io/kubev2v/forklift-console-plugin-dev -f ./build/Containerfile.dev 
podman tag quay.io/kubev2v/forklift-console-plugin-dev $HOST/kubev2v/forklift-console-plugin-dev
podman push $HOST/kubev2v/forklift-console-plugin-dev:latest --tls-verify=false
```

An already made image is available at `quay.io/kubev2v/forklift-console-plugin-dev:latest`

## Deploy the development pod

### Openshift (CRC)

Running the development pod requires privieged security context for the ssh server service account

``` bash
NAMESPACE=openshift-mtv

oc create namespace ${NAMESPACE}
oc adm policy add-scc-to-user privileged system:serviceaccount:${NAMESPACE}:default
```

This example uses Openshift internal registry, see how to push images to the internal registry at [using-local-registry](using-local-registry.md).

``` bash
NAMESPACE=openshift-mtv
IMAGE=image-registry.openshift-image-registry.svc:5000/kubev2v/forklift-console-plugin-dev
oc process -f scripts/yaml/forklift-plugin-dev.tpl.yaml -p=NAMESPACE=${NAMESPACE} -p=IMAGE=${IMAGE} | oc apply -f -
```

### KinD

A development pod allow developers to develop inside the cluster context, the developer
will have access to the cluster network and DNS.

forklift-console-plugin-dev, is a container image with the required development tools, tls certifications and the git source code pre-installed.

An example using the local development cluster deployed using KinD is available.

``` bash
# install forklift [ optional, install kubevirt ]
bash scripts/deploy-olm.sh
bash scripts/deploy-forklift.sh
# If the kind cluster was installed using root permissions, you can also
# install kubevirt operator
bash scripts/deploy-kubevirt.sh

# This example define:
#   namespace:       konveyor-forklift
#   cluster port:    30022
kubectl apply -f scripts/yaml/forklift-plugin-dev.yaml

# wait for the pod phase to be running
```

## Connect into the development pod

Development using the develepoment pod is done by using SSH to connect to the pod.

For example, ssh into the pod using ssh command line utility:

``` bash
CLUSTER_IP=127.0.0.1
ssh dev@${CLUSTER_IP} -p 30022

# cd into the code directory
cd forklift-console-plugin

# do git stuff (e.g. add remote, create branch etc ...)
# ....

# start the development server
npm run start

# or, if running an https seever
npm run start --port 9443 --server-type https --server-options-key /var/serving-cert/tls.key --server-options-cert /var/serving-cert/tls.crt
```

## Mount the development pod files

SSHFS itself is a file system in user space (FUSE) that uses the SSH File Transfer Protocol (SFTP) to mount a remote file system. The sshfs command is a client tool for using SSHFS to mount a remote file system from another server locally on your machine.

Install the utility using your package manager.

``` bash
dnf install fuse-sshfs
```

For example, mount the development pod directory into your local directory.

``` bash
# mount the dev users home directory into the current working directory ./
CLUSTER_IP=127.0.0.1
sshfs dev@${CLUSTER_IP}: ./ -p 30022

# do git stuff (e.g. add remote, create branch etc ...)
# ....

# edit the code
```

## Use code editor extentions

Some code editors allow code editing via SSH connection without the need to mount
the file system. For example VS Code support SSH remote development using `Remote - SSH` extention.
