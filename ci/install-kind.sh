#!/bin/bash

set -euo pipefail

# see: https://sigs.k8s.io/kind

if [ -x "$(command -v kind)" ]; then
  echo "kind already installed, exit"
  exit 0
fi

VERSION=v0.17.0
curl --silent -LO https://kind.sigs.k8s.io/dl/${VERSION}/kind-linux-amd64
curl --silent -LO https://kind.sigs.k8s.io/dl/${VERSION}/kind-linux-amd64.sha256sum

cat kind-linux-amd64.sha256sum | sha256sum --check

sudo install kind-linux-amd64 /usr/local/bin/kind
