#!/usr/bin/env bash

set -euo pipefail
script_dir=$(dirname "$0")
echo "🔍 Debug: script_dir=$script_dir"
source ${script_dir}/configure/openshift.sh

echo "🔍 Debug: Initial variable values:"
echo "  CONSOLE_CONTAINER_NAME=${CONSOLE_CONTAINER_NAME:-okd-console}"
echo "  FORKLIFT_NAMESPACE=${FORKLIFT_NAMESPACE:-konveyor-forklift}"
echo "  BASE_HOST_URL=${BASE_HOST_URL:-https://localhost}"
echo "  PLUGIN_NAME=${PLUGIN_NAME:-forklift-console-plugin}"
echo "  PLUGIN_URL=${PLUGIN_URL:-http://localhost:9001}"
echo "  CONTAINER_NETWORK=${CONTAINER_NETWORK:---network=host}"
echo "  CONSOLE_IMAGE=${CONSOLE_IMAGE:-quay.io/openshift/origin-console:latest}"
echo "  CONSOLE_PORT=${CONSOLE_PORT:-9000}"
echo "  PULL_POLICY=${PULL_POLICY:-always}"

# Adjust settings for macOS
if [[ $(uname) = "Darwin" ]]; then
    echo "🔍 Debug: Detected macOS, adjusting BASE_HOST_URL and PLUGIN_URL"
    BASE_HOST_URL="http://host.containers.internal"
    CONTAINER_NETWORK=""
    PLUGIN_URL="$BASE_HOST_URL:9001"
fi

echo "🔍 Debug: Checking OpenShift routes..."
if oc_available_loggedin && { [ -z "${INVENTORY_SERVER_HOST+x}" ] && [ -z "${SERVICES_API_SERVER_HOST+x}" ]; }; then
    routes=$(oc get routes -A -o template --template='{{range .items}}{{.spec.host}}{{"\n"}}{{end}}' 2>/dev/null || true)
    echo "🔍 Debug: Found routes: $routes"
    INVENTORY_SERVER_HOST="https://$(echo "$routes" | grep forklift-inventory || true)"
    SERVICES_API_SERVER_HOST="https://$(echo "$routes" | grep forklift-services || true)"
fi

echo "🔍 Debug: INVENTORY_SERVER_HOST=$INVENTORY_SERVER_HOST"
echo "🔍 Debug: SERVICES_API_SERVER_HOST=$SERVICES_API_SERVER_HOST"

echo "🔍 Debug: Checking if console image is local..."
if [[ ${CONSOLE_IMAGE} =~ ^localhost/ ]]; then
    echo "🔍 Debug: Local console image detected, setting PULL_POLICY=never"
    PULL_POLICY="never"
fi

# Test if console is already running
if podman container exists ${CONSOLE_CONTAINER_NAME}; then
    echo "🔍 Debug: Container named ${CONSOLE_CONTAINER_NAME} is running, exit."
    exit 1
else
    echo "🔍 Debug: No running container named ${CONSOLE_CONTAINER_NAME} detected."
fi

# Base setup for the bridge
if [[ ${1:-} == '--auth' ]]; then
    echo "🔍 Debug: Running setup_bridge_for_openshift_oauth"
    setup_bridge_for_openshift_oauth
else
    echo "🔍 Debug: Running setup_bridge_for_bearer_token"
    setup_bridge_for_bearer_token
fi

# Configure bridge for our plugin
echo "🔍 Debug: Setting BRIDGE_PLUGINS and BRIDGE_PLUGIN_PROXY"
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

echo "🔍 Debug: Exporting BRIDGE_* variables"
export $(compgen -v | grep '^BRIDGE_')

# Set up container run parameters
CONSOLE_PORT_PUBLISH="-p ${CONSOLE_PORT}:9000"
CONSOLE_CONTAINER_NAME_RUN="--name ${CONSOLE_CONTAINER_NAME}"

# Mount tmp dir if available
mount_tmp_dir_flag=""
if [[ -d "$(pwd)/tmp" ]]; then
    echo "🔍 Debug: Mounting tmp dir"
    mount_tmp_dir_flag="-v $(pwd)/tmp:/mnt/config:Z"
fi

echo "🔍 Debug: podman run command about to execute"
echo "  podman run --pull=${PULL_POLICY} --rm --env 'BRIDGE_*' --arch=amd64 ${mount_tmp_dir_flag} ${CONTAINER_NETWORK} ${CONSOLE_PORT_PUBLISH} ${CONSOLE_CONTAINER_NAME_RUN} ${CONSOLE_IMAGE}"

# Run the console container
echo "\nStarting local OpenShift console...\n===================================\nAPI Server: ${BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT:-"Not Set"}\nConsole URL: ${BRIDGE_BASE_ADDRESS:-"Not Set"}\nConsole Image: ${CONSOLE_IMAGE}\nContainer pull policy: ${PULL_POLICY}\n\nPlugins: ${BRIDGE_PLUGINS}\nInventory server URL: ${INVENTORY_SERVER_HOST}\nServices server URL: ${SERVICES_API_SERVER_HOST}\nPlugin proxy:\n$(echo ${BRIDGE_PLUGIN_PROXY} | jq .)\n"

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