#!/bin/bash

set -euo pipefail

echo ""
echo "Installing VolumePopulator CRD"
echo "=============================="

kubectl apply -f https://raw.githubusercontent.com/kubernetes-csi/volume-data-source-validator/v1.0.1/client/config/crd/populator.storage.k8s.io_volumepopulators.yaml
