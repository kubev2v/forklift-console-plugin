#!/usr/bin/env bash

set -euo pipefail
script_dir=$(dirname "$0")

echo ""
echo "Install all mock providers"
echo "=========================="

# Setup NFS 
# Uncomment for install NFS one time (requires sudo)
# ${script_dir}/forkliftci/cluster/providers/openstack/install_nfs.sh

bash ${script_dir}/deploy-ovirt-provider.sh
bash ${script_dir}/deploy-vmware-provider.sh
bash ${script_dir}/deploy-openstack-provider.sh
