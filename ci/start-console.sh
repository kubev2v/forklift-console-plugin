#!/usr/bin/env bash

set -euo pipefail
script_dir=$(dirname "$0")

CONSOLE_CONTAINER_NAME=okd-console

# Test is console already running
if podman container exists ${CONSOLE_CONTAINER_NAME}; then
  echo "container named ${CONSOLE_CONTAINER_NAME} is running, exit."
  exit 1
fi

# Start all local vars exports
set -a

if [[ $@ == *'--auth'* ]]; then
    source ${script_dir}/configure/openshift-auth.sh
else
    source ${script_dir}/configure/openshift.sh
fi

# Stop local vars exports
set +a

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
        "consoleAPIPath":"/api/proxy/plugin/${PLUGIN_NAME}/forklift-must-gather-api/",
        "endpoint":"${MUST_GATHER_API_SERVER_HOST}",
        "authorize":true
    }]}
END
)
export BRIDGE_PLUGIN_PROXY=$(echo ${PLUGIN_PROXY} | sed 's/[ \n]//g')

export BRIDGE_PLUGINS="${PLUGIN_NAME}=http://localhost:9001"
podman run --pull always --rm -v $(pwd)/tmp:/mnt/config:Z --network=host --name=${CONSOLE_CONTAINER_NAME} --env "BRIDGE_*" $CONSOLE_IMAGE
