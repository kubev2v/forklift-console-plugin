
#!/usr/bin/env bash

set -euo pipefail

# For local registry run with:
#   FORKLIFT_PLUGIN_IMAGE=localhost:5001/kubev2v/forklift-console-plugin bash ./ci/build-and-push-images.sh
CONTAINER_CMD=${CONTAINER_CMD:=podman}
FORKLIFT_PLUGIN_IMAGE=${FORKLIFT_PLUGIN_IMAGE:="quay.io/kubev2v/forklift-console-plugin"}

# Build image
# -----------

echo ""
echo "Build plugin image"
echo "=================="

${CONTAINER_CMD} build --ulimit nofile=8192 --tag ${FORKLIFT_PLUGIN_IMAGE} -f build/Containerfile .

echo ""
echo "Push plugin image"
echo "=================="

PUSH_ARGS=""
if [ "${CONTAINER_CMD}" = "podman" ]; then
  PUSH_ARGS="--tls-verify=false"
fi
${CONTAINER_CMD} push ${FORKLIFT_PLUGIN_IMAGE} ${PUSH_ARGS}

# To remove artefacts run:
#   podman system prune -a -f
