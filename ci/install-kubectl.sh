#!/bin/bash

set -euo pipefail

# see: https://kubernetes.io/docs/reference/kubectl/kubectl

if [ -x "$(command -v kubectl)" ]; then
  echo "kubectl already installed, exit"
  exit 0
fi

curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
install kubectl /usr/local/bin/kubectl
