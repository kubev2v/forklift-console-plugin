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

if [ -x "$(command -v docker)" ]; then
  if [ "$(docker inspect -f '{{.State.Running}}' "${reg_name}" 2>/dev/null || true)" != 'true' ]; then
    docker run \
      -d --restart=always -p "127.0.0.1:${reg_port}:5000" --name "${reg_name}" \
      registry:2
  fi
else
  # Create the kind network
  if ! podman network exists kind; then
    podman network create kind
  fi

  # Create the registry
  if [ "$(podman inspect -f {{.State.Running}} "${reg_name}" 2>/dev/null || true)" != 'true' ]; then
    podman run \
      -d --restart=always -p "127.0.0.1:${reg_port}:5000" --name "${reg_name}" --net kind \
      registry:2
  fi
fi

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
containerdConfigPatches:
- |-
  [plugins."io.containerd.grpc.v1.cri".registry.mirrors."localhost:${reg_port}"]
    endpoint = ["http://${reg_name}:5000"]
EOF

if [ -x "$(command -v docker)" ]; then
  # connect the registry to the cluster network if not already connected
  if [ "$(docker inspect -f='{{json .NetworkSettings.Networks.kind}}' "${reg_name}")" = 'null' ]; then
    docker network connect "kind" "${reg_name}"
  fi
fi

echo ""
echo "Bind cluster admin role to default user"
kubectl create clusterrolebinding forklift-cluster-admin --clusterrole=cluster-admin --user=system:bootstrap:abcdef
