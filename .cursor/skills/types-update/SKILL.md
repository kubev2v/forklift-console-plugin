---
name: types-update
description: >-
  Automates the full lifecycle of updating @forklift-ui/types: discovers
  upstream versions, creates a Jira ticket, runs type generation scripts in
  the forked types repo, handles KubeVirt/CDI conflicts, creates a PR and
  GitHub release, waits for npm publish, then bumps the consumer project
  and monitors CI. Use when the user asks to update types, bump types,
  update forklift-ui/types, types package update, or regenerate types.
---

# Types Update Skill

Updates `@forklift-ui/types` from upstream sources (Forklift, Kubernetes, KubeVirt, CDI), publishes a new version, and bumps the consumer project.

For conflict resolution rules, Jira payload template, CRD verification, and edge cases see [reference.md](reference.md).

## Prerequisites

- `gh` CLI authenticated with access to `kubev2v/forklift-console-types`
- User's fork of `kubev2v/forklift-console-types` cloned locally (or clonable)
- `~/.jira-creds` configured (see `~/.cursor/rules/jira-api.mdc`)
- `curl`, `jq`, `npm`, `node >= 20` installed
- Java runtime (required by `openapi-generator-cli` in the types repo)

## Permissions — Cross-Project File Access

The types repo (`forklift-console-types`) lives **outside** the current workspace. The Cursor sandbox blocks writes to paths outside the workspace, which causes repeated permission prompts.

**Rules for all phases that touch the types repo (Phases 2.5, 3, 4):**

1. **Always use `required_permissions: ["all"]`** on every Shell call whose `working_directory` is the types repo.
2. **Use Shell for file edits in the types repo** — do NOT use the Write or StrReplace tools for files outside the workspace. Instead write files via shell (e.g. `cat <<'CONTENT' > path/to/file.ts ... CONTENT`). This avoids per-file permission prompts.
3. **Batch operations** — combine multiple related edits into a single Shell call when possible to minimise approval prompts.
4. Phases that only run in the consumer project (this workspace) do not need special permissions.

---

## Workflow

Copy this checklist and track progress:

```
Types Update Progress:
- [ ] Phase 1: Setup and discovery
- [ ] Phase 2: Create Jira ticket
- [ ] Phase 2.5: Update inventory types from Go source
- [ ] Phase 3: Update generated types in forked repo
- [ ] GATE 1: User approves conflict resolution (if any)
- [ ] Phase 4: Version bump, tracking update, and PR
- [ ] GATE 2: User confirms types PR is merged
- [ ] Phase 5: Create GitHub release and wait for npm publish
- [ ] Phase 6: Update consumer project (forklift-console-plugin)
- [ ] Phase 7: Monitor CI on consumer PR
```

---

## Phase 1: Setup and Discovery

### 1a. Locate the types repo

Check if the types repo is already cloned locally. Common locations:
- Sibling directory: `../forklift-console-types`
- User home: `~/Workspace/forklift-console-types`

If not found, clone the user's fork:
```bash
gh repo clone <user>/forklift-console-types ~/Workspace/forklift-console-types
```

Store the path as `TYPES_REPO_DIR` for the rest of the workflow.

### 1b. Read current versions

Parse the Version Tracking table in `$TYPES_REPO_DIR/MAINTENANCE.md`. Extract the "Current Version" column for each source (Forklift, Kubernetes, KubeVirt, CDI).

Also read the current package version from `$TYPES_REPO_DIR/package.json`.

### 1c. Fetch latest upstream versions

Run the helper script:
```bash
.cursor/skills/types-update/scripts/check-upstream.sh
```

This outputs the latest commit SHA on `main` for Forklift, and the latest release tag for the other sources.

**Forklift always targets `main`** (never a tagged release) because the UI needs the most recent CRD and inventory type changes. The commit SHA is recorded in MAINTENANCE.md for reproducibility. Kubernetes, KubeVirt, and CDI use stable tagged releases.

### 1d. Present comparison and ask user

Present a table:
```
Types Update Discovery
=======================
Package version: 1.0.8

| Source     | Current              | Latest Available       |
|------------|----------------------|------------------------|
| Forklift   | main (abc1234)       | main (def5678)         |
| Kubernetes | v1.29.0              | v1.30.0                |
| KubeVirt   | v1.2.0               | v1.3.0                 |
| CDI        | v1.58.0              | v1.59.0                |
```

