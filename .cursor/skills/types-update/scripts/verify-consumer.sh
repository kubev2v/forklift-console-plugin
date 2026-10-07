#!/bin/bash
#
# Verify a local @forklift-ui/types build against forklift-console-plugin
# before opening a types-repo PR.
#
# Usage:
#   TYPES_REPO_DIR=~/Workspace/forklift-console-types \
#   CONSUMER_DIR=~/Workspace/forklift-console-plugin \
#   .cursor/skills/types-update/scripts/verify-consumer.sh <NEW_VERSION> [OLD_VERSION]
#
# OLD_VERSION defaults to the version in the consumer's package-lock.json (published baseline).
# Fails if TypeScript reports errors that were not present with OLD_VERSION.
# Always restores the consumer package.json and package-lock.json when finished.
#

set -euo pipefail

NEW_VERSION="${1:?Usage: verify-consumer.sh NEW_VERSION [OLD_VERSION]}"
OLD_VERSION="${2:-}"

TYPES_REPO_DIR="${TYPES_REPO_DIR:-${HOME}/Workspace/forklift-console-types}"
CONSUMER_DIR="${CONSUMER_DIR:-${HOME}/Workspace/forklift-console-plugin}"
PACK_DIR="${PACK_DIR:-/tmp}"
SECTION_RULE='========================================'

if [[ -n "${JAVA_HOME:-}" ]]; then
  export PATH="${JAVA_HOME}/bin:${PATH}"
fi

if [[ ! -d "${TYPES_REPO_DIR}" ]]; then
  echo "ERROR: Types repo not found: ${TYPES_REPO_DIR}" >&2
  exit 1
fi

if [[ ! -d "${CONSUMER_DIR}" ]]; then
  echo "ERROR: Consumer repo not found: ${CONSUMER_DIR}" >&2
  exit 1
fi

echo "${SECTION_RULE}"
echo "Consumer verification (@forklift-ui/types ${NEW_VERSION})"
echo "  Types:    ${TYPES_REPO_DIR}"
echo "  Consumer: ${CONSUMER_DIR}"
echo "${SECTION_RULE}"

cd "${TYPES_REPO_DIR}"
echo ""
echo "Step 1: Build types package..."
npm run build

TARBALL="${PACK_DIR}/forklift-ui-types-${NEW_VERSION}.tgz"
echo ""
echo "Step 2: Pack tarball -> ${TARBALL}"
rm -f "${TARBALL}"
npm pack --pack-destination "${PACK_DIR}" >/dev/null
if [[ ! -f "${TARBALL}" ]]; then
  echo "ERROR: Expected pack output at ${TARBALL}" >&2
  exit 1
fi

cd "${CONSUMER_DIR}"

if [[ -z "${OLD_VERSION}" ]]; then
  OLD_VERSION=$(node -e "
    const lock = require('./package-lock.json');
    const pkg = lock.packages && lock.packages['node_modules/@forklift-ui/types'];
    if (pkg && pkg.version) { process.stdout.write(pkg.version); return; }
    const dep = require('./package.json').dependencies['@forklift-ui/types'] || '';
    process.stdout.write(dep.replace(/^[^0-9]*/, ''));
  ")
fi

echo ""
echo "Step 3: Baseline tsc with published @forklift-ui/types@${OLD_VERSION}..."
BACKUP_DIR=$(mktemp -d)
cp package.json package-lock.json "${BACKUP_DIR}/"

restore_consumer() {
  cp "${BACKUP_DIR}/package.json" "${BACKUP_DIR}/package-lock.json" .
  npm ci --ignore-scripts >/dev/null 2>&1 || npm install --ignore-scripts >/dev/null 2>&1
  rm -rf "${BACKUP_DIR}"
}
trap restore_consumer EXIT

TSC_BIN="${CONSUMER_DIR}/node_modules/.bin/tsc"

run_consumer_tsc() {
  if [[ ! -x "${TSC_BIN}" ]]; then
    echo "ERROR: ${TSC_BIN} not found. Run npm install in the consumer first." >&2
    exit 1
  fi
  "${TSC_BIN}" --noEmit
}

npm install "@forklift-ui/types@${OLD_VERSION}" --save-exact --ignore-scripts
BASELINE_LOG=$(mktemp)
set +e
run_consumer_tsc >"${BASELINE_LOG}" 2>&1
BASELINE_EC=$?
set -e
echo "  tsc exit code (baseline): ${BASELINE_EC}"

echo ""
echo "Step 4: Install local tarball and run tsc + lint..."
npm install "${TARBALL}" --ignore-scripts
NEW_LOG=$(mktemp)
set +e
run_consumer_tsc >"${NEW_LOG}" 2>&1
NEW_EC=$?
set -e
echo "  tsc exit code (new):      ${NEW_EC}"

NEW_ONLY=$(mktemp)
comm -23 <(sort "${NEW_LOG}") <(sort "${BASELINE_LOG}") >"${NEW_ONLY}" || true

if [[ -s "${NEW_ONLY}" ]]; then
  echo ""
  echo "FAIL: TypeScript errors introduced by the types bump (not in baseline @${OLD_VERSION}):"
  echo "----------------------------------------"
  head -80 "${NEW_ONLY}"
  if [[ $(wc -l <"${NEW_ONLY}") -gt 80 ]]; then
    echo "... ($(wc -l <"${NEW_ONLY}") lines total)"
  fi
  rm -f "${BASELINE_LOG}" "${NEW_LOG}" "${NEW_ONLY}"
  exit 1
fi

if [[ "${NEW_EC}" -ne 0 && "${BASELINE_EC}" -ne 0 ]]; then
  echo ""
  echo "Note: tsc still fails, but error set matches baseline @${OLD_VERSION} (no new types-related breakage)." >&2
fi

echo ""
echo "Step 5: eslint (consumer)..."
set +e
npm run lint
LINT_EC=$?
set -e
if [[ "${LINT_EC}" -ne 0 ]]; then
  echo "FAIL: npm run lint failed in consumer (exit ${LINT_EC})" >&2
  rm -f "${BASELINE_LOG}" "${NEW_LOG}" "${NEW_ONLY}"
  exit 1
fi

rm -f "${BASELINE_LOG}" "${NEW_LOG}" "${NEW_ONLY}"

echo ""
echo "${SECTION_RULE}"
echo "PASS: Consumer verification succeeded"
echo "  Baseline: @forklift-ui/types@${OLD_VERSION}"
echo "  Tested:   local pack ${NEW_VERSION}"
echo "${SECTION_RULE}"
