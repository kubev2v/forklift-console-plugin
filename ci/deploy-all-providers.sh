#!/usr/bin/env bash

set -euo pipefail
script_dir=$(dirname "$0")

echo ""
echo "Install mock providers"
echo "======================"

# Setup NFS 
# Uncomment for install NFS one time (requires sudo)
# ${script_dir}/forkliftci/cluster/providers/openstack/install_nfs.sh

export NFS_IP_ADDRESS=$(ip route get 8.8.8.8 | awk '{ print $7 }' | head -1)
export NFS_SHARE="/home/nfsshare"

bash ${script_dir}/deploy-ovirt-provider.sh
bash ${script_dir}/deploy-vmware-provider.sh
bash ${script_dir}/deploy-openstack-provider.sh