Use the AskQuestion tool to ask:
1. Which sources to update (default: all four). Options: "All four", "Let me pick"
2. If "Let me pick", present each source as a multi-select checkbox (Forklift is always included since it targets `main`)

Then ask for target versions for Kubernetes, KubeVirt, and CDI (default: the latest available shown above). Forklift always uses the latest `main` commit.

---

## Phase 2: Create Jira Ticket

Source Jira credentials:
```bash
source ~/.jira-creds
```

Determine the new package version (current patch + 1, e.g. `1.0.8` -> `1.0.9`). Ask user if they want a different bump level (minor/major).

Create the ticket:
```bash
curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
  -X POST -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "project": {"key": "MTV"},
      "issuetype": {"name": "Task"},
      "summary": "UI types package bump from <OLD_VERSION> to <NEW_VERSION>",
      "description": "Updating @forklift-ui/types package.\n\nSources updated:\n- Forklift: <version> (CRDs + inventory types)\n- Kubernetes: <version>\n- KubeVirt: <version>\n- CDI: <version>",
      "components": [{"name": "User Interface"}],
      "labels": ["user-interface"]
    }
  }' \
  "${JIRA_BASE_URL}/rest/api/2/issue/"
```

Parse the response to extract the ticket key (e.g. `MTV-5432`). Store it as `JIRA_KEY` for commits and PR descriptions.

If the API call fails (auth error, missing fields), show the error and ask the user to fix credentials or provide the component/label IDs manually. See [reference.md](reference.md) for the full payload template and fallback field discovery commands.

---

## Phase 2.5: Update Inventory Types from Go Source

The hand-written inventory types in `$TYPES_REPO_DIR/src/types/` mirror Go structs from the Forklift repo. The agent reads the Go source files and regenerates the TypeScript interfaces to match.

> **Permissions reminder:** This phase edits files in the types repo (outside workspace). Use Shell with `required_permissions: ["all"]` for all commands and file writes. See the **Permissions** section above.

**Scope**: `src/types/provider/` (per-provider types) and `src/types/provider/base/` (shared model types). The `src/types/secret/` and `src/types/k8s/` directories are NOT derivable from Go and remain manual.

See [reference.md](reference.md) for the complete Go source file map, type mapping table, and edge cases.

### 2.5a. Fetch Go source files

For each provider, download the Go source files from GitHub at the same Forklift version/branch selected in Phase 1. Use the GitHub raw content URL:

```
https://raw.githubusercontent.com/kubev2v/forklift/<VERSION>/pkg/controller/provider/web/<provider>/<file>.go
https://raw.githubusercontent.com/kubev2v/forklift/<VERSION>/pkg/controller/provider/model/<provider>/model.go
```

Start with the base model:
```bash
curl -sfL "https://raw.githubusercontent.com/kubev2v/forklift/<VERSION>/pkg/controller/provider/model/base/model.go"
```

Then fetch each provider's web layer files. The Go source directory for each provider:

| TypeScript provider dir | Go web dir | Go model dir |
|---|---|---|
| `provider/base/` | -- | `model/base/model.go` |
| `provider/vsphere/` | `web/vsphere/*.go` | `model/vsphere/model.go` |
| `provider/ovirt/` | `web/ovirt/*.go` | `model/ovirt/model.go` |
| `provider/openshift/` | `web/ocp/*.go` | `model/ocp/model.go` |
| `provider/openstack/` | `web/openstack/*.go` | `model/openstack/model.go` |
| `provider/ova/` | `web/ova/*.go` | -- |
| `provider/hyperv/` | `web/hyperv/*.go` | `model/hyperv/model.go` |

To discover files in a Go web directory, list them via the GitHub API:
```bash
curl -sf "https://api.github.com/repos/kubev2v/forklift/contents/pkg/controller/provider/web/<provider>?ref=<VERSION>" | jq -r '.[].name'
```

### 2.5b. Parse Go structs and translate to TypeScript

For each Go source file, identify exported struct definitions and their fields. Apply the Go-to-TypeScript type mapping from [reference.md](reference.md).

