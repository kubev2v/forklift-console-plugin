
#!/usr/bin/env bash

set -euo pipefail

# Build image
# -----------

echo ""
echo "Build plugin image"
echo "=================="

podman build --tag localhost:5001/forklift-console-plugin -f build/Containerfile . 

echo ""
echo "Push plugin image"
echo "=================="

podman push localhost:5001/forklift-console-plugin --tls-verify=false

# To remove artefacts run:
#   podman system prune -a -f
