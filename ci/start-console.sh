#!/usr/bin/env bash

set -euo pipefail
script_dir=$(dirname "$0")
source ${script_dir}/configure/openshift.sh

CONSOLE_CONTAINER_NAME=okd-console

PLUGIN_NAME="forklift-console-plugin"
CONSOLE_IMAGE=${CONSOLE_IMAGE:-"quay.io/openshift/origin-console:latest"}
CONSOLE_PORT=${CONSOLE_PORT:-9000}
INVENTORY_SERVER_HOST=${INVENTORY_SERVER_HOST:-"http://localhost:30088"}
MUST_GATHER_API_SERVER_HOST=${MUST_GATHER_API_SERVER_HOST:-"http://localhost:30089"}

if [[ ${CONSOLE_IMAGE} =~ ^localhost/ ]]; then
    PULL_POLICY="never"
else
    PULL_POLICY=${PULL_POLICY:-"always"}
fi

# Test if console is already running
if podman container exists ${CONSOLE_CONTAINER_NAME}; then
  echo "container named ${CONSOLE_CONTAINER_NAME} is running, exit."
  exit 1
fi

# Base setup for the bridge
if [[ $@ == *'--auth'* ]]; then
    setup_bridge_for_openshift_oauth
else
    setup_bridge_for_bearer_token
fi

# Configure bridge for our plugin (console container to plugin dev server on container host)
#      When the container network is type host, localhost == container host
#      When the container network is default, host.containers.internal == container host
BRIDGE_PLUGINS="${PLUGIN_NAME}=http://host.containers.internal:9001"
BRIDGE_PLUGIN_PROXY=$(cat << END | jq -c .
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
    }
]}
END
)

# export all variables with the prefix "BRIDGE_"...
export $(compgen -v | grep '^BRIDGE_')

# run the console container
echo "
Starting local OpenShift console...
===================================
API Server: ${BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT}
Console URL: ${BRIDGE_BASE_ADDRESS}
Console Image: ${CONSOLE_IMAGE}
Container pull policy: ${PULL_POLICY}

Plugins: ${BRIDGE_PLUGINS}
Inventory server URL: ${INVENTORY_SERVER_HOST}
Must gather API server URL: ${MUST_GATHER_API_SERVER_HOST}
Plugin proxy:
$(echo ${BRIDGE_PLUGIN_PROXY} | jq .)
"

podman run \
    --pull=${PULL_POLICY} \
    --rm \
    -v $(pwd)/tmp:/mnt/config:Z \
    --publish=${CONSOLE_PORT}:${CONSOLE_PORT} \
    --name=${CONSOLE_CONTAINER_NAME} \
    --env "BRIDGE_*" \
    ${CONSOLE_IMAGE}
