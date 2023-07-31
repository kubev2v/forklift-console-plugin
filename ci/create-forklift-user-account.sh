#!/usr/bin/env bash

# check if forklift-user account exist
export SERVICE_ACCOUNT=forklift
export NAMESPACE=default

# Function for creating forklift roles
# ------------------------------------
function setup_k8s_roles () {

  cat <<EOF | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: forklift-reader
rules:
- apiGroups: ["forklift.konveyor.io"]
  resources: ["*"]
  verbs: ["get", "watch", "list"]
- apiGroups: ["console.openshift.io"]
  resources: ["*"]
  verbs: ["get", "watch", "list"]
EOF

  cat <<EOF | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: forklift-user
rules:
- apiGroups: ["forklift.konveyor.io"]
  resources: ["*"]
  verbs: ["*"]
- apiGroups: ["console.openshift.io"]
  resources: ["*"]
  verbs: ["get", "watch", "list"]
EOF
}

# Function for creating a forklift-user service account
# $1 is the service account name
# ------------------------------------
function setup_servie_account () {
  service_account=$1

  cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: ${service_account}
  namespace: ${NAMESPACE}
automountServiceAccountToken: true
EOF

  cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Secret
metadata:
  name: ${service_account}
  namespace: ${NAMESPACE}
  annotations:
    kubernetes.io/service-account.name: ${service_account}
type: kubernetes.io/service-account-token
EOF
}

# Function for binding roles to service account
# $1 is the service account name
# $2 is the role
# ---------------------------------------------
function bind_service_accont_to_role () {
  service_account=$1
  role=$2

  cat <<EOF | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name:  ${service_account}
  namespace: ${NAMESPACE}
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: ${role} 
subjects:
- kind: ServiceAccount
  name:  ${service_account}
  namespace: ${NAMESPACE}
EOF
}


# Creare forklift user and reader roles
# -------------------------------------
setup_k8s_roles

echo "Creating/Updating service accounts ${SERVICE_ACCOUNT}, ${SERVICE_ACCOUNT}-user, ${SERVICE_ACCOUNT}-reader"

setup_servie_account ${SERVICE_ACCOUNT}-admin
bind_service_accont_to_role ${SERVICE_ACCOUNT}-admin cluster-admin

setup_servie_account ${SERVICE_ACCOUNT}-user
bind_service_accont_to_role ${SERVICE_ACCOUNT}-user forklift-user

setup_servie_account ${SERVICE_ACCOUNT}-reader
bind_service_accont_to_role ${SERVICE_ACCOUNT}-reader forklift-reader

# Print out tokens
export TOKEN_ADMIN=$(kubectl get secret ${SERVICE_ACCOUNT}-admin -n ${NAMESPACE} -o=jsonpath={.data.token} | base64 -d)
export TOKEN_USER=$(kubectl get secret ${SERVICE_ACCOUNT}-user -n ${NAMESPACE} -o=jsonpath={.data.token} | base64 -d)
export TOKEN_READER=$(kubectl get secret ${SERVICE_ACCOUNT}-reader -n ${NAMESPACE} -o=jsonpath={.data.token} | base64 -d)

echo
echo Tokens:
echo "-------"
echo forklift-admin:
echo export TOKEN_ADMIN=${TOKEN_ADMIN}
echo
echo forklift-user:
echo export TOKEN_USER=${TOKEN_USER}
echo
echo forklift-reader:
echo export TOKEN_READER=${TOKEN_READER}
echo
echo Note:
echo to use he tokens set BRIDGE_K8S_AUTH_BEARER_TOKEN
echo   export TOKEN_ADMIN=...
echo   export BRIDGE_K8S_AUTH_BEARER_TOKEN=$\{TOKEN_ADMIN \| TOKEN_USER \| TOKEN_READER\}
echo
echo before starting the bridge
echo   npm run console
