#!/bin/bash

set -ex

# Install CDI
export CDI_VERSION=$(curl -s https://api.github.com/repos/kubevirt/containerized-data-importer/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
kubectl create -f https://github.com/kubevirt/containerized-data-importer/releases/download/$CDI_VERSION/cdi-operator.yaml
kubectl create -f https://github.com/kubevirt/containerized-data-importer/releases/download/$CDI_VERSION/cdi-cr.yaml

# Install CNA
export CNA_VERSION=$(curl -s https://api.github.com/repos/kubevirt/cluster-network-addons-operator/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
kubectl apply -f https://github.com/kubevirt/cluster-network-addons-operator/releases/download/$CNA_VERSION/namespace.yaml
kubectl apply -f https://github.com/kubevirt/cluster-network-addons-operator/releases/download/$CNA_VERSION/network-addons-config.crd.yaml
kubectl apply -f https://github.com/kubevirt/cluster-network-addons-operator/releases/download/$CNA_VERSION/operator.yaml

# Install kubevirt
export VIRT_VERSION=$(curl -s https://api.github.com/repos/kubevirt/kubevirt/releases | grep tag_name | grep -v -- '-rc' | sort -r | head -1 | awk -F': ' '{print $2}' | sed 's/,//' | xargs)
kubectl create -f https://github.com/kubevirt/kubevirt/releases/download/${VIRT_VERSION}/kubevirt-operator.yaml
kubectl create -f https://github.com/kubevirt/kubevirt/releases/download/${VIRT_VERSION}/kubevirt-cr.yaml

# --------------------

# Wait for cluster-network-addons operator to start
while ! kubectl get deployment -n cluster-network-addons cluster-network-addons-operator; do sleep 10; done
kubectl wait deployment -n cluster-network-addons cluster-network-addons-operator --for condition=Available=True --timeout=180s

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
  macvtap: {}
  imagePullPolicy: Always
EOF

# Wait for NADs to be ready, and create an empty NAD
while ! kubectl get network-attachment-definitions.k8s.cni.cncf.io; do sleep 10; done
cat << EOF | kubectl apply -f -
apiVersion: k8s.cni.cncf.io/v1
kind: NetworkAttachmentDefinition
metadata:
  name: example
  namespace: cluster-network-addons
spec:
  config: '{}'
EOF

echo CDI:  $CDI_VERSION
echo CNA:  $CNA_VERSION
echo Virt: $VIRT_VERSION
