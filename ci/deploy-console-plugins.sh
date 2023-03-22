#!/usr/bin/env bash

set -euo pipefail
script_dir=$(dirname "$0")

echo ""
echo "deploy console plugins (forklift, minivirt)"
kubectl apply -f ${script_dir}/yaml/minivirt-plugin.yaml
cat ${script_dir}/yaml/forklift-plugin.yaml.template | sed "s/{{FORKLIFT_IMAGE_REPOSITORY}}/quay.io\/kubev2v/g" | kubectl apply -f -

