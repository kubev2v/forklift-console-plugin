#!/bin/bash

# Source environment variables if they exist
if [ -f "$(dirname "$0")/e2e.env" ]; then
  source "$(dirname "$0")/e2e.env"
fi



docker run --rm -it \
  --volume "$(cd $(dirname "$0")/.. && pwd):/workspace" \
  --workdir /workspace/testing \
  --env JENKINS=true \
  --env CLUSTER_USERNAME=$CLUSTER_USERNAME \
  --env CLUSTER_PASSWORD=$CLUSTER_PASSWORD \
  --env BASE_ADDRESS=$BASE_ADDRESS \
  --env LC_ALL=en_US.UTF-8 \
  --env LANG=en_US.UTF-8 \
  --env LANGUAGE=en_US.UTF-8 \
  mcr.microsoft.com/playwright:v1.54.0-noble \
  bash -c "npm install && npx playwright test --grep @downstream"
