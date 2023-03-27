#!/usr/bin/env bash

set -euo pipefail
script_dir=$(dirname "$0")

K8S_TIMEOUT=${K8S_TIMEOUT:="360s"}
OKD_CONSOLE_YAML=${script_dir}/yaml/okd-console.yaml
KIND_REGISTRY=${KIND_REGISTRY:="localhost:5001"}

FORKLIFT_PLUGIN_UPSTREAM_IMG=quay.io/kubev2v/forklift-console-plugin:latest
FORKLIFT_PLUGIN_LOCAL_IMG=${KIND_REGISTRY}/forklift-console-plugin:latest

# Install OKD console
# -------------------
echo ""
echo "Starting OKD console"
echo "===================="

echo ""
echo "deploy console CRDs"

kubectl apply -f ${script_dir}/yaml/crds/console
kubectl apply -f ${script_dir}/yaml/crds/forklift

echo ""
echo "deploy OKD console (port: 30080)"

cat ${OKD_CONSOLE_YAML} | \
    sed "s/${FORKLIFT_PLUGIN_UPSTREAM_IMG//\//\\/}/${FORKLIFT_PLUGIN_LOCAL_IMG//\//\\/}/g" | \
    kubectl apply -f -

echo ""
echo "waiting for OKD console service..."
echo "=================================="

kubectl wait deployment -n okd-console console --for condition=Available=True --timeout=${K8S_TIMEOUT}

echo ""
echo "waiting for forklift console plugin service..."
echo "========================================="

kubectl wait deployment -n konveyor-forklift forklift-console-plugin --for condition=Available=True --timeout=${K8S_TIMEOUT}