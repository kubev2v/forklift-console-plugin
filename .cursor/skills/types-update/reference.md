# Types Update Reference

Detailed reference for the types-update skill. Read sections on-demand as needed during the workflow.

---

## KubeVirt/CDI Conflict Resolution

### Background

KubeVirt and CDI both generate types from Kubernetes base types but with different naming conventions:
- **CDI** uses: `V1Affinity`, `V1NodeSelector`, `V1ResourceRequirements`
- **KubeVirt** uses: `K8sIoApiCoreV1Affinity`, `K8sIoApiCoreV1NodeSelector`, etc.

The types package exports ALL types from CDI, Forklift, and Kubernetes via `export *`, but exports only **selected** types from KubeVirt via a named export block. This avoids "Duplicate identifier" TypeScript errors.

### Rules for the KubeVirt selective export

In `src/generated/index.ts`, the KubeVirt export block follows these rules:

**INCLUDE (safe to export):**
- `V1VirtualMachine*` -- KubeVirt-specific VM types
- `V1alpha1*` -- KubeVirt alpha types (snapshots, clones, pools, exports, migration policies)
- `V1beta1VirtualMachine*` -- KubeVirt beta VM types (instancetype, preference)
- `V1beta1CPU*`, `V1beta1Clock*`, `V1beta1Device*`, `V1beta1Feature*`, `V1beta1Firmware*`, `V1beta1Machine*`, `V1beta1Memory*`, `V1beta1Volume*`, `V1beta1Preference*` -- KubeVirt preference/instancetype subtypes
- `K8sIoApiCoreV1*` types that do NOT exist in CDI's export list
- `K8sIoApimachineryPkgApisMetaV1*` types that do NOT exist in CDI's export list
- `V1` types that are KubeVirt-specific (e.g. `V1CPU`, `V1Disk`, `V1Network`, `V1Volume`)

**EXCLUDE (conflict with CDI or Kubernetes):**
- `V1beta1DataVolume*` -- conflicts with CDI
- `V1beta1StorageSpec` -- conflicts with CDI
- Any type name that appears in BOTH `src/generated/kubevirt/models/index.ts` AND `src/generated/containerized-data-importer/models/index.ts`
- Generic K8s types already exported from `kubernetes` or `containerized-data-importer`

### Conflict resolution procedure

1. Run `npm run check:conflicts` and capture the output
2. Parse the "Potential Conflicts" section for the list of conflicting type names
3. For each conflicting type, check if it currently appears in the named export block in `src/generated/index.ts`
4. If it does, remove it from the export block
5. Parse the "KubeVirt-Only Types" section for new types that might be needed
6. Check if any new KubeVirt-only types are used by the consumer project (`forklift-console-plugin`). Search for imports from `@forklift-ui/types` that reference KubeVirt type names.
7. Add any needed new types to the export block
8. Run `npm run build` to verify

### Auto-fix for Duplicate identifier errors

If `npm run build` fails with errors like:
```
error TS2300: Duplicate identifier 'V1beta1SomeType'.
```

Extract the type name from the error, remove it from the kubevirt export block in `src/generated/index.ts`, and rebuild. Repeat until clean or a non-conflict error appears.

---

## Forklift CRD List Verification

The `scripts/update-forklift.sh` script has a hardcoded `CRDS` array. New CRDs added upstream are silently missed.

### Verification procedure

Fetch the upstream CRD directory listing:
```bash
curl -s "https://api.github.com/repos/kubev2v/forklift/contents/operator/config/crd/bases?ref=<VERSION>" | jq -r '.[].name'
```

Compare against the `CRDS` array in `scripts/update-forklift.sh`. If new `.yaml` files exist upstream that are not in the array, add them before running the update.

### Current known CRDs (as of 1.0.10)

```
forklift.konveyor.io_forkliftcontrollers.yaml
forklift.konveyor.io_hooks.yaml
forklift.konveyor.io_hosts.yaml
forklift.konveyor.io_hypervproviderservers.yaml
forklift.konveyor.io_migrations.yaml
forklift.konveyor.io_networkmaps.yaml
forklift.konveyor.io_openstackvolumepopulators.yaml
forklift.konveyor.io_ovaproviderservers.yaml
forklift.konveyor.io_ovirtvolumepopulators.yaml
forklift.konveyor.io_plans.yaml
forklift.konveyor.io_providers.yaml
forklift.konveyor.io_storagemaps.yaml
forklift.konveyor.io_vspherexcopyvolumepopulators.yaml
```

