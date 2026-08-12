#!/usr/bin/env bash
set -euo pipefail

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
- apiGroups: [""]
  resources: ["secrets"]
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
- apiGroups: [""]
  resources: ["secrets"]
  verbs: ["*"]
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

# Write tokens to a restricted file instead of stdout
TOKEN_ADMIN=$(kubectl get secret "${SERVICE_ACCOUNT}-admin" -n "${NAMESPACE}" -o=jsonpath='{.data.token}' | base64 -d)
TOKEN_USER=$(kubectl get secret "${SERVICE_ACCOUNT}-user" -n "${NAMESPACE}" -o=jsonpath='{.data.token}' | base64 -d)
TOKEN_READER=$(kubectl get secret "${SERVICE_ACCOUNT}-reader" -n "${NAMESPACE}" -o=jsonpath='{.data.token}' | base64 -d)

if [[ -z "${TOKEN_ADMIN}" || -z "${TOKEN_USER}" || -z "${TOKEN_READER}" ]]; then
  echo "Error: one or more service-account tokens are empty" >&2
  exit 1
fi

TOKEN_FILE="${NAMESPACE}/.env.forklift-tokens"
mkdir -p "${NAMESPACE}"
(
  umask 077
  tmp_file=$(mktemp "${TOKEN_FILE}.XXXXXX") || exit 1
  chmod 600 "${tmp_file}" || exit 1
  trap 'rm -f -- "${tmp_file}"' EXIT
  cat > "${tmp_file}" <<EOF
export TOKEN_ADMIN=${TOKEN_ADMIN}
export TOKEN_USER=${TOKEN_USER}
export TOKEN_READER=${TOKEN_READER}
EOF
  mv -f -- "${tmp_file}" "${TOKEN_FILE}"
  trap - EXIT
)

echo
echo "Tokens written to: ${TOKEN_FILE} (mode 0600)"
echo
echo "Usage:"
echo "  source ${TOKEN_FILE}"
echo "  export BRIDGE_K8S_AUTH_BEARER_TOKEN=\${TOKEN_ADMIN}"
echo "  npm run console"
