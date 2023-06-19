#!/bin/bash

set -euo pipefail
script_dir=$(dirname "$0")

K8S_TIMEOUT=${K8S_TIMEOUT:="360s"}

echo ""
echo "Installing Cert Manager"
echo "======================="

# Install cert-manager (we use basic functionality of cert-manager, we don't have to use its latest version)
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.10.1/cert-manager.yaml

kubectl wait deployment -n cert-manager cert-manager-cainjector --for condition=Available=True --timeout=${K8S_TIMEOUT}
kubectl wait deployment -n cert-manager cert-manager --for condition=Available=True --timeout=${K8S_TIMEOUT}
kubectl wait deployment -n cert-manager cert-manager-webhook --for condition=Available=True --timeout=${K8S_TIMEOUT}
