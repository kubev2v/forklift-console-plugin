#!/usr/bin/env bash

set -euo pipefail
script_dir=$(dirname "$0")

# Install olm
# --------------------------
echo ""
echo "Starting OLM"
echo "==========================="

if ! kubectl get CatalogSource 2>/dev/null; then
  kubectl apply -f https://raw.githubusercontent.com/operator-framework/operator-lifecycle-manager/master/deploy/upstream/quickstart/crds.yaml
  kubectl apply -f https://raw.githubusercontent.com/operator-framework/operator-lifecycle-manager/master/deploy/upstream/quickstart/olm.yaml

  # Wait for olm operator to start
  while ! kubectl get deployment -n olm olm-operator; do sleep 10; done
  kubectl wait deployment -n olm olm-operator --for condition=Available=True --timeout=180s
fi

echo ""
echo "OLM installed on namespace olm"
