---
description: Plan pages - list, create wizard, details tabs, migration actions
alwaysApply: false
---

# Plan Pages

> Analyzed on 2026-09-17 — largest feature in the plugin (~600 files under `src/plans/`).

## Extension Registration (`src/plans/dynamic-plugin.ts`)

| Extension type | Module | Component |
|---|---|---|
| `console.navigation/resource-ns` | — | Nav items (admin + virt perspectives) |
| `console.page/resource/list` | `PlansListPage` | `src/plans/list/PlansListPage.tsx` |
| `console.page/resource/details` | `PlanDetailsNav` | `src/plans/details/PlanDetailsNav.tsx` |
| `console.resource/create` | `PlanCreatePage` | `src/plans/create/PlanCreatePage.tsx` |

All use `PlanModelGroupVersionKind` from `@forklift-ui/types`.

---

## Page Composition

### 1. List Page (`PlansListPage`)

```
PlansListPage
├── LearningExperienceDrawer
└── StandardPageWithSelection
    ├── PlansAddButton              (RBAC via useGetDeleteAndEditAccessReview)
    ├── PlansBulkActionsDropdown    (archive / delete selected)
    ├── PlansEmptyState
    └── PlanRow
        ├── PlanStatus
        └── PlanActions              (kebab → PlanActionsDropdown)
```

**Data:** `useK8sWatchResource<V1beta1Plan[]>` (namespaced list).

**Columns** (`list/utils/planFields.ts`): Name, Project, Source provider, Target project, VM count, Migration status, Migration type, Migration started, Description, Actions. Hidden "Archived" slider filter.

**Post-filter:** Archived plans hidden unless slider is on (`spec.archived`).

**Bulk selection gates (MTV-6297):** `isPlanRunningOrPending` → Executing or Pending plans cannot be selected for bulk archive/delete (`canSelectPlanForBulkActions`).

### 2. Create Page (`PlanCreatePage` → `CreatePlanWizard`)

```
PlanCreatePage
├── LearningExperienceDrawer
└── CreatePlanWizard
    ├── FormProvider (react-hook-form via useCreatePlanForm)
    ├── CreatePlanWizardContextProvider
    └── CreatePlanWizardInner (PF6 Wizard, isVisitRequired)
        ├── WizardStep "Basic setup" (expandable)
        │   ├── GeneralInformationStep
        │   ├── VirtualMachinesStep (+ VirtualMachinesStepFooter)
        │   ├── NetworkMapStep
        │   ├── StorageMapStep
        │   └── MigrationTypeStep          (conditionally hidden)
        ├── WizardStep "Additional setup" (expandable)
        │   ├── OtherSettingsStep
        │   ├── CustomScriptsStep
        │   └── HooksStep
        └── WizardStep "Review and create" → ReviewStep
```

**9 leaf steps** (group parents are nav-only): General → VMs → Network map → Storage map → Migration type → Other settings → Automation → Hooks → Review.

**Entry URL params:** `?planProject=<ns>&sourceProvider=<name>` pre-fills general step (`useSourceProviderFromSearchParams`).

**Step gating:** `useStepNavigation` + `hasPreviousStepErrors` disable forward steps when prior step fields have errors. `stepFieldMap` in `create/constants.ts` maps each `PlanWizardStepId` to its react-hook-form field IDs.

**Migration type step hidden** when source provider lacks warm migration support and (live migration unsupported OR `OCP_LIVE_MIGRATION` feature flag off).

**Submit:** `submitMigrationPlan` → parallel resource creation → `createPlan` → `addPlanResourceOwnerRefs`. Navigates via `getCreatedPlanPath`.

### 3. Details Page (`PlanDetailsNav`)

```
PlanDetailsNav
├── LearningExperienceDrawer
├── PlanConcernsDrawer
│   ├── PlanPageHeader
│   │   ├── PageHeadings + PlanStatusLabel
│   │   ├── PlanEditCutoverButton (primary)
│   │   ├── PlanActionsDropdown (isDetailsPage)
│   │   └── PlanAlerts
│   └── HorizontalNav (usePlanPages)
```

**Data:** `usePlan(name, namespace)` — single `V1beta1Plan` watch shared by all tabs.

---

## Details Tabs (`details/hooks/usePlanPages.tsx`)

