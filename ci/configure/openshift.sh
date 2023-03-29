#!/bin/bash

set -ex
mkdir -p $(pwd)/tmp

BRIDGE_K8S_AUTH="bearer-token"
BRIDGE_USER_AUTH="disabled"
BRIDGE_K8S_MODE="off-cluster"
BRIDGE_K8S_MODE_OFF_CLUSTER_SKIP_VERIFY_TLS=true
BRIDGE_USER_SETTINGS_LOCATION="localstorage"

if [[ -n "${BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT-}" && -n "${BRIDGE_K8S_AUTH_BEARER_TOKEN-}" ]]; then
    # Setup with fixed cluster endpoint
    return
elif [[ -x "$(command -v oc)" && $(oc whoami --show-token) ]]; then
    # If we have oc tool and an Openshift token, assume we are connected to openshift
    BRIDGE_K8S_MODE_OFF_CLUSTER_THANOS=$(oc -n openshift-config-managed get configmap monitoring-shared-config -o jsonpath='{.data.thanosPublicURL}')
    BRIDGE_K8S_MODE_OFF_CLUSTER_ALERTMANAGER=$(oc -n openshift-config-managed get configmap monitoring-shared-config -o jsonpath='{.data.alertmanagerPublicURL}')
    BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT=$(oc whoami --show-server)
    BRIDGE_K8S_AUTH_BEARER_TOKEN=$(oc whoami --show-token 2>/dev/null)
else
    BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT=$(kubectl config view -o jsonpath="{.clusters[?(@.name==\"$(kubectl config current-context)\")].cluster.server}")
    BRIDGE_K8S_AUTH_BEARER_TOKEN="abcdef.0123456789abcdef"
fi
