#!/usr/bin/env bash

set -euo pipefail

# check if forklift-user account exist
export SERVICE_ACCOUNT=forklift-user
export NAMESPACE=default

function setup_servie_account_token () {
# Create forklift-user service account
# ------------------------------------
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: ${SERVICE_ACCOUNT}
  namespace: ${NAMESPACE}
automountServiceAccountToken: true
EOF

cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Secret
metadata:
  name: ${SERVICE_ACCOUNT}
  namespace: ${NAMESPACE}
  annotations:
    kubernetes.io/service-account.name: ${SERVICE_ACCOUNT}
type: kubernetes.io/service-account-token
EOF

# Make forklift-user an admin
# ---------------------------
kubectl create clusterrolebinding ${SERVICE_ACCOUNT}-forklift-user \
  --clusterrole=cluster-admin \
  --serviceaccount=${NAMESPACE}:${SERVICE_ACCOUNT}
}

if kubectl get serviceaccount ${SERVICE_ACCOUNT} -n ${NAMESPACE} >/dev/null 2>&1 ; then
    echo "Service account ${SERVICE_ACCOUNT} already exist"
else
    echo "Creating service account ${SERVICE_ACCOUNT}"

    setup_servie_account_token
fi

# Print out token
export TOKEN=$(kubectl get secret ${SERVICE_ACCOUNT} -n ${NAMESPACE} -o=jsonpath={.data.token} | base64 -d)

echo "Token:"
echo "------"
echo ${TOKEN}
echo