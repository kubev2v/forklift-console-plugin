#!/usr/bin/env bash

set -euo pipefail
script_dir=$(realpath $(dirname "$0"))

CONTAINER_CMD=${CONTAINER_CMD:=podman}

# Print help message
if [[ $@ == *'--help'* ]]; then
  echo "Usage: bash deploy-all.sh [OPTION]...
helper script for deploying kubernetes cluster for forklift.

some network and virtualization operations requires running with system \
admin privileges, for example, when running using regular user account \
you may not be able to start a virtual machine or use some network interfaces.

  --help                      print out this help message.
  --with-all-providers        will deploy all mock providers avaliable.
  --with-ovirt-provider       will install fake ovirt provider
  --with-vmware-provider      will install vmware simulator.
  --with-openstack-provider   will install packstack simulator.
  --no-kubevirt               don't install kubebirt.
  --no-console                don't install OKD console.
  --no-cluster-up             don't install Kind cluster.
  "
  exit 0
fi

export K8S_TIMEOUT="365s"

# Check for container cmd
# -----------------------
echo ""
echo "Check for container command"
echo "============================"

if ! [ -x "$(command -v ${CONTAINER_CMD})" ]; then
  echo "Error: can't find '${CONTAINER_CMD}' command line utility, exit"
  echo ""
  echo "you can changed the command line urility using a CONTAINER_CMD enviorment variable"
  echo "and try again."
  echo "for example: export CONTAINER_CMD=docker"
  exit 1
fi
echo "Found: ${CONTAINER_CMD}"

# Install cluster
# ---------------

# Create kind cluster
if [[ $@ != *'--no-cluster-up'* ]]; then
  bash ${script_dir}/deploy-cluster.sh
fi

# Install volume poplulator
bash ${script_dir}/deploy-volume-populator.sh

# Install cert manager
bash ${script_dir}/deploy-cert-manager.sh

# Install forklift
bash ${script_dir}/deploy-forklift.sh

# Install kubevirt
if [[ $@ != *'--no-kubevirt'* ]]; then
  bash ${script_dir}/deploy-kubevirt.sh
fi

# Install okd console
if [[ $@ != *'--no-console'* ]]; then
  # Get console service account and tls certifications
  kubectl apply -f ${script_dir}/yaml/okd-console-tls-cert.yaml
  kubectl wait certificate -n konveyor-forklift console-certificate --for condition=Ready=True --timeout=${K8S_TIMEOUT}

  bash ${script_dir}/deploy-console.sh
fi

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

# Create some service accounts
# ----------------------------

echo ""
echo "==========================================="

bash ${script_dir}/create-forklift-user-account.sh

# Print some help
# ---------------

echo ""
echo "==========================================="

echo ""
echo "Local registry available on port 5001:    http://localhost:5001/"
echo "Usage example:"
echo "  ${CONTAINER_CMD} build -t localhost:5001/forklift-console-plugin -f ./build/Containerfile ."
echo "  ${CONTAINER_CMD} push localhost:5001/forklift-console-plugin --tls-verify=false"

config_path=$(echo ~)/.kube/config

echo ""
echo "Cluster information:"
echo "  kubectl cluster-info --context kind-kind"
echo ""
echo "  API Server: https://127.0.0.1:6443/"
echo "  Web console: https://localhost:30443/"
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