Key rules:
- **Struct field with `json:"fieldName"`** -> TypeScript property `fieldName: <mapped-type>`
- **Struct field with `json:"-"`** -> skip (not serialized)
- **Struct field with `json:"fieldName,omitempty"`** -> optional property `fieldName?: <mapped-type>`
- **Pointer field (`*T`)** -> optional property (`T | undefined` or `?`)
- **Embedded struct** -> TypeScript `extends` (e.g., `type VM struct { Base; ... }` becomes `interface VM extends Base { ... }`)
- **Go `api.Provider`** (imported from Forklift API package) -> `V1beta1Provider` from `../../../generated`

### 2.5c. Write the TypeScript files

Overwrite the existing TypeScript files in `$TYPES_REPO_DIR/src/types/provider/` with the regenerated interfaces. Preserve:

1. **File structure**: same file names and directory layout as existing
2. **Source URL comment**: include `// https://github.com/kubev2v/forklift/tree/<VERSION>/pkg/controller/provider/web/<provider>/<file>.go` at the top
3. **Go field comments**: include the original Go field definition as a comment above each TypeScript property (matching existing style)
4. **Import paths**: maintain correct relative imports to base types and generated CRD types
5. **Union types**: after regenerating individual provider types, regenerate `ProviderInventory.ts`, `ProviderVM.ts`, `ProviderHost.ts`, and `ProvidersInventoryList.ts` to include all providers

### 2.5d. Verify inventory types build

```bash
cd $TYPES_REPO_DIR
npm run build
```

If the build fails due to inventory type issues (missing imports, wrong type references), fix them before proceeding. Common issues:
- **Missing base type**: a Go struct embeds a type from a different package. Check if the base type exists in `provider/base/model.ts` or another provider's types.
- **CRD type reference changed**: if a Go struct references an API type that was renamed in the generated types, update the import.
- **New provider added upstream**: if a new provider directory appears in the Go source, create the corresponding TypeScript directory under `provider/` and add it to `provider/index.ts` and the union types.

---

## Phase 3: Update Generated Types in Forked Repo

> **Permissions reminder:** This phase runs in the types repo (outside workspace). Use Shell with `required_permissions: ["all"]` for all commands. See the **Permissions** section above.

### 3a. Prepare the branch (skip if already done in Phase 2.5)

```bash
cd $TYPES_REPO_DIR
git fetch origin
git checkout main
git pull origin main
git checkout -b chore/types-update-<NEW_VERSION>
npm ci --ignore-scripts
```

### 3b. Verify Forklift CRD list (if updating Forklift)

Before running the Forklift update script, compare the hardcoded CRD list in `scripts/update-forklift.sh` against the actual upstream directory. See [reference.md](reference.md) for the verification procedure. If new CRDs exist upstream, add them to the `CRDS` array before running.

### 3c. Run update scripts

Run each selected source's update script in this order:

```bash
npm run update:forklift -- main
npm run update:kubernetes -- <version>
npm run update:kubevirt -- <version>
npm run update:cdi -- <version>
```

Forklift always uses `main`. Record the commit SHA from Phase 1 in MAINTENANCE.md for reproducibility.

**macOS compatibility note**: The update scripts use `sed -i` which behaves differently on macOS (BSD sed) vs Linux (GNU sed). If running locally on macOS and `sed` errors occur, set `PATH="/opt/homebrew/opt/gnu-sed/libexec/gnubin:$PATH"` or install `gnu-sed` via Homebrew.

### 3d. Check for KubeVirt/CDI conflicts

After updating KubeVirt or CDI, run:
```bash
npm run check:conflicts
```

Parse the output:
- **"No conflicts found"**: proceed to build verification
- **Conflicts found**: the script lists conflicting type names

If conflicts are found, update `src/generated/index.ts`:
1. Read the current selective export block for kubevirt
2. Remove any newly conflicting types from the named export list
3. Add any new KubeVirt-only types that the application needs

See [reference.md](reference.md) for the conflict resolution rules and which type categories to include/exclude.

### GATE 1: Conflict resolution approval

If conflicts required changes to `src/generated/index.ts`, present the diff to the user:
```bash
git diff src/generated/index.ts
```

