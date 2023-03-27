#!/usr/bin/env bash

set -euo pipefail
script_dir=$(dirname "$0")

# Install kind and kubectl
# -----------------------------------------
echo ""
echo "Install kind and kubectl"
echo "============================"
bash ${script_dir}/install-kind.sh
bash ${script_dir}/install-kubectl.sh

# create registry container unless it already exists
reg_name='kind-registry'
reg_port='5001'

if ! podman network exists kind; then
  podman network create kind
fi

# Create the registry
if [ "$(podman inspect -f {{.State.Running}} "${reg_name}" 2>/dev/null || true)" != 'true' ]; then
  podman run \
    -d --restart=always -p "127.0.0.1:${reg_port}:5000" --name "${reg_name}" --net kind \
    registry:2
fi

# create a cluster with the local registry enabled in containerd
KIND_EXPERIMENTAL_PROVIDER=podman

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

echo ""
echo "Bind cluster admin role to default user"
kubectl create clusterrolebinding forklift-cluster-admin --clusterrole=cluster-admin --user=system:bootstrap:abcdef
