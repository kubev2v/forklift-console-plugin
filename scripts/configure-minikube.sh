#!/usr/bin/env bash

set -euo pipefail

# Start minikube
# ------------

# Hint - install minikube [ linux-amd64 ]
#curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
#sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Default minkube home to user home, if MINIKUBE_HOME is not defined
MINIKUBE_HOME_=${MINIKUBE_HOME:=$HOME}

K8S_AUTH_BEARER_TOKEN=${BRIDGE_K8S_AUTH_BEARER_TOKEN:="31ada4fd-adec-460c-809a-9e56ceb75269"}

# Prepare user with token
mkdir -p ${MINIKUBE_HOME_}/.minikube/files/etc/ca-certificates
echo "${K8S_AUTH_BEARER_TOKEN},forklift,0" > ${MINIKUBE_HOME_}/.minikube/files/etc/ca-certificates/token.csv

echo "Starting local minikube console..."

# Start minikube
if [ -x "$(command -v podman)" ]; then
    minikube start --extra-config=apiserver.token-auth-file=/etc/ca-certificates/token.csv --memory=6G --cpus=4 --driver=podman
else
    minikube start --extra-config=apiserver.token-auth-file=/etc/ca-certificates/token.csv
fi

# Install CRDs
kubectl apply -f $(pwd)/deployment/hack/crds

# Make forklift user super tux on the cluster
kubectl create clusterrolebinding forklift-cluster-admin --clusterrole=cluster-admin --user=forklift
