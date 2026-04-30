#!/bin/bash
#
# Poll the npm registry until a specific version of @forklift-ui/types appears.
#
# Usage: .cursor/skills/types-update/scripts/poll-npm.sh <target-version>
#
# Example:
#   .cursor/skills/types-update/scripts/poll-npm.sh 1.0.9
#
# Polls every 30 seconds for up to 10 minutes (20 attempts).
# Exit 0 if version found, exit 1 on timeout.
#

set -euo pipefail

PACKAGE="@forklift-ui/types"
TARGET_VERSION="${1:?Usage: poll-npm.sh <target-version>}"
INTERVAL_SECONDS=30
MAX_ATTEMPTS=20

echo "Waiting for ${PACKAGE}@${TARGET_VERSION} to appear on npm..."
echo "Polling every ${INTERVAL_SECONDS}s (timeout: $((INTERVAL_SECONDS * MAX_ATTEMPTS))s)"
echo ""

for ((i = 1; i <= MAX_ATTEMPTS; i++)); do
  CURRENT=$(npm view "${PACKAGE}" version 2>/dev/null || echo "fetch-error")

  if [ "$CURRENT" = "$TARGET_VERSION" ]; then
    echo "Version ${TARGET_VERSION} is now live on npm!"
    echo "https://www.npmjs.com/package/${PACKAGE}/v/${TARGET_VERSION}"
    exit 0
  fi

  echo "  Attempt ${i}/${MAX_ATTEMPTS}: latest is ${CURRENT} (waiting for ${TARGET_VERSION})"
  sleep "$INTERVAL_SECONDS"
done

echo ""
echo "TIMEOUT: Version ${TARGET_VERSION} did not appear after $((INTERVAL_SECONDS * MAX_ATTEMPTS)) seconds."
echo "Check the GitHub Action: https://github.com/kubev2v/forklift-console-types/actions/workflows/release.yml"
exit 1
