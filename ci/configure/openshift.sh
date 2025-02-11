#
# This file provides functions to set up your environment to run the console against
# an OpenShift cluster during development.  It is used by `../start-console.sh` to
# setup for running the OpenShift console bridge.
#
# You'll need oc or kubectl, and you'll need to be logged into the target cluster.
#
# The environment variables beginning with "BRIDGE_" act just like bridge
# command line arguments.  To get more information about any of them, you can run:
#
#   podman run -t --rm quay.io/openshift/origin-console:latest /opt/bridge/bin/bridge --help
#

function oc_available_loggedin () {
    if [[ -x "$(command -v oc)" && $(oc whoami --show-token 2>/dev/null) ]]; then
        return 0
    else
        return 1
    fi
}

function setup_bridge_for_bearer_token () {
    BRIDGE_BASE_ADDRESS="http://localhost:${CONSOLE_PORT:-9000}"
    BRIDGE_K8S_MODE="off-cluster"
    BRIDGE_K8S_MODE_OFF_CLUSTER_SKIP_VERIFY_TLS=true
    BRIDGE_USER_SETTINGS_LOCATION="localstorage"

    BRIDGE_K8S_AUTH="bearer-token"
    BRIDGE_USER_AUTH="disabled"

    if [[ -n "${BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT-}" && -n "${BRIDGE_K8S_AUTH_BEARER_TOKEN-}" ]]; then
        echo  "Setup with fixed cluster endpoint and token"
    elif [[ -n "${BRIDGE_K8S_AUTH_BEARER_TOKEN-}" ]]; then
        echo "Setup with fixed cluster token"

        BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT=$(kubectl config view -o jsonpath="{.clusters[?(@.name==\"$(kubectl config current-context)\")].cluster.server}")
    elif oc_available_loggedin; then
        echo "Setup for Openshift environment"

        # If we have oc tool and an Openshift token, assume we are connected to openshift
        BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT=${BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT:=$(oc whoami --show-server)}
        BRIDGE_K8S_AUTH_BEARER_TOKEN=$(oc whoami --show-token 2>/dev/null)
    else
        echo "Setup for K8s environment"

        BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT=$(kubectl config view -o jsonpath="{.clusters[?(@.name==\"$(kubectl config current-context)\")].cluster.server}")
        BRIDGE_K8S_AUTH_BEARER_TOKEN="abcdef.0123456789abcdef"
    fi
}

function setup_bridge_for_openshift_oauth () {
    BRIDGE_BASE_ADDRESS="http://localhost:${CONSOLE_PORT:-9000}"
    BRIDGE_K8S_MODE="off-cluster"
    BRIDGE_K8S_MODE_OFF_CLUSTER_SKIP_VERIFY_TLS=true
    BRIDGE_USER_SETTINGS_LOCATION="localstorage"

    BRIDGE_K8S_AUTH="bearer-token"
    BRIDGE_K8S_AUTH_BEARER_TOKEN=$(oc whoami --show-token 2>/dev/null)

    if oc_available_loggedin; then
        BRIDGE_USER_AUTH_OIDC_CLIENT_ID="console-oauth-client-dev"
        setup_oauth_client "$(pwd)/tmp"

        BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT=${BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT:=$(oc whoami --show-server)}
    else
        echo "Please login to a cluster with 'oc' first"
        exit 1
    fi
}

function setup_oauth_client () {
    local __TEMP_DIR=$1
    [[ ! -d "${__TEMP_DIR}" ]] && mkdir -p "$__TEMP_DIR"

    # Create an oauth client
    local CLIENT=$(cat <<EOF
apiVersion: oauth.openshift.io/v1
kind: OAuthClient
metadata:
  name: ${BRIDGE_USER_AUTH_OIDC_CLIENT_ID}
grantMethod: auto
secret: very-secret-key-value
redirectURIs:
  - ${BRIDGE_BASE_ADDRESS}/auth/callback
EOF
)
    echo "$CLIENT"
    echo "$CLIENT" | oc apply -f -

    # Get the authclient secret:
    oc get oauthclient console-oauth-client-dev \
        -o jsonpath='{.secret}' > ${__TEMP_DIR}/console-client-secret

    # Get the authclient public key:
    oc get secrets -n default \
        --field-selector type=kubernetes.io/service-account-token -o json | \
        jq '.items[0].data."ca.crt"' -r | python -m base64 -d > ${__TEMP_DIR}/ca.crt

    # Fill in console bridge parameters (the files need to be mounted to the container)
    BRIDGE_USER_AUTH_OIDC_CA_FILE="/mnt/config/ca.crt"
    BRIDGE_USER_AUTH_OIDC_CLIENT_SECRET_FILE="/mnt/config/console-client-secret"
    BRIDGE_CA_FILE="/mnt/config/ca.crt"
}

