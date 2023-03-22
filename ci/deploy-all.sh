#!/usr/bin/env bash

set -euo pipefail
script_dir=$(dirname "$0")

export K8S_TIMEOUT="365s"

# Check for kind cmd
# ------------------

echo "Check for kind"
echo "==============="

if ! [ -x "$(command -v kind)" ]; then
  echo "Error: can't find 'kind' command line utility, exit"
  echo "  see: https://sigs.k8s.io/kind for more information"
  exit 1
fi
echo "Found $(which kind)"

if ! [ -x "$(command -v kubectl)" ]; then
  echo "Error: can't find 'kubectl' command line utility, exit"
  echo "  see: https://kubernetes.io/docs/tasks/tools/#kubectl for more information"
  exit 1
fi
echo "Found $(which kubectl)"

# Check for container cmd
# -----------------------
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

# Install cluster
# ---------------

# Create kind cluster
bash ${script_dir}/deploy-cluster.sh

# Install console plugins
bash ${script_dir}/deploy-console-plugins.sh

# Install okd console
bash ${script_dir}/deploy-console.sh

# Install kubevirt
bash ${script_dir}/deploy-kubevirt.sh

# Install forklift
bash ${script_dir}/deploy-forklift.sh

# Print some help
# ---------------

echo ""
echo "==========================================="

echo ""
echo "Open ports, available for optional services:"
echo "  30001: for fakeovirt   running using nodePort 30001"
echo "  30022: for ssh         running using nodePort 30022"
echo "  30088: for inventory   running using nodePort 30088"
echo "  30089: for fake wmware running using nodePort 30089"

echo ""
echo "Local registry available on port 5001:    http://localhost:5001/"
echo "Usage example:"
echo "  podman build -t localhost:5001/forklift-console-plugin -f ./build/Containerfile"
echo "  podman push localhost:5001/forklift-console-plugin --tls-verify=false"
echo "  kubectl apply -f ci/yaml/forklift-plugin.yaml"

config_path=$(echo ~)/.kube/config

echo ""
echo "Cluster information:"
echo "  kubectl cluster-info --context kind-kind"
echo ""
echo "  API Server: https://127.0.0.1:6443/"
echo "  Web console: http://localhost:30080/"
echo ""
echo "  configuration file - '${config_path}'"
echo "  admin token        - 'abcdef.0123456789abcdef'"
echo ""

mssgs[0]="Have a nice day !"
mssgs[1]="Your cluster is ready"
mssgs[2]="Have fun !"
size_mssgs=${#mssgs[@]}
index_mssgs=$(($RANDOM % $size_mssgs))

emojis[0]="\U1F63A"
emojis[1]="\U1F381"
emojis[2]="\U1F389"
emojis[3]="\U1F63A"
size_emojis=${#mssgs[@]}
index_emojis=$(($RANDOM % $size_emojis))

echo -e ${mssgs[$index_mssgs]} ${emojis[$index_emojis]}
echo ""
