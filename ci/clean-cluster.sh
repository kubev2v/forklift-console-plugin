#!/usr/bin/env bash

set -x

CONTAINER_CMD=${CONTAINER_CMD:=podman}

# This is a distructive operation
read -r -p "Do you want to delete the instance? [y/N]: " response
response=${response,,} # tolower

if [[ "$response" =~ ^(yes|y)$ ]]; then
    echo "Deleting the instance"

    kind delete cluster
    ${CONTAINER_CMD} stop kind-registry
    ${CONTAINER_CMD} rm kind-registry
    ${CONTAINER_CMD} network rm kind

    unset BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT
    unset BRIDGE_K8S_AUTH_BEARER_TOKEN
fi
