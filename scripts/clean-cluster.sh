#!/usr/bin/env bash

set -x

# This is a distructive operation
read -r -p "Do you want to delete the instance? [y/N]: " response
response=${response,,} # tolower

if [[ "$response" =~ ^(yes|y)$ ]]; then
    echo "Deleting the instance"

    kind delete cluster
    podman stop kind-registry
    podman rm kind-registry
    rm -rf /tmp/kind-storage-*
fi
