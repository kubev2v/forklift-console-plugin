#!/usr/bin/env bash

set -euo pipefail

# Start minikube
# ------------

# Hint - install minikube [ linux-amd64 ]
#curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
#sudo install minikube-linux-amd64 /usr/local/bin/minikube


export BRIDGE_K8S_AUTH_BEARER_TOKEN=${BRIDGE_K8S_AUTH_BEARER_TOKEN:="31ada4fd-adec-460c-809a-9e56ceb75269"}
# Prepare user with token
echo "${BRIDGE_K8S_AUTH_BEARER_TOKEN},forklift,0" > ~/.minikube/files/etc/ca-certificates/token.csv

echo "Starting local minikube console..."

# Start minikube
minikube start --extra-config=apiserver.token-auth-file=/etc/ca-certificates/token.csv

# Install CRDs
kubectl apply -f $(pwd)/deployment/hack/crds

# Make forklift user super tux on the cluster
kubectl create clusterrolebinding forklift-cluster-admin --clusterrole=cluster-admin --user=forklift

export BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT=https://$(minikube ip):8443


