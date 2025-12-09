#!/bin/bash
set -e

# ==============================================================================
# Script for uploading test results to Report Portal.
#
# Required Environment Variables:
#   - JUNIT_XML: Path to junit.xml file
#   - CLUSTER_NAME: OCP cluster name  
#   - VSPHERE_PROVIDER: vSphere provider version
#   - TEST_TYPE: Test type (upstream/downstream/tier1/etc)
#   - KUBECONFIG_PATH: Path to kubeconfig file
#   - KUBE_PASSWORD: kubeadmin password
#   - BUILD_URL: (Optional) Jenkins build URL for launch description
#
# ==============================================================================

log() {
    local message="$1"
    echo "--- $message ---"
    return 0
}

log "Report Portal Upload Script"

# Validate required environment variables
for var in JUNIT_XML CLUSTER_NAME VSPHERE_PROVIDER TEST_TYPE KUBECONFIG_PATH KUBE_PASSWORD; do
    if [[ -z "${!var}" ]]; then
        echo "ERROR: $var environment variable is not set." >&2
        exit 1
    fi
done

if [[ ! -f "$JUNIT_XML" ]]; then
    echo "ERROR: junit.xml not found at $JUNIT_XML" >&2
    exit 1
fi

log "Logging into OpenShift cluster"
SERVER_URL=$(grep 'server:' "$KUBECONFIG_PATH" | awk '{print $2}' | head -n 1)
oc login --insecure-skip-tls-verify=true -u kubeadmin -p "$KUBE_PASSWORD" "$SERVER_URL"

log "Extracting cluster versions"
MTV_VERSION=$(oc get csv -n openshift-mtv -o jsonpath='{.items[*].spec.version}' | awk '{print $NF}')
OCP_VERSION=$(oc get clusterversion | grep -oE '([0-9]+\.)+[0-9]+' | tail -1)
CNV_VERSION=$(oc get csv -n openshift-cnv -o jsonpath='{.items[*].spec.version}')

# Handle empty versions
MTV_VERSION=${MTV_VERSION:-UNKNOWN}
OCP_VERSION=${OCP_VERSION:-UNKNOWN}
CNV_VERSION=${CNV_VERSION:-UNKNOWN}

# Build launch name and tags
LAUNCH_NAME="mtv-ui-${MTV_VERSION}-${VSPHERE_PROVIDER}-${TEST_TYPE}"
TAGS="{OCP_VERSION:${OCP_VERSION},MTV_VERSION:${MTV_VERSION},CNV_VERSION:${CNV_VERSION},VSPHERE_PROVIDER:${VSPHERE_PROVIDER},TEST_TYPE:${TEST_TYPE}}"

log "Report Portal Upload Configuration"
echo "  LAUNCH_NAME: $LAUNCH_NAME"
echo "  MTV VERSION: $MTV_VERSION"
echo "  OCP VERSION: $OCP_VERSION"
echo "  CNV VERSION: $CNV_VERSION"
echo "  TAGS: $TAGS"

log "Uploading to Report Portal"
cd /opt/rp-uploader
python3 src/rpuploader/rp_cli.py \
    --strategy Mtv \
    --xunit_feed "$JUNIT_XML" \
    --config mtv_conf.yaml \
    --launch_name "$LAUNCH_NAME" \
    --launch_description "${BUILD_URL:-local}" \
    --launch_tags "$TAGS"

log "Upload complete"

