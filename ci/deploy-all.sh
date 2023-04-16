#!/usr/bin/env bash

set -euo pipefail
script_dir=$(realpath $(dirname "$0"))

export K8S_TIMEOUT="365s"

# Check for container cmd
# -----------------------
echo ""
echo "Check for container command"
echo "============================"

if ! [ -x "$(command -v podman)" ]; then
  echo "Error: can't find 'podman' command line utility, exit"
  exit 1
fi
echo "Found: podman"

# Install cluster
# ---------------

# Create kind cluster
bash ${script_dir}/deploy-cluster.sh

# Install okd console
bash ${script_dir}/deploy-console.sh

# Install kubevirt
bash ${script_dir}/deploy-kubevirt.sh

# Install forklift
bash ${script_dir}/deploy-forklift.sh

# Install mock providers
if [[ $@ == *'--with-all-providers'* ]]; then
  # make the submodule the current working direcotry for running the script
  (cd ${script_dir}/forkliftci && bash ${script_dir}/deploy-all-providers.sh)
fi

if [[ $@ == *'--with-ovirt-provider'* ]]; then
  # make the submodule the current working direcotry for running the script
  (cd ${script_dir}/forkliftci && bash ${script_dir}/deploy-ovirt-provider.sh)
fi
if [[ $@ == *'--with-vmware-provider'* ]]; then
  # make the submodule the current working direcotry for running the script
  (cd ${script_dir}/forkliftci && bash ${script_dir}/deploy-vmware-provider.sh)
fi
if [[ $@ == *'--with-openstack-provider'* ]]; then
  # make the submodule the current working direcotry for running the script
  (cd ${script_dir}/forkliftci && bash ${script_dir}/deploy-openstack-provider.sh)
fi

# Print some help
# ---------------

echo ""
echo "==========================================="

echo ""
echo "Local registry available on port 5001:    http://localhost:5001/"
echo "Usage example:"
echo "  podman build -t localhost:5001/forklift-console-plugin -f ./build/Containerfile"
echo "  podman push localhost:5001/forklift-console-plugin --tls-verify=false"

config_path=$(echo ~)/.kube/config

echo ""
echo "Cluster information:"
echo "  kubectl cluster-info --context kind-kind"
echo ""
echo "  API Server: https://127.0.0.1:6443/"
echo "  Web console: http://localhost:30080/"
echo ""
echo "  configuration file - '${config_path}' ( example: cp ${config_path} ~/.kube/config )"
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
