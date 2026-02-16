#!/bin/bash
# ---------------------------------------------------------------------------
# Verify every downstream test has requireVersion gating.
#
# Sets FORKLIFT_VERSION=0.0.0 so every gated test is skipped (0.0.0 is below
# every minimum). Then checks the JSON report: every test must be skipped AND
# the skip annotation must match the requireVersion message pattern
# ("Requires Forklift …"). Tests skipped for other reasons (e.g. missing
# credentials, unconditional test.skip) are flagged as errors.
#
# Usage:
#   npm run check:version-gating        (from testing/)
#   bash check-version-gating.sh        (directly)
# ---------------------------------------------------------------------------
set -euo pipefail

REPORT_FILE=$(mktemp).json
PROVIDERS_FILE=".providers.json"
CREATED_PROVIDERS=false

# Create stub .providers.json if missing so test files can load
if [[ ! -f "$PROVIDERS_FILE" ]]; then
  cp .providers.json.template "$PROVIDERS_FILE"
  CREATED_PROVIDERS=true
fi

cleanup() {
  rm -f "$REPORT_FILE"
  if [[ "$CREATED_PROVIDERS" == true ]]; then
    rm -f "$PROVIDERS_FILE"
  fi

  return 0
}
trap cleanup EXIT

echo "Running downstream tests with FORKLIFT_VERSION=0.0.0 ..."

FORKLIFT_VERSION=0.0.0 \
PLAYWRIGHT_JSON_OUTPUT_NAME="$REPORT_FILE" \
npx playwright test \
  --grep @downstream \
  --project=chromium \
  --reporter=json \
  --timeout=1000 \
  --global-timeout=60000 \
  || true

# Parse the JSON report — every test must carry the [version-gated] annotation
node -e "
  const fs = require('fs');
  const report = JSON.parse(fs.readFileSync('$REPORT_FILE', 'utf8'));
  const TAG = '[version-gated]';

  const collectTests = (suites) =>
    suites.flatMap((s) => [
      ...(s.specs || []).flatMap((spec) =>
        (spec.tests || []).map((t) => ({ title: spec.title, file: spec.file, test: t }))
      ),
      ...collectTests(s.suites || []),
    ]);

  const tests = collectTests(report.suites || []);

  if (tests.length === 0) {
    console.error('ERROR: No downstream tests found in report. Files may have failed to load.');
    process.exit(1);
  }

  const isGated = (t) =>
    (t.test.annotations || []).some((a) => a.type === 'skip' && (a.description || '').includes(TAG));

  const ungated = tests.filter((t) => !isGated(t));

  if (ungated.length > 0) {
    console.error('ERROR: Found downstream tests missing requireVersion gating:');
    ungated.forEach((t) => console.error('  - ' + t.title + ' [' + t.file + '] (status: ' + t.test.status + ')'));
    process.exit(1);
  }

  console.log('All ' + tests.length + ' downstream tests are properly version-gated.');
"
