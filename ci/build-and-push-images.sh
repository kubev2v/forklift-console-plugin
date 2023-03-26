
#!/usr/bin/env bash

set -euo pipefail

# Check for container cmd
# -----------------------
echo ""
echo "Check for container command"
echo "============================"

if [ -x "$(command -v podman)" ]; then
  CONTAINER_CMD=$(which podman)
else
  CONTAINER_CMD=$(which docker)
fi

if ! [ -x "$(command -v ${CONTAINER_CMD})" ]; then
  echo "Error: can't find 'podman' or 'docker' command line utility, exit"
  exit 1
fi
echo "Found: ${CONTAINER_CMD}"

# Build image
# -----------

echo ""
echo "Build plugin image"
echo "=================="
${CONTAINER_CMD} build --tag localhost:5001/forklift-console-plugin -f build/Containerfile . 

echo ""
echo "Push plugin image"
echo "=================="
if [ -x "$(command -v podman)" ]; then
  podman push localhost:5001/forklift-console-plugin --tls-verify=false
else
  docker push localhost:5001/forklift-console-plugin
fi

echo ""
echo "Cleanup system images"
echo "====================="
${CONTAINER_CMD} system prune -a -f
