#!/usr/bin/env bash

set -euo pipefail

if [ -x "$(command -v podman)" ]; then
  CONTAINER_CMD=$(which podman)
else
  CONTAINER_CMD=$(which docker)
fi
CONSOLE_CONTAINER_NAME=okd-console

# Test is console already running
if ${CONTAINER_CMD} container exists ${CONSOLE_CONTAINER_NAME}; then
  ${CONTAINER_CMD} container stop ${CONSOLE_CONTAINER_NAME}
else
  echo "can't find container named ${CONSOLE_CONTAINER_NAME}, exiting."
  exit 1
fi
