#!/usr/bin/env bash

set -euo pipefail
script_dir=$(dirname "$0")

CONTAINER_CMD=${CONTAINER_CMD:=podman}

echo ""
echo "Install kind and kubectl"
echo "============================"

bash ${script_dir}/install-kind.sh
bash ${script_dir}/install-kubectl.sh

echo ""
echo "Install local registry"
echo "============================"

${CONTAINER_CMD} network create kind --driver bridge

reg_name='kind-registry'
reg_port='5001'

if [ "$(${CONTAINER_CMD} inspect -f {{.State.Running}} "${reg_name}" 2>/dev/null || true)" != 'true' ]; then
  ${CONTAINER_CMD} run \
    -d --restart=always -p "127.0.0.1:${reg_port}:5000" --name "${reg_name}" --net kind \
    registry:2
fi
