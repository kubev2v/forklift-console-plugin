#!/usr/bin/env bash

set -euo pipefail
script_dir=$(dirname "$0")

K8S_TIMEOUT=${K8S_TIMEOUT:="360s"}

# Install OKD console
# -------------------
echo ""
echo "Starting OKD console"
echo "===================="

echo ""
echo "deploy console CRDs"
kubectl apply -f ${script_dir}/yaml/crds/console.openshift.io_consoleplugins.yaml
kubectl apply -f ${script_dir}/yaml/crds/console.openshift.io_consolequickstarts.yaml

echo ""
echo "deploy OKD console (with forklift proxy, tls: false, auth: flase, port: 30088)..."
kubectl apply -f ${script_dir}/yaml/forklift-logo.yaml
kubectl apply -f ${script_dir}/yaml/okd-console.yaml

echo ""
echo "waiting for OKD console service..."
kubectl wait deployment -n  okd-console console --for condition=Available=True --timeout=${K8S_TIMEOUT}