---

## Jira Ticket Creation

### Required fields

| Field | Value |
|-------|-------|
| Project | `MTV` |
| Issue Type | `Task` |
| Summary | `UI types package bump from <OLD> to <NEW>` |
| Component | `User Interface` |
| Label | `user-interface` |
| Description | Source update details (see template below) |

### Full payload template

```json
{
  "fields": {
    "project": {"key": "MTV"},
    "issuetype": {"name": "Task"},
    "summary": "UI types package bump from 1.0.8 to 1.0.9",
    "description": "Updating @forklift-ui/types package with latest upstream types.\n\nSources updated:\n- Forklift: main\n- Kubernetes: v1.30.0\n- KubeVirt: v1.3.0\n- CDI: v1.59.0\n\nThis is a routine maintenance update to keep TypeScript types in sync with upstream CRDs and APIs.",
    "components": [{"name": "User Interface"}],
    "labels": ["user-interface"]
  }
}
```

### Fallback: discovering field IDs

If the create call fails with "Field X is required" or "Component not found", discover available values:

```bash
# List project components
curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
  "${JIRA_BASE_URL}/rest/api/2/project/MTV/components" | jq '.[].name'

# List issue types for project
curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
  "${JIRA_BASE_URL}/rest/api/2/project/MTV" | jq '.issueTypes[].name'

# Get createmeta for required fields
curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
  "${JIRA_BASE_URL}/rest/api/2/issue/createmeta?projectKeys=MTV&issuetypeNames=Task&expand=projects.issuetypes.fields"
```

---

## macOS Compatibility

### sed -i difference

The update scripts use GNU `sed -i` syntax. On macOS (BSD sed), this requires an empty string argument: `sed -i '' 's/...'`.

**Fix options:**
1. Install GNU sed: `brew install gnu-sed` and prepend to PATH:
   ```bash
   export PATH="/opt/homebrew/opt/gnu-sed/libexec/gnubin:$PATH"
   ```
2. Or run the scripts inside a Docker container with the repo mounted

### Java for openapi-generator

`openapi-generator-cli` requires Java 11+. On macOS:
```bash
brew install openjdk@17
```

---

## Version Tracking Table Format

The table in `MAINTENANCE.md` looks like:

```markdown
| Source | Current Version | Last Updated | Updated By |
|--------|-----------------|--------------|------------|
| Forklift | main | 2026-JAN-21 | |
| Kubernetes | master | YYYY-MM-DD | |
| KubeVirt | main | YYYY-MM-DD | |
| CDI | main | YYYY-MM-DD | |
```

Update only the rows for sources that were actually updated. Use the format `YYYY-MMM-DD` (e.g. `2026-APR-28`) for dates. Set "Updated By" to `aturgema (made with cursor)`.

---

## Inventory Types: Go-to-TypeScript Translation

### Go-to-TypeScript type mapping

| Go Type | TypeScript Type | Notes |
|---------|----------------|-------|
| `string` | `string` | |
| `int`, `int32`, `int64` | `number` | |
| `float32`, `float64` | `number` | |
| `bool` | `boolean` | |
| `[]T` | `T[]` | |
| `map[string]T` | `Record<string, T>` | |
| `map[string]string` | `Record<string, string>` | |
| `*T` | `T` with `?` (optional) | Pointer means the field may be absent |
| `interface{}` / `any` | `unknown` | |
| `json.RawMessage` | `unknown` | |
| `time.Time` | `string` | JSON serializes as ISO 8601 string |
| `api.Provider` | `V1beta1Provider` | Import from `../../../generated` |
| `api.Plan` | `V1beta1Plan` | Import from `../../../generated` |
| `model.Ref` | `Ref` | Import from `../base/model` |
| `model.Concern` | `Concern` | Import from `../base/model` |

### json tag rules

- `json:"fieldName"` -> property `fieldName: Type`
- `json:"fieldName,omitempty"` -> optional property `fieldName?: Type`
- `json:"-"` -> skip (not serialized to JSON)
- No json tag -> use Go field name as-is (lowercase first letter for TypeScript convention, but check existing patterns)

