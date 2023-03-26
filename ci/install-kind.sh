#!/bin/bash

set -euo pipefail

# see: https://sigs.k8s.io/kind

if [ -x "$(command -v kind)" ]; then
  echo "kind already installed, exit"
  exit 0
fi

export VERSION=v0.17.0
curl -LO https://kind.sigs.k8s.io/dl/${VERSION}/kind-linux-amd64
sudo install kind-linux-amd64 /usr/local/bin/kind