Use AskQuestion:
- "Approve changes" -> proceed
- "Let me review" -> wait for user edits
- "Cancel" -> abort workflow

If no conflicts were found, skip this gate.

### 3e. Fix ObjectMeta timestamp types

The `openapi-generator` maps OpenAPI `date-time` fields to TypeScript `Date`, but the Kubernetes API returns ISO 8601 strings and `@openshift-console/dynamic-plugin-sdk` expects `creationTimestamp` and `deletionTimestamp` as `string`. After running the update scripts, this **must** be fixed.

Run the post-generation fix script (if it exists):
```bash
npm run fix:timestamps
```

If the script does not exist, manually fix all ObjectMeta types:
```bash
for f in $(grep -rl "Timestamp?: Date" src/generated/); do
  sed -i '' \
    -e 's/creationTimestamp?: Date;/creationTimestamp?: string;/' \
    -e 's/deletionTimestamp?: Date;/deletionTimestamp?: string;/' \
    -e "s/(new Date(json\['creationTimestamp'\]))/json['creationTimestamp']/" \
    -e "s/(new Date(json\['deletionTimestamp'\]))/json['deletionTimestamp']/" \
    -e "s/((value\['creationTimestamp'\]).toISOString())/value['creationTimestamp']/" \
    -e "s/((value\['deletionTimestamp'\]).toISOString())/value['deletionTimestamp']/" \
    "$f"
  echo "Fixed: $f"
done
```

**This step is mandatory.** Skipping it causes ~370 TypeScript errors in the consumer project where Forklift CRD types become incompatible with the Console SDK's `K8sResourceCommon`.

### 3f. Build verification

```bash
npm run build
npm run lint
```

If the build fails with "Duplicate identifier" errors:
1. Parse the error to identify the conflicting type name
2. Remove it from the kubevirt selective export in `src/generated/index.ts`
3. Rebuild

Repeat until the build passes or a non-conflict error is encountered.

If a non-conflict error occurs, present it to the user and stop for manual resolution.

---

## Phase 4: Version Bump, Tracking, and PR

### 4a. Bump version

Edit `$TYPES_REPO_DIR/package.json` to increment the version (default: patch bump).

### 4b. Update Version Tracking

Edit `$TYPES_REPO_DIR/MAINTENANCE.md`, updating the Version Tracking table. For each source that was updated, set:
- **Current Version**: the version/tag used. For Forklift, use `main (<short-sha>)` (e.g. `main (a1b2c3d)`) to record the exact commit.
- **Last Updated**: today's date in `YYYY-MMM-DD` format (e.g. `2026-APR-28`)
- **Updated By**: `aturgema (made with cursor)`

### 4c. Commit

Collect git user info:
```bash
GIT_NAME=$(git config user.name)
GIT_EMAIL=$(git config user.email)
```

```bash
git add -A
git commit -m "$(cat <<'EOF'
chore: update types to <NEW_VERSION>

Updated sources:
- Forklift: <version> (CRDs + inventory types)
- Kubernetes: <version>
- KubeVirt: <version>
- CDI: <version>

Resolves: <JIRA_KEY>
Signed-off-by: <GIT_NAME> <<GIT_EMAIL>>
EOF
)"
```

### 4d. Push and create PR

```bash
git push -u origin chore/types-update-<NEW_VERSION>
```

```bash
gh pr create \
  --repo kubev2v/forklift-console-types \
  --base main \
  --title "chore: update types to <NEW_VERSION>" \
  --body "$(cat <<'EOF'
## Summary

- Updated @forklift-ui/types from <OLD_VERSION> to <NEW_VERSION>
- Sources updated: Forklift (<ver>), Kubernetes (<ver>), KubeVirt (<ver>), CDI (<ver>)

## Verification

- [x] `npm run build` passes
- [x] `npm run lint` passes
- [x] `npm run check:conflicts` shows no unresolved conflicts

## Links

> Jira: https://issues.redhat.com/browse/<JIRA_KEY>

Resolves: <JIRA_KEY>
EOF
)"
```

### GATE 2: Wait for types PR merge

Present the PR URL to the user. Ask:
- "PR is merged, proceed with release" -> continue to Phase 5
- "Still waiting" -> pause and remind later
- "Cancel" -> abort

