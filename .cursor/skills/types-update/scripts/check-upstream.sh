#!/bin/bash
#
# Fetch latest upstream versions for each type source.
#
# Usage: .cursor/skills/types-update/scripts/check-upstream.sh
#
# Outputs a summary table of latest available versions from each upstream repo.
# Uses the GitHub API (unauthenticated by default; set GITHUB_TOKEN for higher rate limits).
#

set -euo pipefail

AUTH_HEADER=""
if [ -n "${GITHUB_TOKEN:-}" ]; then
  AUTH_HEADER="-H Authorization: token ${GITHUB_TOKEN}"
fi

fetch_latest_tag() {
  local repo="$1"
  local result
  result=$(curl -sf ${AUTH_HEADER} \
    "https://api.github.com/repos/${repo}/releases/latest" 2>/dev/null \
    | jq -r '.tag_name // empty') || true
  echo "${result:-N/A}"
}

fetch_forklift_main_sha() {
  local result
  result=$(curl -sf ${AUTH_HEADER} \
    "https://api.github.com/repos/kubev2v/forklift/commits/main" 2>/dev/null \
    | jq -r '.sha[:7] // empty') || true
  echo "${result:-N/A}"
}

FORKLIFT_SHA=$(fetch_forklift_main_sha)
K8S_TAG=$(fetch_latest_tag "kubernetes/kubernetes")
KV_TAG=$(fetch_latest_tag "kubevirt/kubevirt")
CDI_TAG=$(fetch_latest_tag "kubevirt/containerized-data-importer")

echo "Latest Upstream Versions"
echo "========================"
echo ""
printf "%-14s %s\n" "Source" "Latest"
printf "%-14s %s\n" "----------" "----------"
printf "%-14s %s\n" "Forklift" "main ($FORKLIFT_SHA)"
printf "%-14s %s\n" "Kubernetes" "$K8S_TAG"
printf "%-14s %s\n" "KubeVirt" "$KV_TAG"
printf "%-14s %s\n" "CDI" "$CDI_TAG"
