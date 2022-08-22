#!/usr/bin/env bash

set -euo pipefail

PLUGIN_NAME="forklift-console-plugin"
CONSOLE_IMAGE=${CONSOLE_IMAGE:="quay.io/openshift/origin-console:latest"}
CONSOLE_PORT=${CONSOLE_PORT:=9000}

# Guess inventory server URL
INVENTORY_SERVER_HOST_FALLBACK="127.0.0.1:8080"
MUST_GATHER_API_SERVER_HOST_FALLBACK="127.0.0.1:9200"
INVENTORY_SERVER_HOST_=$(oc get routes -o custom-columns=HOST:.spec.host -A | (grep 'forklift-inventory' || echo ${INVENTORY_SERVER_HOST_FALLBACK})  | head -n 1)
MUST_GATHER_API_SERVER_HOST_=$(oc get routes -o custom-columns=HOST:.spec.host -A | (grep 'forklift-mustgather' || echo ${MUST_GATHER_API_SERVER_HOST_FALLBACK}) | head -n 1)
INVENTORY_SERVER_HOST=https://${INVENTORY_SERVER_HOST:=${INVENTORY_SERVER_HOST_}}
MUST_GATHER_API_SERVER_HOST=https://${MUST_GATHER_API_SERVER_HOST:=${MUST_GATHER_API_SERVER_HOST_}}

echo "Starting local OpenShift console with oauth login..."

# For authenticated run:
mkdir -p $(pwd)/tmp

# Create an oauth client
cat <<EOF | oc apply -f -
apiVersion: oauth.openshift.io/v1
kind: OAuthClient
metadata:
  name: console-oauth-client-dev
grantMethod: auto
secret: very-secret-key-value
redirectURIs:
  - http://localhost:9000/auth/callback
EOF

# Get the authclient secret:
oc get oauthclient console-oauth-client-dev \
   -o jsonpath='{.secret}' > $(pwd)/tmp/console-client-secret

# Get the authclient public key:
oc get secrets -n default \
   --field-selector type=kubernetes.io/service-account-token -o json | \
   jq '.items[0].data."ca.crt"' -r | python -m base64 -d > $(pwd)/tmp/ca.crt

# Fill in console bridge parameters
export BRIDGE_USER_AUTH_OIDC_CLIENT_SECRET_FILE="/mnt/config/console-client-secret"
export BRIDGE_CA_FILE="/mnt/config/ca.crt"
export BRIDGE_USER_AUTH_OIDC_CA_FILE="/mnt/config/ca.crt"

export BRIDGE_BASE_ADDRESS="http://localhost:9000"
export BRIDGE_K8S_MODE="off-cluster"
export BRIDGE_K8S_AUTH="openshift"
export BRIDGE_USER_AUTH="openshift"
export BRIDGE_USER_AUTH_OIDC_CLIENT_ID="console-oauth-client-dev"
export BRIDGE_K8S_MODE_OFF_CLUSTER_SKIP_VERIFY_TLS=true
export BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT=$(oc whoami --show-server)
export BRIDGE_K8S_MODE_OFF_CLUSTER_THANOS=$(oc -n openshift-config-managed get configmap monitoring-shared-config -o jsonpath='{.data.thanosPublicURL}')
export BRIDGE_K8S_MODE_OFF_CLUSTER_ALERTMANAGER=$(oc -n openshift-config-managed get configmap monitoring-shared-config -o jsonpath='{.data.alertmanagerPublicURL}')
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
        podman run --pull always --rm -v $(pwd)/tmp:/mnt/config:Z --network=host --env "BRIDGE_*" $CONSOLE_IMAGE
    else
        export BRIDGE_PLUGINS="${PLUGIN_NAME}=http://host.containers.internal:9001"
        podman run --pull always --rm -v $(pwd)/tmp:/mnt/config:Z -p "$CONSOLE_PORT":9000 --env "BRIDGE_*" $CONSOLE_IMAGE
    fi
else
    BRIDGE_PLUGINS="${PLUGIN_NAME}=http://host.docker.internal:9001"
    docker run --pull always --rm -v $(pwd)/tmp:/mnt/config:Z -p "$CONSOLE_PORT":9000 --env-file <(set | grep ^BRIDGE | sed "s/'//g") $CONSOLE_IMAGE
fi