**Do NOT proceed to Phase 5 until the user explicitly confirms the PR is merged.**

---

## Phase 5: Create GitHub Release and Wait for npm

### 5a. Create the release

```bash
gh release create "v<NEW_VERSION>" \
  --repo kubev2v/forklift-console-types \
  --title "v<NEW_VERSION>" \
  --generate-notes
```

This creates a tag and publishes a release, which triggers the `release.yml` GitHub Action to publish to npm.

### 5b. Wait for npm publish

Run the polling script:
```bash
.cursor/skills/types-update/scripts/poll-npm.sh <NEW_VERSION>
```

This polls `npm view @forklift-ui/types version` every 30 seconds for up to 10 minutes.

If the poll times out, notify the user:
```
The new version <NEW_VERSION> has not appeared on npm after 10 minutes.
Check the GitHub Action logs:
https://github.com/kubev2v/forklift-console-types/actions/workflows/release.yml
```

If the version appears, proceed to Phase 6.

---

## Phase 6: Update Consumer Project (forklift-console-plugin)

### 6a. Create branch

```bash
cd /path/to/forklift-console-plugin
git checkout main
git pull upstream main
git checkout -b chore/bump-types-<NEW_VERSION>
```

### 6b. Install new version

```bash
npm install @forklift-ui/types@<NEW_VERSION>
```

### 6c. Verify no breaking changes

```bash
npm run lint
npx tsc --noEmit
```

### If errors occur

**Do NOT create a PR.** Instead:

1. Present the full error output to the user
2. Analyze the errors -- common causes:
   - Removed type: a type was dropped from the package. Search for its usage and suggest the replacement.
   - Changed field: a field was renamed or its type changed. Show the old vs new type definition.
   - New required field: a type now requires a field that wasn't there before.
3. Suggest fixes if possible
4. Wait for user to resolve. After resolution, re-run verification.

### If clean

Commit and create PR:

```bash
git add package.json package-lock.json
git commit -m "$(cat <<'EOF'
chore: bump @forklift-ui/types to <NEW_VERSION>

Resolves: <JIRA_KEY>
EOF
)"
git push -u origin chore/bump-types-<NEW_VERSION>
```

```bash
gh pr create \
  --title "chore: bump @forklift-ui/types to <NEW_VERSION>" \
  --body "$(cat <<'EOF'
## Summary

- Bumps `@forklift-ui/types` from `<OLD_VERSION>` to `<NEW_VERSION>`
- No breaking changes detected (lint and tsc pass)

## Links

> Types PR: <types-pr-url>
> Jira: https://issues.redhat.com/browse/<JIRA_KEY>

Resolves: <JIRA_KEY>
EOF
)"
```

---

## Phase 7: Monitor CI

### 7a. Initial wait

Sleep for 10 minutes after creating the consumer PR:
```bash
sleep 600
```

### 7b. Check PR status

```bash
gh pr checks <PR_NUMBER>
```

### 7c. Act on results

- **All checks passing**: Notify the user that the PR is ready for review/merge.
- **Any check failing**: Gather details:
  ```bash
  gh pr checks <PR_NUMBER> --json name,state,conclusion,detailsUrl
  ```
  For each failed check, fetch the log URL and summarize the failure. Suggest fixes if possible.
- **Checks still running**: Sleep another 10 minutes and repeat from 7b.

Continue the check loop until all checks have a terminal state (pass or fail).

---

## Important Notes

- The types repo uses **npm Trusted Publishing** (`--provenance`). No npm token is needed; the GitHub Action handles auth via OIDC.
- **Forklift always targets `main`** (never a tagged release) to pick up the latest CRD and inventory type changes. Record the commit SHA in MAINTENANCE.md for reproducibility.
- Kubernetes, KubeVirt, and CDI use **stable tagged releases**. Kubernetes defaults to the **`master`** branch naming convention for its tags.
- The `openapi-generator-cli` requires a **Java runtime**. If `npx openapi-generator-cli` fails with a Java error, the user needs to install JDK 11+.
- After updating, `swagger.json` files are kept in the repo (they are large but committed). This is intentional for reproducibility.
