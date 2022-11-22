#!/usr/bin/env bash

set -euo pipefail
script_dir=$(dirname "$0")

# Check for kind cmd
# -----------------------------------

echo "Check for kind"
echo "==============="

if ! [ -x "$(command -v kind)" ]; then
  echo "Error: can't find 'kind' command line utility, exit"
  exit 1
fi
echo "Found $(which kind)"

if ! [ -x "$(command -v kubectl)" ]; then
  echo "Error: can't find 'kubectl' command line utility, exit"
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

if ! [ -x "$(command -v ${CONTAINER_CMD})" ]; then
  echo "Error: can't find 'podman' or 'docker' command line utility, exit"
  exit 1
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
  - containerPort: 30022
    hostPort: 30022
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

echo ""
echo "deploy Openshift console (with forklift proxy, tls: false, auth: flase, port: 8080)..."
kubectl apply -f ${script_dir}/yaml/openshift-console.yaml

echo ""
echo "deploy forklift CRDs + deploy console CRDs"
kubectl apply -f ${script_dir}/yaml/crds

echo ""
echo "waiting for Openshift console service..."
kubectl wait deployment -n  openshift-console console --for condition=Available=True --timeout=180s

# Give default kind user cluster admin role
# -----------------------------------------
echo ""
echo "Bind cluster admin role to default user"
echo "token - 'abcdef.0123456789abcdef'"
kubectl create clusterrolebinding forklift-cluster-admin --clusterrole=cluster-admin --user=system:bootstrap:abcdef

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
echo "Local registry usage example:"
echo "  podman build -t localhost:5001/forklift-console-plugin -f Containerfile"
echo "  podman push localhost:5001/forklift-console-plugin --tls-verify=false"
echo "  kubectl apply -f scripts/yaml/forklift-plugin.yaml"

echo ""
echo "==========================================="

echo ""
echo "This script will install the kubernetes config file in your .kube directory,"
echo "if this was run by a different user, make sure your current user can use the cluster"
echo "if needed copy the kubernetes config file to your local home directory, or"
echo "use the KUBECONFIG environment variable to point to the new config file."
echo "For example:"
echo "  cp <home direcotory of user running this script>/config ~/.kube/config"
