#!/bin/bash

set -euo pipefail

# see: https://sigs.k8s.io/kind

if [ -x "$(command -v kind)" ]; then
  echo "kind already installed, exit"
  exit 0
fi

KIND_VERSION=v0.17.0
curl -LO https://kind.sigs.k8s.io/dl/${KIND_VERSION}/kind-linux-amd64

# test sha256sum
curl --silent -LO https://kind.sigs.k8s.io/dl/${KIND_VERSION}/kind-linux-amd64.sha256sum
cat kind-linux-amd64.sha256sum | sha256sum --check

# install
sudo install kind-linux-amd64 /usr/local/bin/kind
