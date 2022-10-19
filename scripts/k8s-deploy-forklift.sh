#!/bin/bash

set -ex

FORKLIFT_IMAGE=${FORKLIFT_IMAGE:=quay.io/konveyor/forklift-operator-index:latest}
FORKLIFT_NAMESPACE=konveyor-forklift

# Install olm
kubectl apply -f https://raw.githubusercontent.com/operator-framework/operator-lifecycle-manager/master/deploy/upstream/quickstart/crds.yaml
kubectl apply -f https://raw.githubusercontent.com/operator-framework/operator-lifecycle-manager/master/deploy/upstream/quickstart/olm.yaml

# Wait for olm operator to start
while ! kubectl get deployment -n olm olm-operator; do sleep 10; done
kubectl wait deployment -n olm olm-operator --for condition=Available=True --timeout=180s

# Install forklift-operator

cat << EOF | kubectl -n ${FORKLIFT_NAMESPACE} apply -f -
---
apiVersion: v1
kind: Namespace
metadata:
  name: ${FORKLIFT_NAMESPACE}
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
while ! kubectl get deployment -n ${FORKLIFT_NAMESPACE} forklift-operator; do sleep 10; done
kubectl wait deployment -n ${FORKLIFT_NAMESPACE} forklift-operator --for condition=Available=True --timeout=180s

cat << EOF | kubectl -n ${FORKLIFT_NAMESPACE} apply -f -
apiVersion: forklift.konveyor.io/v1beta1
kind: ForkliftController
metadata:
  name: forklift-controller
  namespace: ${FORKLIFT_NAMESPACE}
spec:
  feature_ui: false
  feature_validation: true
  inventory_tls_enabled: false
  validation_tls_enabled: false
  must_gather_api_tls_enabled: false
  ui_tls_enabled: false
EOF

echo Forklift: $FORK_RELEASE
