#!/usr/bin/env bash

set -euo pipefail
script_dir=$(dirname "$0")
source ${script_dir}/configure/openshift.sh

CONSOLE_CONTAINER_NAME="okd-console"
FORKLIFT_NAMESPACE="konveyor-forklift"

BASE_HOST_URL="https://localhost"

PLUGIN_NAME="forklift-console-plugin"
PLUGIN_URL="http://localhost:9001"

CONTAINER_NETWORK="--network=host"

CONSOLE_IMAGE="quay.io/openshift/origin-console:latest"
CONSOLE_PORT="9000"
CONSOLE_PORT_PUBLISH="--publish=$CONSOLE_PORT:$CONSOLE_PORT"
CONSOLE_CONTAINER_NAME_RUN="--name=$CONSOLE_CONTAINER_NAME"

# On macOS
if [[ $(uname) = "Darwin" ]]; then
    BASE_HOST_URL="http://host.containers.internal"
    CONTAINER_NETWORK=""
    PLUGIN_URL="$BASE_HOST_URL:9001"
fi

# Default to localhost
INVENTORY_SERVER_HOST="$BASE_HOST_URL:30444"
SERVICES_API_SERVER_HOST="$BASE_HOST_URL:30446"

# Look for forklift routes
if oc_available_loggedin; then
    routes=$(oc get routes -A -o template --template='{{range .items}}{{.spec.host}}{{"\n"}}{{end}}' 2>/dev/null || true)
    INVENTORY_SERVER_HOST="https://$(echo "$routes" | grep forklift-inventory)"
    SERVICES_API_SERVER_HOST="https://$(echo "$routes" | grep forklift-services)"
fi

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
#
# NOTE: When running KinD we should use host network type because KinD only listen on localhost.
BRIDGE_PLUGINS="$PLUGIN_NAME=$PLUGIN_URL"
BRIDGE_PLUGIN_PROXY=$(
    cat <<END | jq -c .
{"services":[
    {
        "consoleAPIPath":"/api/proxy/plugin/${PLUGIN_NAME}/forklift-inventory/",
        "endpoint":"${INVENTORY_SERVER_HOST}",
        "authorize":true
    },
    {
        "consoleAPIPath":"/api/proxy/plugin/${PLUGIN_NAME}/forklift-services/",
        "endpoint":"${SERVICES_API_SERVER_HOST}",
        "authorize":true
    }
]}
END
)

# export all variables with the prefix "BRIDGE_"...
export $(compgen -v | grep '^BRIDGE_')

# mount tmp dir if available
if [[ -d "$(pwd)/tmp" ]]; then
    mount_tmp_dir_flag="-v $(pwd)/tmp:/mnt/config:Z"
else
    mount_tmp_dir_flag=""
fi

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
Services server URL: ${SERVICES_API_SERVER_HOST}
Plugin proxy:
$(echo ${BRIDGE_PLUGIN_PROXY} | jq .)
"

podman run \
    --pull=${PULL_POLICY} \
    --rm \
    --env "BRIDGE_*" \
    --arch=amd64 \
    ${mount_tmp_dir_flag} \
    ${CONTAINER_NETWORK} \
    ${CONSOLE_PORT_PUBLISH} \
    ${CONSOLE_CONTAINER_NAME_RUN} \
    ${CONSOLE_IMAGE}
