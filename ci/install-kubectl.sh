#!/bin/bash

set -euo pipefail

# see: https://kubernetes.io/docs/reference/kubectl/kubectl

if [ -x "$(command -v kubectl)" ]; then
  echo "kubectl already installed, exit"
  exit 0
fi

KUBECTL_VERSION="$(curl -L -s https://dl.k8s.io/release/stable.txt)"
curl -LO "https://dl.k8s.io/release/$KUBECTL_VERSION/bin/linux/amd64/kubectl"

# test sha256sum
curl --silent -LO "https://dl.k8s.io/$KUBECTL_VERSION/bin/linux/amd64/kubectl.sha256"
echo "$(cat kubectl.sha256)  kubectl" | sha256sum --check

# install
sudo install kubectl /usr/local/bin/kubectl
