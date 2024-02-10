#!/bin/bash

set -euo pipefail
script_dir=$(dirname "$0")

K8S_TIMEOUT=${K8S_TIMEOUT:="360s"}

# NOTE: this script requires OLM installed
if ! kubectl get CatalogSource 2>/dev/null; then
  bash ${script_dir}/deploy-olm.sh
fi

echo ""
echo "Installing forklift operator"
echo "============================"

FORKLIFT_IMAGE=quay.io/kubev2v/forklift-operator-index:latest
FORKLIFT_NAMESPACE=konveyor-forklift
MIGRATION_NAMESPACE=konveyor-migration

cat << EOF | kubectl apply -f -
---
apiVersion: v1
kind: Namespace
metadata:
  name: ${FORKLIFT_NAMESPACE}
EOF

cat << EOF | kubectl -n ${FORKLIFT_NAMESPACE} apply -f -
---
apiVersion: operators.coreos.com/v1alpha1
kind: CatalogSource
metadata:
  name: konveyor-forklift
  namespace: ${FORKLIFT_NAMESPACE}
spec:
  displayName: Forklift Operator
  publisher: Konveyor
  sourceType: grpc
  image: ${FORKLIFT_IMAGE}
---
apiVersion: operators.coreos.com/v1
kind: OperatorGroup
metadata:
  name: migration
  namespace: ${FORKLIFT_NAMESPACE}
spec:
  targetNamespaces:
    - ${FORKLIFT_NAMESPACE}
---
apiVersion: operators.coreos.com/v1alpha1
kind: Subscription
metadata:
  name: forklift-operator
  namespace: ${FORKLIFT_NAMESPACE}
spec:
  channel: development
  installPlanApproval: Automatic
  name: forklift-operator
  source: ${FORKLIFT_NAMESPACE}
  sourceNamespace: ${FORKLIFT_NAMESPACE}
EOF

# --------------------

# Wait for forklift operator to start, and create a controller instance
echo ""
echo "Waiting for forklift-operator (may take a few minutes)"
echo "======================================================"

while ! kubectl get deployment -n ${FORKLIFT_NAMESPACE} forklift-operator; do sleep 30; done
kubectl wait deployment -n ${FORKLIFT_NAMESPACE} forklift-operator --for condition=Available=True --timeout=${K8S_TIMEOUT}

echo ""
echo "Installing forklift instance"
echo "============================"

cat << EOF | kubectl -n ${FORKLIFT_NAMESPACE} apply -f -
apiVersion: forklift.konveyor.io/v1beta1
kind: ForkliftController
metadata:
  name: forklift-controller
  namespace: ${FORKLIFT_NAMESPACE}
spec:
  feature_ui: false
  feature_ui_plugin: false,
  feature_auth_required: false
  feature_validation: true
  ui_tls_enabled: false
  inventory_container_requests_cpu: "50m"
  validation_container_requests_cpu: "50m"
  controller_container_requests_cpu: "50m"
  api_container_requests_cpu: "50m"
EOF

# Wait for forklift inventory service, then expose it on port 30088
while ! kubectl get service -n ${FORKLIFT_NAMESPACE} forklift-inventory; do sleep 30; done
kubectl patch service -n ${FORKLIFT_NAMESPACE} forklift-inventory --type='merge' \
  -p '{"spec":{"type":"NodePort","ports":[{"name":"api-https","protocol":"TCP","targetPort":8443,"port":8443,"nodePort":30444}]}}'

# secondary namespace used in test data
cat << EOF | kubectl apply -f -
---
apiVersion: v1
kind: Namespace
metadata:
  name: ${MIGRATION_NAMESPACE}
EOF