| Tab (UI label) | Component | href | Notes |
|---|---|---|---|
| Details | `PlanDetailsPage` | `""` | DetailsSection, ProvidersSection, SettingsSection, MigrationsSection, ConditionsSection |
| YAML | `PlanYAMLPage` | `yaml` | `ResourceYAMLEditor` |
| Virtual machines | `PlanVirtualMachinesPage` | `vms` | Spec list vs migration-status list (see below) |
| Utilization | `PlanResourcesPage` | `resources` | CPU/memory/disk from source inventory |
| Mappings | `PlanMappingsPage` | `mappings` | Network + storage map review/edit |
| Automation | `PlanAutomationPage` | `automation` | virt-customize scripts ConfigMap |
| Hooks | `PlanHooksPage` | `hooks` | Pre/post Hook sections |

### VMs tab view switch (`PlanVirtualMachinesPage`)

- **Pre-execution:** `PlanSpecVirtualMachinesList` — spec VMs, add/remove, deep inspection, concerns.
- **During/after execution:** `MigrationStatusVirtualMachinesList` inside `DrawerProvider` when `isPlanExecuting` OR `isPlanSucceeded` OR `canPlanReStart`.

### Utilization tab

Watches source provider + `useProviderInventory({ subPath: 'vms?detail=4' })`, filters to plan VM IDs, renders `PlanResourcesTable`.

---

## Create Wizard — Submission Resources

`submitMigrationPlan` creates in parallel via `buildMigrationPlanResourceRequests`:

1. **NetworkMap** — copy existing or create new
2. **StorageMap** — copy existing or create new
3. **LUKS decryption Secret** — `resolveDecryptionSecret` (see LUKS section)
4. **Hooks** — local Hook CRDs or AAP job-template refs
5. **Scripts ConfigMap** — new or existing

Then creates Plan CRD, then `addPlanResourceOwnerRefs` patches owner references onto all created resources.

---

## LUKS Source-Secret Copy-on-Select

When user picks an **existing** LUKS secret in the wizard (`DiskDecryptionType.Existing`):

- `resolveDecryptionSecret` → `copyDecryptionSecret` (`create/utils/copyDecryptionSecret.ts`)
- Creates a **new** Secret with `generateName: ${planName}-` and label `forklift.konveyor.io/source-secret: <originalSecretName>` (`SOURCE_SECRET_LABEL`)
- Plan spec references the **copy**, not the original

**Details edit flow** (`SetLUKSEncryptionPasswords/`):

- `useEditLUKSState` watches plan LUKS secret; if `SOURCE_SECRET_LABEL` present, watches the source secret
- Auto-seeds `selectedSecret` from source secret on open (copy-on-select round-trip)
- If source secret deleted → `edit-luks-source-secret-unavailable-alert`, falls back to passphrase mode
- On save with auto-seeded secret, `confirmLuksDecryption` passes `labeledSourceSecretName`; label removal is best-effort on patch

Wizard field: `ExistingLUKSSecretField` + `LUKSSecretSelect` (shared). Create path: `DiskPassPhraseFieldTable`, `NBDEClevisField`.

---

## Migration Actions

`PlanActionsDropdown` → `PlanActionsDropdownItems` → `usePlanActionsDropdown`.

| Action | Modal / nav | Enable conditions | Disabled when |
|---|---|---|---|
| Edit / Edit YAML | navigate | list: not Executing/Paused/Pending/Archived | details → YAML tab |
| Start / Restart | `PlanStartMigrationModal` | `canPlanStart` or `canPlanReStart` | active migration exists, CannotStart |
| Resume conversion | `PlanResumeConversionModal` | `canPlanResumeConversion` (ConversionResumable condition) | no active migration |
| Schedule / Edit cutover | `PlanCutoverMigrationModal` | warm + Executing + not Archived + not Pending | `PlanEditCutoverButton` same gates |
| Duplicate | `DuplicateModal` | — | CannotStart |
| Archive | `ArchiveModal` | `canDelete` RBAC | Executing, Pending, already Archived |
| Delete | `PlanDeleteModal` | `canDelete` RBAC | Executing, Pending |

**`usePlanMigration`** (actions only): finds Migration with `Running=True` condition owned by plan UID. Gates Start (disabled when non-empty) and cutover (`activeMigration?.spec?.cutover`).

**Do not use `usePlanMigration` for migration resource scoping** — it only returns the running migration; failed/succeeded/restarted runs need `useLatestPlanMigration`.

---

## Plan Status (`details/components/PlanStatus/`)

`getPlanStatus(plan)` evaluation order: Archived → Unknown (no conditions) → Completed → Canceled → Paused (warm + VMs paused) → CannotStart (Critical) → Incomplete (Failed / VM error) → **Pending** (Executing but no VM started) → Executing → Ready → Validating → Unknown.

