#!/usr/bin/env bash

set -x

kind delete cluster
podman stop kind-registry
podman rm kind-registry
rm -rf /tmp/kind-storage-*