### Embedded struct handling

Go struct embedding maps to TypeScript `extends`:

```go
// Go
type VM struct {
    Base
    RevisionValidated int64 `json:"revisionValidated"`
}
```

```typescript
// TypeScript
export interface VM extends Base {
    revisionValidated: number;
}
```

If a struct embeds multiple types, extend the first and flatten the rest as inline properties:

```go
type Foo struct {
    Base
    Extra
    Name string `json:"name"`
}
```

```typescript
export interface Foo extends Base {
    // Fields from Extra
    extraField1: string;
    extraField2: number;
    // Own fields
    name: string;
}
```

### Go source file map

**Base / shared types:**

| TypeScript File | Go Source |
|---|---|
| `src/types/provider/base/model.ts` | `pkg/controller/provider/model/base/model.go` |
| `src/types/provider/base/TreeNode.ts` | Derived from web layer tree endpoints |

**vSphere:**

| TypeScript File | Go Source |
|---|---|
| `provider/vsphere/Provider.ts` | `web/vsphere/provider.go` |
| `provider/vsphere/VM.ts` | `web/vsphere/vm.go` |
| `provider/vsphere/Network.ts` | `web/vsphere/network.go` |
| `provider/vsphere/DataStore.ts` | `web/vsphere/datastore.go` |
| `provider/vsphere/Host.ts` | `web/vsphere/host.go` |
| `provider/vsphere/Resource.ts` | `web/vsphere/resource.go` |
| `provider/vsphere/model.ts` | `model/vsphere/model.go` (Disk, NIC, etc.) |

**oVirt:** Same pattern -- `web/ovirt/*.go` + `model/ovirt/model.go`

**OpenShift:** `web/ocp/*.go` + `model/ocp/model.go`

**OpenStack:** `web/openstack/*.go` + `model/openstack/model.go`

**OVA:** `web/ova/*.go` (no separate model dir)

**Hyper-V:** `web/hyperv/*.go` + `model/hyperv/model.go`

All Go paths are relative to `pkg/controller/provider/` in the forklift repo.

### CRD type cross-references

Some inventory types embed or reference Kubernetes CRD objects. In Go, these appear as imports from the Forklift API package:

```go
import api "github.com/kubev2v/forklift/pkg/apis/forklift/v1beta1"

type Provider struct {
    Object api.Provider `json:"object"`
}
```

Map these to the generated TypeScript types:

| Go API Type | TypeScript Type | Import Path |
|---|---|---|
| `api.Provider` | `V1beta1Provider` | `../../../generated` |
| `api.Plan` | `V1beta1Plan` | `../../../generated` |
| `api.Migration` | `V1beta1Migration` | `../../../generated` |
| `api.NetworkMap` | `V1beta1NetworkMap` | `../../../generated` |
| `api.StorageMap` | `V1beta1StorageMap` | `../../../generated` |
| `api.Hook` | `V1beta1Hook` | `../../../generated` |
| `api.Host` | `V1beta1Host` | `../../../generated` |

### TypeScript file style conventions

Match the existing style in the types repo:

```typescript
import { V1beta1Provider } from '../../../generated';
import { OpenshiftResource } from '../openshift/Resource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/vsphere/provider.go
export interface VSphereProvider extends OpenshiftResource {
  // Type string `json:"type"`
  type: string;
  // Object api.Provider `json:"object"`
  object: V1beta1Provider;
}
```

Rules:
1. First line: source URL as a comment
2. Each field: Go field definition as a comment above, then the TypeScript property
3. Imports at the top: generated types, then base/shared types, then sibling types
4. One interface per file (matching existing pattern)
5. Export the interface directly (`export interface`)

### Union and aggregation types

After regenerating per-provider types, update these aggregation files:

- **`ProviderInventory.ts`**: union of all `*Provider` types
- **`ProviderVM.ts`**: union of all `*VM` types
- **`ProviderHost.ts`**: union of host types (`OVirtHost | VSphereHost`)
- **`ProvidersInventoryList.ts`**: object with optional arrays per provider

If a new provider is added upstream (e.g., `ec2`), add it to all union types and to `provider/index.ts`.

### Files to leave untouched