**`PlanStatuses` enum:** Ready, Executing, Pending, Paused, Completed, Incomplete, Canceled, CannotStart, Archived, Validating, Unknown.

**Permission helpers** (`planStatusPermissions.ts`):

- `canPlanStart` — Ready, not Executing/Succeeded, not archived
- `canPlanReStart` — Failed or Canceled
- `canPlanResumeConversion` — `ConversionResumable` condition True
- `isPlanEditable` — Ready, Canceled, Incomplete, Unknown, CannotStart (gates inline edits on Details/Mappings/VMs)

**Executing/Pending gates** also apply to: bulk selection, Archive/Delete actions, list-row Edit, `PlanEditCutoverButton`, `useCanInspectPlan`.

---

## DuplicateModal — Owned-Resource Copying

`DuplicateModal` → `useDuplicateModalResources` watches plan's NetworkMap, StorageMap, pre/post Hooks, scripts ConfigMap.

`createDuplicatePlanAndMapResources` (`actions/components/DuplicateModal/utils/`):

1. `k8sCreate` duplicate Hook(s), ConfigMap (if referenced)
2. `k8sCreate` new NetworkMap + StorageMap (random suffix names, same spec)
3. `k8sCreate` new Plan (`spec.archived: false`, updated `map`, VM hook refs, scripts ref)
4. `addOwnerRefsToResources` — patches ownerRef on NetworkMap, StorageMap, Hooks, ConfigMap → new Plan

Duplicate disabled until network + storage maps load. Does **not** copy LUKS secret (plan spec `luks` ref copied as-is).

---

## useLatestPlanMigration + useMigrationResources (MTV-6091)

### `useLatestPlanMigration` (`plans/hooks/useLatestPlanMigration.ts`)

Watches all Migrations in plan namespace, filters by owner UID = plan UID, returns **most recent** by `status.started` (fallback `creationTimestamp`) — any phase (Running/Failed/Succeeded).

### `useMigrationResources` (`MigrationStatusVirtualMachineList/hooks/useMigrationResources.ts`)

Uses `useLatestPlanMigration`, then watches Pods, Jobs, PVCs, DataVolumes with **both** label selectors:

```
matchLabels: { plan: <planUid>, migration: <latestMigrationUid> }
```

- Pods/PVCs/DVs: namespace = plan target namespace
- Jobs: namespace = plan namespace

Groups resources by VM ID, joins with plan spec VMs + `status.migration.vms` for `MigrationStatusVirtualMachinesList`.

**Blast radius:** Plan-only label matching mixes resources across migration restarts — always scope by both labels.

---

## Shared Component Usage

| Component | Used in |
|---|---|
| `StandardPageWithSelection` | List page (+ bulk actions toolbar) |
| `LoadingSuspend` | Utilization, Automation, Hooks, MigrationsSection |
| `PageHeadings` | Details header |
| `ModalForm` | All action modals, settings edit modals, Add VMs |
| `WizardStepContainer` | All wizard steps |
| `DetailsItem` / `DescriptionList` | Details tab, Mappings tab |
| `SectionHeading` / `ExpandableSectionHeading` | Details sections |
| `FieldBuilderTable` | Custom scripts, disk passphrases, hook scripts |
| `ProviderSelect` | General step (via provider feature) |
| `LUKSSecretSelect` | Wizard existing-LUKS field |
| `FilterableSelect` | Target namespace edit |
| `AffinityModal` / `LabelsModal` | Converter affinity/labels settings |
| `ConcernsColumnPopover` / `InspectionStatusColumnPopover` | VM spec list columns |
| `DrawerProvider` | VMs tab migration-status view |
| `TechPreviewLabel` | Custom scripts step |
| `LearningExperienceDrawer` | List, Create, Details |

---

## Data Sources

### K8s watches (`useK8sWatchResource`)

| Resource | Where |
|---|---|
| `V1beta1Plan` (list) | List page |
| `V1beta1Plan` (single) | `usePlan` → all detail tabs |
| `V1beta1Migration` (list) | `usePlanMigration`, `useLatestPlanMigration` |
| `V1beta1Provider` | Utilization tab, Mappings (`usePlanProviders`), wizard steps |
| `V1beta1NetworkMap` / `V1beta1StorageMap` | Mappings tab, DuplicateModal |
| `V1beta1Hook` | Hooks tab, DuplicateModal |
| ConfigMap (scripts) | Automation tab, DuplicateModal |
| Secret (LUKS) | Settings LUKS edit, wizard decryption |
| Pod / Job / PVC / DataVolume | `useMigrationResources` (label-scoped) |

