#!/bin/bash

set -euo pipefail

K8S_TIMEOUT=${K8S_TIMEOUT:="360s"}

# When updating the componenets versions folow HCO recomendations:
# HCO:
#   https://github.com/kubevirt/hyperconverged-cluster-operator
# HCO configuration file:
#   https://github.com/kubevirt/hyperconverged-cluster-operator/blob/<release tag>/hack/config

# Default version values
KUBEVIRT_VERSION="v1.2.0-beta.0"
CDI_VERSION="v1.58.1"
NETWORK_ADDONS_VERSION="v0.91.0"

echo ""
echo "Installing CDI, CNA and Kubevirt"
echo "================================"

# Install CDI
kubectl apply -f https://github.com/kubevirt/containerized-data-importer/releases/download/$CDI_VERSION/cdi-operator.yaml
kubectl apply -f https://github.com/kubevirt/containerized-data-importer/releases/download/$CDI_VERSION/cdi-cr.yaml

# Install CNA
kubectl apply -f https://github.com/kubevirt/cluster-network-addons-operator/releases/download/$NETWORK_ADDONS_VERSION/namespace.yaml
kubectl apply -f https://github.com/kubevirt/cluster-network-addons-operator/releases/download/$NETWORK_ADDONS_VERSION/network-addons-config.crd.yaml
kubectl apply -f https://github.com/kubevirt/cluster-network-addons-operator/releases/download/$NETWORK_ADDONS_VERSION/operator.yaml

# Install kubevirt
kubectl apply -f https://github.com/kubevirt/kubevirt/releases/download/${KUBEVIRT_VERSION}/kubevirt-operator.yaml
kubectl apply -f https://github.com/kubevirt/kubevirt/releases/download/${KUBEVIRT_VERSION}/kubevirt-cr.yaml

# --------------------

# Wait for cluster-network-addons operator to start
while ! kubectl get deployment -n cluster-network-addons cluster-network-addons-operator; do sleep 10; done
kubectl wait deployment -n cluster-network-addons cluster-network-addons-operator --for condition=Available=True --timeout=${K8S_TIMEOUT}

# Install macvtap and multus
cat << EOF | kubectl apply -f -
apiVersion: networkaddonsoperator.network.kubevirt.io/v1
kind: NetworkAddonsConfig
metadata:
  name: cluster
  namespace: cluster-network-addons
spec:
  multus: {}
  linuxBridge: {}
  imagePullPolicy: Always
EOF

# Wait for NADs to be ready, and create an empty NAD
echo ""
echo "Waiting for NetworkAttachmentDefinition to be ready (may take a few minutes)"
echo "============================================================================"

while ! kubectl get network-attachment-definitions.k8s.cni.cncf.io; do sleep 10; done
cat << EOF | kubectl apply -f -
apiVersion: "k8s.cni.cncf.io/v1"
kind: NetworkAttachmentDefinition
metadata:                        
  name: ocs-public
  namespace: cluster-network-addons
spec:                              
  config: '{
        "cniVersion": "0.3.1",
        "type": "macvlan",
        "master": "ens2",
        "mode": "bridge",
        "ipam": {
            "type": "whereabouts",
            "range": "192.168.1.0/24"
        }
  }'
EOF

echo ""
echo "Installed versions"
echo "=================="

echo CDI:  $CDI_VERSION
echo CNA:  $NETWORK_ADDONS_VERSION
echo Virt: $KUBEVIRT_VERSION
