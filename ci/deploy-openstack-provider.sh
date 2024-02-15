#!/usr/bin/env bash

set -euo pipefail
script_dir=$(dirname "$0")

echo ""
echo "Install mock openstack"
echo "======================"

# Setup NFS 
# Uncomment for install NFS one time (requires sudo)
# ${script_dir}/forkliftci/cluster/providers/openstack/install_nfs.sh

export NFS_IP_ADDRESS=$(ip route get 8.8.8.8 | awk '{ print $7 }' | head -1)
export NFS_SHARE="/home/nfsshare"

# Deploy packstack + test-vm
bash ${script_dir}/forkliftci/cluster/providers/openstack/setup.sh
bash ${script_dir}/forkliftci/cluster/providers/openstack/create_test_vms.sh
