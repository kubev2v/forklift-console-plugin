#!/usr/bin/env bash

set -euo pipefail
script_dir=$(dirname "$0")
source ${script_dir}/configure/openshift.sh

# ============================================================================
# Additional plugins registry
#
# Each plugin is defined by a name, git URL, port, and optional subdirectory.
# Plugins are cloned to ../<name> (sibling of this repo) and started on their
# respective ports before the console container is launched.
#
# Compatible with bash 3.2+ (macOS default).
# ============================================================================

AVAILABLE_PLUGINS="monitoring-plugin networking-console-plugin nmstate-console-plugin kubevirt-plugin"

get_plugin_url() {
    case "$1" in
        monitoring-plugin)            echo "https://github.com/openshift/monitoring-plugin.git" ;;
        networking-console-plugin)    echo "https://github.com/openshift/networking-console-plugin.git" ;;
        nmstate-console-plugin)       echo "https://github.com/openshift/nmstate-console-plugin.git" ;;
        kubevirt-plugin)              echo "https://github.com/kubevirt-ui/kubevirt-plugin.git" ;;
        *) echo "" ;;
    esac
}

get_plugin_port() {
    case "$1" in
        monitoring-plugin)            echo "9002" ;;
        networking-console-plugin)    echo "9003" ;;
        nmstate-console-plugin)       echo "9004" ;;
        kubevirt-plugin)              echo "9005" ;;
        *) echo "" ;;
    esac
}

get_plugin_subdir() {
    case "$1" in
        monitoring-plugin) echo "web" ;;
        *) echo "" ;;
    esac
}

# ============================================================================
# Parse CLI arguments
# ============================================================================

USE_AUTH=false
EXTRA_PLUGINS="${DEFAULT_PLUGINS:-}"

while [[ $# -gt 0 ]]; do
    case $1 in
        --auth)
            USE_AUTH=true
            shift
            ;;
        --plugins)
            EXTRA_PLUGINS="${2:-}"
            if [[ -z "$EXTRA_PLUGINS" ]]; then
                echo "Error: --plugins requires a value (comma-separated list or 'all')"
                echo ""
                echo "Usage: $0 [--auth] [--plugins <name,...|all>]"
                echo ""
                echo "Available plugins:"
                for p in $AVAILABLE_PLUGINS; do echo "  - $p (port $(get_plugin_port "$p"))"; done
                exit 1
            fi
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [--auth] [--plugins <name,...|all>]"
            echo ""
            echo "Options:"
            echo "  --auth                Use OpenShift OAuth instead of bearer token"
            echo "  --plugins <list|all>  Load additional console plugins alongside forklift"
            echo "                        Comma-separated list, or 'all' for every plugin"
            echo ""
            echo "Environment variables:"
            echo "  DEFAULT_PLUGINS       Plugins to load when --plugins is not specified"
            echo "                        Same format as --plugins (comma-separated or 'all')"
            echo "                        --plugins overrides DEFAULT_PLUGINS when both are set"
            echo ""
            echo "Available plugins:"
            for p in $AVAILABLE_PLUGINS; do
                echo "  - $p (port $(get_plugin_port "$p"))"
            done
            echo ""
            echo "Examples:"
            echo "  $0                                     # forklift only"
            echo "  $0 --plugins monitoring-plugin          # forklift + monitoring"
            echo "  $0 --plugins monitoring-plugin,kubevirt-plugin"
            echo "  $0 --plugins all                        # forklift + all plugins"
            echo "  $0 --auth --plugins all                 # with OAuth + all plugins"
            exit 0
            ;;
        *)
            echo "Unknown argument: $1"
            echo "Run '$0 --help' for usage information"
            exit 1
            ;;
    esac
done

if [[ "$EXTRA_PLUGINS" == "all" ]]; then
    EXTRA_PLUGINS="$(echo $AVAILABLE_PLUGINS | tr ' ' ',')"
fi

# ============================================================================
# Default values with CLI overrides
# ============================================================================

