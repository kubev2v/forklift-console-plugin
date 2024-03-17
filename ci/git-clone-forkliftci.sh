#!/usr/bin/env bash

set -euo pipefail
script_dir=$(realpath $(dirname "$0"))
forkliftci_dir="${script_dir}/forkliftci"

echo ""
echo "Git clone forkliftci repository"
echo "==============================="
echo ""

# Check if the target directory exists and is a Git repository
if [ -d "$forkliftci_dir/.git" ]; then
    echo "forkliftci already exists in $forkliftci_dir."
else
    # If not, clone the repository into the target directory
    echo "Cloning the forkliftci into $forkliftci_dir..."

    # In case we are running CI as different user
    git clone https://github.com/kubev2v/forkliftci.git "$forkliftci_dir"
    chmod -R ugo+rwx "$forkliftci_dir"
fi
