#!/bin/bash

set -ex
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
BRIDGE_USER_AUTH_OIDC_CLIENT_SECRET_FILE="/mnt/config/console-client-secret"
BRIDGE_CA_FILE="/mnt/config/ca.crt"
BRIDGE_USER_AUTH_OIDC_CA_FILE="/mnt/config/ca.crt"

BRIDGE_BASE_ADDRESS="http://localhost:9000"
BRIDGE_K8S_MODE="off-cluster"
BRIDGE_K8S_AUTH="openshift"
BRIDGE_USER_AUTH="openshift"
BRIDGE_USER_AUTH_OIDC_CLIENT_ID="console-oauth-client-dev"
BRIDGE_K8S_MODE_OFF_CLUSTER_SKIP_VERIFY_TLS=true
BRIDGE_USER_SETTINGS_LOCATION="localstorage"
BRIDGE_K8S_MODE_OFF_CLUSTER_THANOS=$(oc -n openshift-config-managed get configmap monitoring-shared-config -o jsonpath='{.data.thanosPublicURL}')
BRIDGE_K8S_MODE_OFF_CLUSTER_ALERTMANAGER=$(oc -n openshift-config-managed get configmap monitoring-shared-config -o jsonpath='{.data.alertmanagerPublicURL}')

BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT=${BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT:=$(oc whoami --show-server)}