CONSOLE_CONTAINER_NAME="${CONSOLE_CONTAINER_NAME:-okd-console}"
FORKLIFT_NAMESPACE="${FORKLIFT_NAMESPACE:-konveyor-forklift}"
BASE_HOST_URL="${BASE_HOST_URL:-https://localhost}"
PLUGIN_NAME="${PLUGIN_NAME:-forklift-console-plugin}"
PLUGIN_URL="${PLUGIN_URL:-http://localhost:9001}"
CONTAINER_NETWORK="${CONTAINER_NETWORK:---network=host}"
CONSOLE_IMAGE="${CONSOLE_IMAGE:-quay.io/openshift/origin-console:latest}"
CONSOLE_PORT="${CONSOLE_PORT:-9000}"
CONSOLE_PORT_PUBLISH="--publish=${CONSOLE_PORT}:${CONSOLE_PORT}"
CONSOLE_CONTAINER_NAME_RUN="--name=${CONSOLE_CONTAINER_NAME}"
PULL_POLICY="${PULL_POLICY:-always}"

# Use docker if available, otherwise fall back to podman
if command -v docker &> /dev/null && docker info &> /dev/null; then
    CONTAINER_RUNTIME="docker"
else
    CONTAINER_RUNTIME="podman"
fi

# Adjust settings for macOS
if [[ $(uname) = "Darwin" ]]; then
    # Docker uses host.docker.internal, Podman uses host.containers.internal
    if [ "$CONTAINER_RUNTIME" = "docker" ]; then
        BASE_HOST_URL="http://host.docker.internal"
    else
        BASE_HOST_URL="http://host.containers.internal"
    fi
    CONTAINER_NETWORK=""
    PLUGIN_URL="$BASE_HOST_URL:9001"
fi

# Look for forklift routes
if oc_available_loggedin && { [ -z "${INVENTORY_SERVER_HOST+x}" ] && [ -z "${SERVICES_API_SERVER_HOST+x}" ]; }; then
    routes=$(oc get routes -A -o template --template='{{range .items}}{{.spec.host}}{{"\n"}}{{end}}' 2>/dev/null || true)
    INVENTORY_SERVER_HOST="https://$(echo "$routes" | grep forklift-inventory)"
    SERVICES_API_SERVER_HOST="https://$(echo "$routes" | grep forklift-services)"
    OVA_PROXY_SERVER_HOST="https://$(echo "$routes" | grep forklift-ova-proxy || true)"
fi

# Default API server hosts
INVENTORY_SERVER_HOST="${INVENTORY_SERVER_HOST:-${BASE_HOST_URL}:30444}"
SERVICES_API_SERVER_HOST="${SERVICES_API_SERVER_HOST:-${BASE_HOST_URL}:30446}"
OVA_PROXY_SERVER_HOST="${OVA_PROXY_SERVER_HOST:-${BASE_HOST_URL}:30448}"

if [[ ${CONSOLE_IMAGE} =~ ^localhost/ ]]; then
    PULL_POLICY="never"
fi

# Test if console is already running
if [ "$CONTAINER_RUNTIME" = "docker" ]; then
    if docker container inspect ${CONSOLE_CONTAINER_NAME} &> /dev/null; then
        echo "Container named ${CONSOLE_CONTAINER_NAME} is running, exit."
        exit 1
    fi
else
    if podman container exists ${CONSOLE_CONTAINER_NAME}; then
        echo "Container named ${CONSOLE_CONTAINER_NAME} is running, exit."
        exit 1
    fi
fi

# Base setup for the bridge
if [[ "$USE_AUTH" == "true" ]]; then
    setup_bridge_for_openshift_oauth
else
    setup_bridge_for_bearer_token
fi

# ============================================================================
# Start additional plugins
# ============================================================================

BASE_DIR=$(pwd)

