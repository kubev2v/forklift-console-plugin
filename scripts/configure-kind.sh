#!/usr/bin/env bash

set -euo pipefail

# Start kind
# ------------

# Hint - install kind [ linux-amd64 ]
#curl -LO https://kind.sigs.k8s.io/dl/v0.11.1/kind-linux-amd64
#sudo install kind-linux-amd64 /usr/local/bin/kind

echo "Starting local kind cluster..."

# Start kind
kind create cluster --config $(pwd)/deployment/hack/kind/config.yaml

# Make default user super tux on the cluster
kubectl create clusterrolebinding kind-admin --clusterrole=cluster-admin --user=system:bootstrap:abcdef

# Try to install forklift CRDs
kubectl apply -f $(pwd)/deployment/hack/crds
