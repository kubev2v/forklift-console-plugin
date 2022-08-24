#!/usr/bin/env bash

set -euo pipefail

# Set minikube IP and token (see scripts/configure-minikube.shcut)
export BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT=${BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT:=https://$(minikube ip):8443}

# Default minkube home to user home, if MINIKUBE_HOME is not defined
MINIKUBE_HOME_=${MINIKUBE_HOME:=$HOME}
token=$(cat ${MINIKUBE_HOME_}/.minikube/files/etc/ca-certificates/token.csv 2>/dev/null | cut -f 1 -d,)
export BRIDGE_K8S_AUTH_BEARER_TOKEN=${BRIDGE_K8S_AUTH_BEARER_TOKEN:=${token}}

# Run console
# -----------

PLUGIN_NAME="forklift-console-plugin"
CONSOLE_IMAGE=${CONSOLE_IMAGE:="quay.io/openshift/origin-console:latest"}
CONSOLE_PORT=${CONSOLE_PORT:=9000}
INVENTORY_SERVER_HOST=${INVENTORY_SERVER_HOST:="http://localhost:8080"}
MUST_GATHER_API_SERVER_HOST=${MUST_GATHER_API_SERVER_HOST:="http://localhost:9200"}

export BRIDGE_K8S_AUTH=bearer-token
export BRIDGE_K8S_MODE=off-cluster
export BRIDGE_K8S_MODE_OFF_CLUSTER_SKIP_VERIFY_TLS=true
export BRIDGE_USER_AUTH=disabled

echo "API Token: $BRIDGE_K8S_AUTH_BEARER_TOKEN"
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
