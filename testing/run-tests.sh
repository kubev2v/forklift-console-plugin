#!/bin/bash
set -e

# ==============================================================================
# Optimized Script for running Playwright tests in a containerized environment.
#
# This script assumes the test repository and dependencies are already installed
# at build time. It only handles runtime configuration and test execution.
#
# Required Environment Variables:
#   - CLUSTER_NAME: Name of the OpenShift cluster to target.
#   - VSPHERE_PROVIDER: vSphere provider to use for testing.
#   - TEST_ARGS: (Optional) Arbitrary arguments for the playwright command.
#   - CLUSTER_PASSWORD: The password for the OCP cluster.
#   - PROVIDERS_JSON: The content of the .providers.json file.
#
# Mounted Volumes:
#   - /results: Directory to store test artifacts (reports, results).
#
# ==============================================================================

# --- Configuration and Defaults ---
# Use /results if WORKSPACE is not set (for container environment)
RESULTS_DIR="${WORKSPACE:-/results}"
TEST_ARGS=${TEST_ARGS:-"--grep=@downstream"}

log() {
    echo "--- $1 ---"
}

log "Validating environment and setting up credentials..."

if [ -z "$CLUSTER_NAME" ]; then
    echo "ERROR: CLUSTER_NAME environment variable is not set."
    exit 1
fi

if [ -z "$PROVIDERS_JSON" ]; then
    echo "ERROR: PROVIDERS_JSON environment variable is not set."
    exit 1
fi

if [ -z "$CLUSTER_PASSWORD" ]; then
    echo "ERROR: CLUSTER_PASSWORD environment variable is not set."
    exit 1
fi

log "Validation complete. Setting up runtime configuration..."
# Navigate to the test directory where dependencies are installed at build time
cd /test-repo/testing

log "Creating .providers.json from environment variable..."
echo "$PROVIDERS_JSON" > .providers.json

export BASE_ADDRESS="https://console-openshift-console.apps.${CLUSTER_NAME}.rhos-psi.cnv-qe.rhood.us"
export CI=true
export JENKINS=true
export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8
export NODE_TLS_REJECT_UNAUTHORIZED=0
export CLUSTER_USERNAME="kubeadmin"
export CLUSTER_PASSWORD=${CLUSTER_PASSWORD}
export VSPHERE_PROVIDER=${VSPHERE_PROVIDER}

log "Running Playwright tests..."
echo "  Cluster: ${CLUSTER_NAME}"
echo "  Base Address: ${BASE_ADDRESS}"
echo "  Playwright Args: ${TEST_ARGS}"


set +e
echo "Starting Playwright test execution..."
npx playwright test \
    ${TEST_ARGS} \
    --reporter=list,junit,html \
    --quiet
TEST_EXIT_CODE=$?
set -e

log "Tests finished with exit code: $TEST_EXIT_CODE"

mkdir -p "${RESULTS_DIR}"
[ -d "playwright-report" ] && cp -r "playwright-report" "${RESULTS_DIR}/"
[ -d "test-results" ] && cp -r "test-results" "${RESULTS_DIR}/"

exit $TEST_EXIT_CODE
