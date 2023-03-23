#!/bin/bash

set -ex
mkdir -p $(pwd)/tmp

export BRIDGE_K8S_AUTH="bearer-token"
export BRIDGE_USER_AUTH="disabled"
export BRIDGE_K8S_MODE="off-cluster"
export BRIDGE_K8S_MODE_OFF_CLUSTER_SKIP_VERIFY_TLS=true
export BRIDGE_USER_SETTINGS_LOCATION="localstorage"

# If we have oc tool and an Openshift token, assume we are connected to openshift
if oc whoami --show-token; then
    export BRIDGE_K8S_MODE_OFF_CLUSTER_THANOS=$(oc -n openshift-config-managed get configmap monitoring-shared-config -o jsonpath='{.data.thanosPublicURL}')
    export BRIDGE_K8S_MODE_OFF_CLUSTER_ALERTMANAGER=$(oc -n openshift-config-managed get configmap monitoring-shared-config -o jsonpath='{.data.alertmanagerPublicURL}')
    export BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT=${BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT:=$(oc whoami --show-server)}
    export BRIDGE_K8S_AUTH_BEARER_TOKEN=${BRIDGE_K8S_AUTH_BEARER_TOKEN:=$(oc whoami --show-token 2>/dev/null)}
else
    export BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT=${BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT:=$(kubectl config view -o jsonpath="{.clusters[?(@.name==\"$(kubectl config current-context)\")].cluster.server}")}
    export BRIDGE_K8S_AUTH_BEARER_TOKEN=${BRIDGE_K8S_AUTH_BEARER_TOKEN:="abcdef.0123456789abcdef"}
fi
