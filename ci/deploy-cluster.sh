#!/usr/bin/env bash

set -euo pipefail
script_dir=$(dirname "$0")

CONTAINER_CMD=${CONTAINER_CMD:=podman}

# Install kind and kubectl
# -----------------------------------------
echo ""
echo "Install kind and kubectl"
echo "============================"

bash ${script_dir}/install-kind.sh
bash ${script_dir}/install-kubectl.sh

echo ""
echo "Install local registry"
echo "============================"

# Create the kind network
${CONTAINER_CMD} network create kind --driver bridge

reg_name='kind-registry'
reg_port='5001'

# Create the registry
if [ "$(${CONTAINER_CMD} inspect -f {{.State.Running}} "${reg_name}" 2>/dev/null || true)" != 'true' ]; then
  ${CONTAINER_CMD} run \
    -d --restart=always -p "127.0.0.1:${reg_port}:5000" --name "${reg_name}" --network bridge \
    registry:2
fi

echo ""
echo "Create KinD cluster"
echo "==================="

# create a cluster with the local registry enabled in containerd
cat <<EOF | kind create cluster --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
networking:
  apiServerPort: 6443
nodes:
- role: control-plane
  extraPortMappings:
  - containerPort: 30080
    hostPort: 30080
  - containerPort: 30088
    hostPort: 30088
containerdConfigPatches:
- |-
  [plugins."io.containerd.grpc.v1.cri".registry.mirrors."localhost:${reg_port}"]
    endpoint = ["http://${reg_name}:5000"]
EOF

if [ "$(${CONTAINER_CMD} inspect -f='{{json .NetworkSettings.Networks.kind}}' "${reg_name}")" = 'null' ]; then
  ${CONTAINER_CMD} network connect "kind" "${reg_name}"
fi

echo ""
echo "Bind cluster admin role to default user"
kubectl create clusterrolebinding forklift-cluster-admin --clusterrole=cluster-admin --user=system:bootstrap:abcdef