start_extra_plugin() {
    local name="$1"
    local url
    local port
    local subdir

    url="$(get_plugin_url "$name")"
    port="$(get_plugin_port "$name")"
    subdir="$(get_plugin_subdir "$name")"

    if [[ -z "$url" ]]; then
        echo "Error: Unknown plugin '$name'"
        echo "Available plugins: $AVAILABLE_PLUGINS"
        exit 1
    fi

    echo ""
    echo "Setting up plugin: $name (port $port)"
    echo "-------------------------------------------"

    # Clone if the sibling directory doesn't exist
    if [[ ! -d "../$name" ]]; then
        echo "Cloning $url ..."
        git clone "$url" "../$name"
    else
        echo "Directory ../$name already exists, pulling latest ..."
        (cd "../$name" && git pull)
    fi

    local work_dir="../$name"
    if [[ -n "$subdir" ]]; then
        work_dir="../$name/$subdir"
    fi

    # Kill any process already on this port
    local existing_pid
    existing_pid="$(lsof -t -i:"$port" 2>/dev/null || true)"
    if [[ -n "$existing_pid" ]]; then
        echo "Killing existing process on port $port (pid $existing_pid)"
        kill -9 "$existing_pid" 2>/dev/null || true
    fi

    # Install dependencies and start the dev server
    (
        cd "$work_dir"
        if [[ -f yarn.lock ]]; then
            echo "Detected yarn.lock - using yarn for $name"
            yarn install
            PORT=$port yarn start --port="$port" &
        else
            echo "Using npm for $name"
            npm ci
            PORT=$port npm run start -- --port="$port" &
        fi
    )

    # Build the plugin URL based on OS / runtime
    local plugin_host="http://localhost"
    if [[ $(uname) = "Darwin" ]]; then
        plugin_host="$BASE_HOST_URL"
    fi

    BRIDGE_PLUGINS="${BRIDGE_PLUGINS},$name=${plugin_host}:${port}"
    echo "Plugin $name will be available at ${plugin_host}:${port}"
}

# Configure bridge for our plugin (forklift is always loaded)
BRIDGE_PLUGINS="$PLUGIN_NAME=$PLUGIN_URL"

if [[ -n "$EXTRA_PLUGINS" ]]; then
    IFS=',' read -ra PLUGIN_LIST <<< "$EXTRA_PLUGINS"
    for plugin_name in "${PLUGIN_LIST[@]}"; do
        plugin_name=$(echo "$plugin_name" | xargs) # trim whitespace
        start_extra_plugin "$plugin_name"
    done
    cd "$BASE_DIR"
fi

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
    },
    {
        "consoleAPIPath":"/api/proxy/plugin/${PLUGIN_NAME}/forklift-ova-proxy/",
        "endpoint":"${OVA_PROXY_SERVER_HOST}",
        "authorize":true
    }
]}
END
)

# Export all variables with the prefix "BRIDGE_"
export $(compgen -v | grep '^BRIDGE_')

# Mount tmp dir if available
mount_tmp_dir_flag=""
if [[ -d "$(pwd)/tmp" ]]; then
    mount_tmp_dir_flag="-v $(pwd)/tmp:/mnt/config:Z"
fi

# Run the console container
echo "
Starting local OpenShift console...
===================================
API Server: ${BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT:-"Not Set"}
Console URL: ${BRIDGE_BASE_ADDRESS:-"Not Set"}
Console Image: ${CONSOLE_IMAGE}
Container pull policy: ${PULL_POLICY}

Plugins: ${BRIDGE_PLUGINS}
Inventory server URL: ${INVENTORY_SERVER_HOST}
Services server URL: ${SERVICES_API_SERVER_HOST}
OVA proxy server URL :${OVA_PROXY_SERVER_HOST}
Plugin proxy:
$(echo ${BRIDGE_PLUGIN_PROXY} | jq .)
"

# Build environment variable flags for Docker (doesn't support wildcard like podman)
BRIDGE_ENV_FLAGS=""
for var in $(compgen -v | grep '^BRIDGE_'); do
    BRIDGE_ENV_FLAGS="${BRIDGE_ENV_FLAGS} -e ${var}"
done

# Build container run command based on runtime
echo "Using container runtime: ${CONTAINER_RUNTIME}"

if [ "$CONTAINER_RUNTIME" = "docker" ]; then
    # Docker uses --platform for architecture, Rosetta 2 handles emulation well
    docker run \
        --pull=${PULL_POLICY} \
        --rm \
        --platform=linux/amd64 \
        ${BRIDGE_ENV_FLAGS} \
        ${mount_tmp_dir_flag} \
        ${CONTAINER_NETWORK} \
        ${CONSOLE_PORT_PUBLISH} \
        ${CONSOLE_CONTAINER_NAME_RUN} \
        ${CONSOLE_IMAGE}
else
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
fi
