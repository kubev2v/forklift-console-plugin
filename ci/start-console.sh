#!/usr/bin/env bash

set -euo pipefail

if [ -x "$(command -v podman)" ]; then
  CONTAINER_CMD=$(which podman)
else
  CONTAINER_CMD=$(which docker)
fi
CONSOLE_CONTAINER_NAME=okd-console

# Test is console already running
if ${CONTAINER_CMD} container exists ${CONSOLE_CONTAINER_NAME}; then
  echo "container named ${CONSOLE_CONTAINER_NAME} is running, exit."
  exit 1
fi

PLUGIN_NAME="forklift-console-plugin"
CONSOLE_IMAGE=${CONSOLE_IMAGE:="quay.io/openshift/origin-console:latest"}
CONSOLE_PORT=${CONSOLE_PORT:=9000}
INVENTORY_SERVER_HOST=${INVENTORY_SERVER_HOST:="http://localhost:30088"}
MUST_GATHER_API_SERVER_HOST=${MUST_GATHER_API_SERVER_HOST:="http://localhost:30089"}

echo "Starting local OpenShift console..."
echo "==================================="

echo "API Server: $BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT"
echo "Console Image: $CONSOLE_IMAGE"
echo "Console URL: http://localhost:${CONSOLE_PORT}"
echo "Inventory server URL: ${INVENTORY_SERVER_HOST}"
echo "Must gather API server URL: ${MUST_GATHER_API_SERVER_HOST}"

# Look for a forklift-inventory route
PLUGIN_PROXY=$(cat << END
{"services":[
    {
        "consoleAPIPath":"/api/proxy/plugin/${PLUGIN_NAME}/forklift-inventory/",
        "endpoint":"${INVENTORY_SERVER_HOST}",
        "authorize":true
    },
    {
        "consoleAPIPath":"/api/proxy/plugin/${PLUGIN_NAME}/must-gather-api/",
        "endpoint":"${MUST_GATHER_API_SERVER_HOST}",
        "authorize":true
    }]}
END
)
export BRIDGE_PLUGIN_PROXY=$(echo ${PLUGIN_PROXY} | sed 's/[ \n]//g')

# Prefer podman if installed. Otherwise, fall back to docker.
if [ -x "$(command -v podman)" ]; then
    if [ "$(uname -s)" = "Linux" ]; then
        # Use host networking on Linux since host.containers.internal is unreachable in some environments.
        export BRIDGE_PLUGINS="${PLUGIN_NAME}=http://localhost:9001"
        podman run --pull always --rm -v $(pwd)/tmp:/mnt/config:Z --network=host --name=${CONSOLE_CONTAINER_NAME} --env "BRIDGE_*" $CONSOLE_IMAGE
    else
        export BRIDGE_PLUGINS="${PLUGIN_NAME}=http://host.containers.internal:9001"
        podman run --pull always --rm -v $(pwd)/tmp:/mnt/config:Z -p "$CONSOLE_PORT":9000 --name=${CONSOLE_CONTAINER_NAME} --env "BRIDGE_*" $CONSOLE_IMAGE
    fi
else
    BRIDGE_PLUGINS="${PLUGIN_NAME}=http://host.docker.internal:9001"
    docker run --pull always --rm -v $(pwd)/tmp:/mnt/config:Z -p "$CONSOLE_PORT":9000  --name=${CONSOLE_CONTAINER_NAME} --env-file <(set | grep ^BRIDGE | sed "s/'//g") $CONSOLE_IMAGE
fi
