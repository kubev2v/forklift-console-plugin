#!/bin/bash
set -e

# ==============================================================================
# Script for running Playwright tests in a containerized environment.
#
# This script uses pre-copied test files from the local repository and 
# executes Playwright tests based on environment variables.
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

log "Container Image Information"
echo "  Version: ${IMAGE_VERSION:-unknown}"
echo "  Git Commit: ${IMAGE_GIT_COMMIT:-unknown}"
echo "  Build Date: ${IMAGE_BUILD_DATE:-unknown}"
echo ""

cd /test-runner

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

log "Validation complete. Using pre-copied test files from /test-runner"

log "Creating .providers.json from environment variable..."
echo "$PROVIDERS_JSON" > .providers.json

export BASE_ADDRESS="https://console-openshift-console.apps.${CLUSTER_NAME}.rhos-psi.cnv-qe.rhood.us"
export CI=true
export JENKINS=true
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
yarn playwright test \
    ${TEST_ARGS}
TEST_EXIT_CODE=$?
set -e

log "Tests finished with exit code: $TEST_EXIT_CODE"

mkdir -p "${RESULTS_DIR}"
[ -d "playwright-report" ] && cp -r "playwright-report" "${RESULTS_DIR}/"
[ -d "test-results" ] && cp -r "test-results" "${RESULTS_DIR}/"

exit $TEST_EXIT_CODE
