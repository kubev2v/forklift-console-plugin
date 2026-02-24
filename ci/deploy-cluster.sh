#!/usr/bin/env bash

set -euo pipefail
script_dir=$(dirname "$0")

bash ${script_dir}/setup-registry.sh
bash ${script_dir}/create-kind-cluster.sh
