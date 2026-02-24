#!/usr/bin/env bash

set -euo pipefail

CONTAINER_CMD=${CONTAINER_CMD:=podman}

reg_name='kind-registry'
reg_port='5001'
reg_ip=$(${CONTAINER_CMD} inspect ${reg_name} -f {{.NetworkSettings.Networks.kind.IPAddress}})

echo ""
echo "Create KinD cluster"
echo "==================="

cat <<EOF | kind create cluster --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
networking:
  apiServerPort: 6443
nodes:
- role: control-plane
  image: kindest/node:v1.33.0
  extraPortMappings:
  - containerPort: 30080
    hostPort: 30080
  - containerPort: 30443
    hostPort: 30443
  - containerPort: 30444
    hostPort: 30444
  - containerPort: 30446
    hostPort: 30446
containerdConfigPatches:
- |-
  [plugins."io.containerd.grpc.v1.cri".registry.mirrors."localhost:${reg_port}"]
    endpoint = ["http://${reg_ip}:5000"]
EOF

if [ "$(${CONTAINER_CMD} inspect -f='{{json .NetworkSettings.Networks.kind}}' "${reg_name}")" = 'null' ]; then
  ${CONTAINER_CMD} network connect "kind" "${reg_ip}"
fi

echo ""
echo "Bind cluster admin role to default user"
kubectl create clusterrolebinding forklift-cluster-admin --clusterrole=cluster-admin --user=system:bootstrap:abcdef
