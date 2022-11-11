#!/bin/bash

set -ex

# NOTE: this script requires OLM installed
if ! kubectl get CatalogSource 2>/dev/null; then
  echo "Error: Can't find OLM, OLM must be installed on the cluster, exit"
  exit 1
fi

FORKLIFT_IMAGE=quay.io/konveyor/forklift-operator-index:latest
FORKLIFT_NAMESPACE=konveyor-forklift

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
while ! kubectl get deployment -n ${FORKLIFT_NAMESPACE} forklift-operator; do sleep 30; done
kubectl wait deployment -n ${FORKLIFT_NAMESPACE} forklift-operator --for condition=Available=True --timeout=180s

cat << EOF | kubectl -n ${FORKLIFT_NAMESPACE} apply -f -
apiVersion: forklift.konveyor.io/v1beta1
kind: ForkliftController
metadata:
  name: forklift-controller
  namespace: ${FORKLIFT_NAMESPACE}
spec:
  feature_ui: false
  feature_auth_required: false
  feature_validation: true
  inventory_tls_enabled: false
  validation_tls_enabled: false
  must_gather_api_tls_enabled: false
  ui_tls_enabled: false
EOF
