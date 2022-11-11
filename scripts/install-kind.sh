#!/usr/bin/env bash

set -euo pipefail
script_dir=$(dirname "$0")

# Check for kind cmd
# -----------------------------------

echo "Check for kind"
echo "==============="

if ! [ -x "$(command -v kind)" ]; then
  echo "Error: can't find 'kind' command, exit"
  exit 1
fi
echo "Found $(which kind)"

if ! [ -x "$(command -v kubectl)" ]; then
  echo "Error: can't find 'kubectl' command, exit"
  exit 1
fi
echo "Found $(which kubectl)"

# Check for container cmd
# -----------------------------------
echo ""
echo "Check for container command"
echo "============================"

if [ -x "$(command -v podman)" ]; then
  CONTAINER_CMD=$(which podman)
else
  CONTAINER_CMD=$(which docker)
fi
echo "Found: ${CONTAINER_CMD}"

# Starting local registry and temp data dir
# ---------------------------------------------
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
# -----------------------------------------------------------------
echo ""
echo "Starting local kind cluster"
echo "============================"

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
  extraMounts:
  - hostPath: ${host_path}
    containerPath: /data
containerdConfigPatches:
- |-
  [plugins."io.containerd.grpc.v1.cri".registry.mirrors."localhost:${reg_port}"]
    endpoint = ["http://${reg_ip}:5000"]
EOF

# Install Openshift console
# --------------------------
echo ""
echo "Starting Openshift console"
echo "==========================="

echo ""
echo "waiting for kind cluster coredns service..."
kubectl wait deployment -n kube-system coredns --for condition=Available=True --timeout=180s

kubectl apply -f ${script_dir}/yaml/consoleplugin.crd.yaml
kubectl apply -f ${script_dir}/yaml/openshift-console.yaml

echo "waiting for Openshift console service..."
kubectl wait deployment -n  openshift-console console --for condition=Available=True --timeout=180s

# Print some help
# -----------------
echo ""
echo "==========================================="
echo ""

echo "Routes:"
echo "  server:      https://127.0.0.1:6443/"
echo "  registry:    http://localhost:${reg_port}/"
echo "  web console: http://localhost:30080/"

echo ""
echo "Cleanup:"
echo "  kind delete cluster"
echo "  podman stop kind-registry"
echo "  podman rm kind-registry"
echo "  rm -rf /tmp/kind-storage-*"

echo ""
echo "Local registry usage example:"
echo "  podman pull gcr.io/google-samples/hello-app:1.0"
echo "  podman tag gcr.io/google-samples/hello-app:1.0 localhost:5001/hello-app:1.0"
echo "  podman push localhost:5001/hello-app:1.0 --tls-verify=false"
echo "  kubectl create deployment hello-server --image=localhost:5001/hello-app:1.0"
