#!/bin/bash
# ---------------------------------------------------------------------------
# Verify every downstream test has requireVersion gating.
#
# Sets FORKLIFT_VERSION=0.0.0 so every gated test is skipped (0.0.0 is below
# every minimum). Then checks the JSON report: if any test was NOT skipped,
# that test is missing a requireVersion call.
#
# Usage:
#   npm run check:version-gating        (from testing/)
#   bash check-version-gating.sh        (directly)
# ---------------------------------------------------------------------------
set -euo pipefail

REPORT_FILE=$(mktemp).json
trap 'rm -f "$REPORT_FILE"' EXIT

echo "Running downstream tests with FORKLIFT_VERSION=0.0.0 ..."

FORKLIFT_VERSION=0.0.0 \
PLAYWRIGHT_JSON_OUTPUT_NAME="$REPORT_FILE" \
npx playwright test \
  --grep @downstream \
  --project=chromium \
  --reporter=json \
  || true

# Parse the JSON report and check for non-skipped tests
node -e "
  const fs = require('fs');
  const report = JSON.parse(fs.readFileSync('$REPORT_FILE', 'utf8'));

  const walk = (suites) =>
    suites.flatMap((s) => [
      ...(s.specs || []).flatMap((spec) =>
        (spec.tests || [])
          .filter((t) => t.status !== 'skipped')
          .map(() => spec.title)
      ),
      ...walk(s.suites || []),
    ]);

  const ungated = walk(report.suites || []);

  if (ungated.length > 0) {
    console.error('ERROR: Found downstream tests missing requireVersion:');
    ungated.forEach((t) => console.error('  -', t));
    process.exit(1);
  }

  console.log('All downstream tests are properly version-gated.');
"
