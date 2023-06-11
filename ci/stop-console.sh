#!/usr/bin/env bash

set -euo pipefail

CONSOLE_CONTAINER_NAME=okd-console

pkill kubectl

# Test is console already running
if podman container exists ${CONSOLE_CONTAINER_NAME}; then
  podman container stop ${CONSOLE_CONTAINER_NAME}
else
  echo "can't find container named ${CONSOLE_CONTAINER_NAME}, exiting."
  exit 1
fi
