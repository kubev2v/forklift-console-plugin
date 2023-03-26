#!/usr/bin/env bash

set -euo pipefail
script_dir=$(dirname "$0")

K8S_TIMEOUT=${K8S_TIMEOUT:="360s"}
OKD_CONSOLE_YAML=${script_dir}/yaml/okd-console.yaml

# Install OKD console
# -------------------
echo ""
echo "Starting OKD console"
echo "===================="

echo ""
echo "deploy console CRDs"

kubectl apply -f ${script_dir}/yaml/crds/console

echo ""
echo "deploy OKD console (port: 30088)"

kubectl apply -f ${OKD_CONSOLE_YAML}

echo ""
echo "waiting for OKD console service..."
echo "=================================="

kubectl wait deployment -n okd-console console --for condition=Available=True --timeout=${K8S_TIMEOUT}
