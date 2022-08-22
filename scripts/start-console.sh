#!/usr/bin/env bash

set -euo pipefail

PLUGIN_NAME="forklift-console-plugin"
CONSOLE_IMAGE=${CONSOLE_IMAGE:="quay.io/openshift/origin-console:latest"}
CONSOLE_PORT=${CONSOLE_PORT:=9000}
INVENTORY_SERVER_HOST=${INVENTORY_SERVER_HOST:="http://localhost:8080"}
MUST_GATHER_API_SERVER_HOST=${MUST_GATHER_API_SERVER_HOST:="http://localhost:9200"}

echo "Starting local OpenShift console..."

export BRIDGE_USER_AUTH="disabled"
export BRIDGE_K8S_MODE="off-cluster"
export BRIDGE_K8S_AUTH="bearer-token"
export BRIDGE_K8S_MODE_OFF_CLUSTER_SKIP_VERIFY_TLS=true
export BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT=$(oc whoami --show-server)
export BRIDGE_K8S_MODE_OFF_CLUSTER_THANOS=$(oc -n openshift-config-managed get configmap monitoring-shared-config -o jsonpath='{.data.thanosPublicURL}')
export BRIDGE_K8S_MODE_OFF_CLUSTER_ALERTMANAGER=$(oc -n openshift-config-managed get configmap monitoring-shared-config -o jsonpath='{.data.alertmanagerPublicURL}')
export BRIDGE_K8S_AUTH_BEARER_TOKEN=$(oc whoami --show-token 2>/dev/null)
export BRIDGE_USER_SETTINGS_LOCATION="localstorage"

echo "API Server: $BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT"
echo "Console Image: $CONSOLE_IMAGE"
echo "Console URL: http://localhost:${CONSOLE_PORT}"
echo "Inventory server URL: ${INVENTORY_SERVER_HOST}"
echo "Must gather API server URL: ${MUST_GATHER_API_SERVER_HOST}"

# Look for a forklift-inventory route
PLUGIN_PROXY=$(cat << END
{"services":[
    {
        "consoleAPIPath":"/api/proxy/plugin/forklift-console-plugin/forklift-inventory/",
        "endpoint":"${INVENTORY_SERVER_HOST}",
        "authorize":true
    },
    {
        "consoleAPIPath":"/api/proxy/plugin/forklift-console-plugin/must-gather-api/",
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
        podman run --pull always --rm --network=host --env "BRIDGE_*" $CONSOLE_IMAGE
    else
        export BRIDGE_PLUGINS="${PLUGIN_NAME}=http://host.containers.internal:9001"
        podman run --pull always --rm -p "$CONSOLE_PORT":9000 --env "BRIDGE_*" $CONSOLE_IMAGE
    fi
else
    BRIDGE_PLUGINS="${PLUGIN_NAME}=http://host.docker.internal:9001"
    docker run --pull always --rm -p "$CONSOLE_PORT":9000 --env-file <(set | grep ^BRIDGE | sed "s/'//g") $CONSOLE_IMAGE
fi