- `src/types/secret/` -- K8s Secret data shapes, not derivable from Go inventory structs
- `src/types/k8s/` -- small K8s helper types (`K8sResourceCommon`, `K8sResourceCondition`, `V1NetworkAttachmentDefinition`)
- `src/types/Modify.ts` -- utility type
- `src/types/MustGatherResponse.ts` -- must-gather API response, not from inventory
- `src/types/constants/` -- UI constants

### Inventory types edge cases

- **New provider appears upstream**: create the provider directory, add to `provider/index.ts`, add to all union types
- **Struct field removed upstream**: remove from TypeScript interface. Check consumer project for usage before proceeding.
- **Struct field type changed**: update the TypeScript type. Flag to user if it might be a breaking change.
- **Go struct uses non-JSON tags only (`sql:` without `json:`)**: skip those fields -- they are DB-only and not serialized to JSON.
- **Anonymous/embedded struct from external package**: if the embedded type comes from an external Go package (not the forklift repo), check if a matching TypeScript type exists in `generated/` or `types/k8s/`.

---

## Edge Cases

### Package not on npm after release

If `poll-npm.sh` times out:
1. Check the GitHub Action at `https://github.com/kubev2v/forklift-console-types/actions/workflows/release.yml`
2. Common failures:
   - **npm Trusted Publishing not configured**: the npm package must have GitHub Actions as a trusted publisher in npm settings
   - **Version already exists**: if the version was somehow already published (e.g. re-release), npm rejects it. Bump to the next patch.
   - **Build failure in CI**: the release workflow runs `npm ci && npm run build` before publishing

### Consumer project has TS errors after bump

Common patterns:
- **Type removed**: search the diff between old and new `src/generated/index.ts` for removed exports. The consumer needs to either stop using that type or define it locally.
- **Field type changed**: compare the old and new model file for the specific type. Common changes: `string | undefined` becoming `string`, optional fields becoming required, enum values changing.
- **New type conflicts in consumer**: if the consumer defines a local type with the same name as a new export, rename the local type.

### ObjectMeta `creationTimestamp: Date` breaks SDK compatibility

**Root cause**: The `openapi-generator` maps OpenAPI `date-time` format to TypeScript `Date`. Kubernetes ObjectMeta fields `creationTimestamp` and `deletionTimestamp` are `date-time` in the spec, so the generator produces `Date`. However, the Kubernetes API returns ISO 8601 strings, and `@openshift-console/dynamic-plugin-sdk` types these as `string` in its `ObjectMetadata`.

**Symptom**: ~370 TS errors like `Type 'Date | undefined' is not assignable to type 'string | undefined'` on every `useK8sWatchResource`, `k8sPatch`, `getName`, etc. call that touches a Forklift CRD type.

**Affected files**: All `ObjectMeta` types across Kubernetes, KubeVirt, and CDI:
- `src/generated/kubernetes/models/IoK8sApimachineryPkgApisMetaV1ObjectMeta.ts`
- `src/generated/kubevirt/models/K8sIoApimachineryPkgApisMetaV1ObjectMeta.ts`
- `src/generated/containerized-data-importer/models/V1ObjectMeta.ts`

**Fix**: Run `npm run fix:timestamps` after every update script run. See Phase 3 step 3e in the skill. This was introduced after the Kubernetes v1.36.0 update (types repo PR #26).

### Inventory type field casing changes

When updating Forklift inventory types (Phase 2.5), the Go source may use different field casing than the previous TypeScript types. The `json:` struct tags in Go define the actual JSON field names. Common renames to watch for:
- `OvaPath` → `ovfPath` (from `json:"ovfPath"`)
- `ID` → `id` (from `json:"id"`)

After updating inventory types, run a search in the consumer project for the old field names to find breakages.

### Upstream spec download fails

If `curl` fails to download a swagger.json or CRD file:
1. Verify the version/tag exists: `gh api repos/<owner>/<repo>/tags --jq '.[].name' | head -20`
2. The URL pattern may have changed for that version. Check the upstream repo structure at the specific tag.
3. For Kubernetes, note that very old tags may not have `api/openapi-spec/swagger.json` at the expected path.

### openapi-generator produces different output

The `openapi-generator-cli` version is pinned in `devDependencies` but the actual generator binary version may differ. If generated output looks significantly different (different file names, different type naming), check `node_modules/.openapi-generator/VERSION` and compare with what was used previously.