### REST inventory (`useProviderInventory`)

| Sub-path | Where |
|---|---|
| `vms?detail=4` | Utilization tab, wizard VM selection |
| Networks/storages | Mappings tab resource hooks |

### Key hooks

| Hook | Purpose |
|---|---|
| `usePlan` | Single plan watch for all detail pages |
| `usePlanMigration` | Active (Running) migration — **actions only** |
| `useLatestPlanMigration` | Latest migration regardless of phase — **resource scoping** |
| `useMigrationResources` | Pods/Jobs/PVCs/DVs for VM migration status UI |
| `usePlanPages` | Detail tab definitions |
| `useCreatePlanForm` / `CreatePlanWizardContext` | Wizard form state |
| `useStepNavigation` | Wizard step + per-step validation |
| `usePlanActionsDropdown` | Action enablement + modal launchers |
| `usePlanProviders` / `usePlanMappingVms` | Mappings tab data |
| `usePlanNetworkMapResources` / `usePlanStorageMapResources` | Mappings inventories |
| `usePlanCustomScripts` / `usePlanHooks` | Automation + Hooks tabs |
| `useTargetStorages` | Wizard storage map submission |
| `useFeatureFlags` | Live migration gating |
| `useDuplicateModalResources` | Duplicate modal prefetch |

---

## Cross-Feature Connections

### Plans → Providers
- Spec references `spec.provider.source` / `spec.provider.destination`
- `ProviderSelect` in wizard; `usePlanSourceProvider` on details
- Deep-link from provider: `?sourceProvider=&planProject=`
- Migration type / settings gated by `sourceProvider.spec.type`

### Plans → NetworkMaps / StorageMaps
- Spec `spec.map.network` / `spec.map.storage`
- Wizard creates or copies maps; submission adds plan ownerRef
- Mappings tab edits via `PlanNetworkMapEdit` / `PlanStorageMapEdit` when `isPlanEditable`
- `createStorageMap` utility imported from `src/storageMaps/create/utils/`
- Duplicate creates fresh maps + ownerRefs

### Plans → Migrations
- Start/Restart creates Migration CR (backend); UI watches via `usePlanMigration` / `useLatestPlanMigration`
- VMs tab pipeline steps, cutover, pause/resume use migration status
- `sortMigrationsByStartedAtDate` shared util

### Plans → Hooks / ConfigMaps / Secrets
- VM-level hook refs in `spec.vms[].hooks`; wizard creates Hook CRDs
- `spec.customizationScripts` → ConfigMap; Automation tab
- `spec.luks` → decryption Secret; copy-on-select pattern for existing secrets

### Plans → Overview / Providers list
- Plan status labels and migration type reused in list columns
- Concerns drawer links to VM concerns from inventory

---

## Blast Radius Notes

- **`PlanStatus/utils/`** (`planStatusResolver`, `planStatusPermissions`, `types`) — imported by list filters, actions, VMs tab, Mappings edit gates, bulk actions, cutover button. Status logic changes affect entire plan UX.
- **`usePlanMigration` vs `useLatestPlanMigration`** — conflating them breaks resource scoping (MTV-6091) or action gating. Use the correct hook per context.
- **`submitMigrationPlan`** — parallel creates; mid-failure can orphan NetworkMap/StorageMap/Hook/Secret before ownerRef pass.
- **Wizard `stepFieldMap` / field constants** — renaming field IDs requires updating validation, review sections, and submit builders.
- **Mapping review tables** (`NetworkMapReviewTable`, `StorageMapReviewTable`) — shared between wizard Review step and Mappings tab.
- **`StandardPageWithSelection`** — shared with other list pages; plans-specific `postFilterData` and bulk eligibility live in list utils.
- **`ProviderSelect` / `useProviderInventory`** — changes affect wizard VM step, Utilization tab, Mappings inventories.
- **LUKS `SOURCE_SECRET_LABEL`** — must round-trip between create (`copyDecryptionSecret`) and edit (`useEditLUKSState`, patch label removal).
- **Feature flag `OCP_LIVE_MIGRATION`** — gates migration type step and transfer-network visibility in Other settings.
- **`DuplicateModal`** — creates 4–6 resources; ownerRef patching must stay in sync with `addOwnerRefsToResources` when adding new owned types.
