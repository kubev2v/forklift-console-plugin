#!/usr/bin/env bash

set -euo pipefail

if [ -x "$(command -v podman)" ]; then
  CONTAINER_CMD=$(which podman)
else
  CONTAINER_CMD=$(which docker)
fi

# Starting local registry and temp data dir
# -----------------------------------------
echo ""
echo "Starting local registry and tmp local storage"
echo "=============================================="

reg_name='kind-registry'
reg_port='5001'

# Create the kind network
if ! ${CONTAINER_CMD} network exists kind; then
  ${CONTAINER_CMD} network create kind
fi

# Create the registry
if [ "$(${CONTAINER_CMD} inspect -f {{.State.Running}} "${reg_name}" 2>/dev/null || true)" != 'true' ]; then
  ${CONTAINER_CMD} run \
    -d --restart=always -p "127.0.0.1:${reg_port}:5000" --name "${reg_name}" --net kind \
    registry:2
fi
reg_ip=$(${CONTAINER_CMD} inspect -f {{.NetworkSettings.Networks.kind.IPAddress}} ${reg_name})

echo "reg_name: ${reg_name}"
echo "reg_port: ${reg_port} (localhost, http://localhost:${reg_port})"
echo "reg_ip:   ${reg_ip} (cluster, http://${reg_ip}:5000)"

# Create tmp storage dir
host_path=$(mktemp -d -t kind-storage-XXXXX)
echo "host_path: ${host_path} (cluster, /data)"

# Create a cluster with the local registry enabled in containerd
# ---------------------------------------------------------------
echo ""
echo "Starting local kind cluster"
echo "============================"

# 30001       - fakeovirt
# 30022       - ssh
# 30050       - openstack keystone service
# 30080       - console
# 30088       - forklift invnetory
# 30089       - fake wmware
# 31000:33000 - openstack services

cat <<EOF | kind create cluster --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
networking:
  apiServerPort: 6443
nodes:
- role: control-plane
  extraPortMappings:
  - containerPort: 30001
    hostPort: 30001
  - containerPort: 30022
    hostPort: 30022
  - containerPort: 30050
    hostPort: 30050
  - containerPort: 30080
    hostPort: 30080
  - containerPort: 30088
    hostPort: 30088
  - containerPort: 30089
    hostPort: 30089
  - containerPort: 31609
    hostPort: 31609
  - containerPort: 31058
    hostPort: 31058
  - containerPort: 31663
    hostPort: 31663
  - containerPort: 31677
    hostPort: 31677
  - containerPort: 31932
    hostPort: 31932
  - containerPort: 32359
    hostPort: 32359
  extraMounts:
  - hostPath: ${host_path}
    containerPath: /data
containerdConfigPatches:
- |-
  [plugins."io.containerd.grpc.v1.cri".registry.mirrors."localhost:${reg_port}"]
    endpoint = ["http://${reg_ip}:5000"]
EOF

echo ""
echo "Bind cluster admin role to default user"
kubectl create clusterrolebinding forklift-cluster-admin --clusterrole=cluster-admin --user=system:bootstrap:abcdef
