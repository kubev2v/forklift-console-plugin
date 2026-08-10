#!/usr/bin/env bash
# npm audit gate that ignores Console SDK-constrained packages.
#
# These cannot be safely upgraded in the plugin without breaking Console
# shared-module alignment or forcing a breaking SDK downgrade:
# - react-router: peerOptional ~7.13.1 from @openshift-console/dynamic-plugin-sdk
# - immutable: nested ^3.8.3 under the SDK (patched releases are 4.3.9+/5.x)
# - @openshift-console/dynamic-plugin-sdk / @openshift/dynamic-plugin-sdk:
#   meta findings caused only by the packages above
#
# Remove packages from ALLOWLIST when upstream Console/SDK ships fixed versions.
set -euo pipefail

ALLOWLIST='@openshift-console/dynamic-plugin-sdk @openshift/dynamic-plugin-sdk immutable react-router'

AUDIT_JSON="$(mktemp)"
trap 'rm -f "${AUDIT_JSON}"' EXIT

# npm audit exits non-zero when vulnerabilities exist; capture JSON either way.
npm audit --omit=dev --json >"${AUDIT_JSON}" || true

ALLOWLIST="${ALLOWLIST}" python3 - "${AUDIT_JSON}" <<'PY'
import json
import os
import sys

allowlist = set(os.environ["ALLOWLIST"].split())
blocking = {"critical", "high"}

with open(sys.argv[1], encoding="utf-8") as audit_file:
    report = json.load(audit_file)

vulnerabilities = report.get("vulnerabilities") or {}
ignored = []
actionable = []

for name, vulnerability in sorted(vulnerabilities.items()):
    if vulnerability.get("severity") not in blocking:
        continue
    if name in allowlist:
        ignored.append((name, vulnerability))
    else:
        actionable.append((name, vulnerability))

if ignored:
    print("Ignoring Console SDK-constrained high/critical advisories:")
    for name, vulnerability in ignored:
        print(f"  - {name} ({vulnerability.get('severity')}, range {vulnerability.get('range')})")

if actionable:
    print("Actionable high/critical vulnerabilities:", file=sys.stderr)
    for name, vulnerability in actionable:
        print(
            f"  - {name} ({vulnerability.get('severity')}, range {vulnerability.get('range')})",
            file=sys.stderr,
        )
    sys.exit(1)

print("Dependency audit passed (no actionable high/critical findings).")
PY
