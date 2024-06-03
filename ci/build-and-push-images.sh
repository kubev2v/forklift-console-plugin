
#!/usr/bin/env bash

set -euo pipefail

# For local registry run with:
#   FORKLIFT_PLUGIN_IMAGE=localhost:5001/kubev2v/forklift-console-plugin bash ./ci/build-and-push-images.sh
FORKLIFT_PLUGIN_IMAGE=${FORKLIFT_PLUGIN_IMAGE:="quay.io/kubev2v/forklift-console-plugin"}

# Build image
# -----------

echo ""
echo "Build plugin image"
echo "=================="

podman build --ulimit nofile=8192 --tag ${FORKLIFT_PLUGIN_IMAGE} -f build/Containerfile .

echo ""
echo "Push plugin image"
echo "=================="

podman push ${FORKLIFT_PLUGIN_IMAGE} --tls-verify=false

# To remove artefacts run:
#   podman system prune -a -f
