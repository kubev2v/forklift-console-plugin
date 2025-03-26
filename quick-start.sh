#!/bin/bash

echo "======================================="
echo " 🔧 OpenShift Dev Environment Setup 🔧 "
echo "======================================="

# Prompt user for cluster number (1–8)
while true; do
  read -p "Enter cluster number (1-8): " CLUSTER_INPUT
  if [[ "$CLUSTER_INPUT" =~ ^[1-8]$ ]]; then
    break
  else
    echo "❌ Invalid input. Please enter a number between 1 and 8."
  fi
done

# Format cluster number (e.g., 1 → 01)
CLUSTER_NUM=$(printf "%02d" "$CLUSTER_INPUT")
CLUSTER_ADDRESS="qemtv-${CLUSTER_NUM}.rhos-psi.cnv-qe.rhood.us"

# Mount NFS
NFS_MOUNT_POINT="/mnt/nfs"
NFS_SERVER="10.9.96.21:/rhos_psi_cluster_dirs"

if ! mountpoint -q "$NFS_MOUNT_POINT"; then
  echo "🔗 Mounting NFS share..."
  sudo mkdir -p "$NFS_MOUNT_POINT"
  sudo mount -t nfs "$NFS_SERVER" "$NFS_MOUNT_POINT"
  
  if [ $? -ne 0 ]; then
    echo "❌ Failed to mount NFS. Check your permissions or network."
    exit 1
  fi
else
  echo "✅ NFS already mounted at $NFS_MOUNT_POINT"
fi

# Read kubeadmin password
KUBEADMIN_PASSWORD_FILE="${NFS_MOUNT_POINT}/qemtv-${CLUSTER_NUM}/auth/kubeadmin-password"

if [ ! -f "$KUBEADMIN_PASSWORD_FILE" ]; then
  echo "❌ Kubeadmin password not found at ${KUBEADMIN_PASSWORD_FILE}"
  exit 1
fi

KUBEADMIN_PASSWORD=$(cat "$KUBEADMIN_PASSWORD_FILE")

# Export environment variables
export BRIDGE_BRANDING="openshift"
export INVENTORY_SERVER_HOST="https://virt-konveyor-forklift.apps.${CLUSTER_ADDRESS}"
export SERVICES_API_SERVER_HOST="https://virt-konveyor-forklift.apps.${CLUSTER_ADDRESS}"
export CONSOLE_IMAGE="quay.io/openshift/origin-console:4.18"

# Log in
echo "🔐 Logging into OpenShift cluster ${CLUSTER_ADDRESS}..."
yes | oc login "https://api.${CLUSTER_ADDRESS}:6443" -u kubeadmin -p "${KUBEADMIN_PASSWORD}" --insecure-skip-tls-verify

if [ $? -ne 0 ]; then
  echo "❌ OpenShift login failed. Please check your credentials."
  exit 1
fi

# Start console
echo "🚀 Starting the web console..."
yarn console
