---
description: Network maps and storage maps architecture -- list, create, details pages, plan integration, offload plugins
alwaysApply: false
---

# Mappings Feature Architecture (`src/networkMaps/` + `src/storageMaps/`)

> Analyzed on 2026-09-17

Both features follow the same CRUD pattern (list → create form/YAML → details with tabs). Storage maps add offload-plugin complexity. Plugin registration: `networkMaps/dynamic-plugin.ts`, `storageMaps/dynamic-plugin.ts`.

Each registers list/details pages, nav items (admin + virtualization perspectives), form create route (`/k8s/{networkMaps|storageMaps}/create/form`), model metadata, and YAML template.

---

## Page Composition

### List Pages

**Network Maps** (`networkMaps/list/NetworkMapsListPage.tsx`):
```
LearningExperienceDrawer
└── StandardPage<NetworkMapData>
    ├── NetworkMapsAddButton ("Create with form" / "Create with YAML")
    ├── NetworkMapRow → cell renderers per column
    └── NetworkMapsEmptyState
```

**Storage Maps** (`storageMaps/list/StorageMapsListPage.tsx`): identical pattern with `StorageMap*` equivalents.

**Columns** (same schema for both):

| Column | Cell | Filter |
|--------|------|--------|
| Name | `*MapLinkCell` | freetext |
| Namespace | `NamespaceCell` | freetext |
| Status | `createStatusCell(ErrorStatusCell)` | enum (`MAP_STATUS`) |
| Source provider | `ProviderLinkCell` | freetext |
| Target provider | `ProviderLinkCell` | freetext |
| Owner | `PlanCell` (links to owning Plan) | freetext |
| Actions | `*MapActionsDropdown` | — |

### Create Forms

**Network Maps** (`networkMaps/create/NetworkMapCreatePage.tsx` → `CreateNetworkMapForm`):
```
CreateNetworkMapForm (react-hook-form)
├── MapNameField (optional, generateName fallback)
├── ProjectSelectField
├── SourceProviderField (ProviderSelect)
├── TargetProviderField (ProviderSelect)
└── CreateNetworkMapFieldTable (FieldBuilderTable)
    ├── Source: InventorySourceNetworkField
    └── Target: TargetNetworkField (@components/mappings/network-mappings/)
```

**Storage Maps** (`storageMaps/create/StorageMapCreatePage.tsx` → `CreateStorageMapForm`): same top-level structure with:
- `CreateStorageMapFieldTable` instead
- Source: `InventorySourceStorageField`
- Target: `TargetStorageField` or `TargetStorageWithSuggestion` (vSphere + copy offload)
- Expandable `OffloadStorageRow` per row (plugin, secret, product fields)

**Provider data for source options:**
- Networks: `useSourceNetworks(provider)` → `useProviderInventory` with subPath `networks`
- Storages: `useSourceStorages(provider)` → provider-type-specific inventory subPaths

**Submit:**
- Network: `createNetworkMap()` → `k8sCreate` with `buildNetworkMappings()`
- Storage: `createStorageMap()` → includes NetApp Shift label detection

**react-hook-form `defaultValues` (offload fields):**
- Create form: `{ storageMap: [defaultStorageMapping] }` where `defaultStorageMapping` (`storageMaps/utils/constants.ts`) sets optional offload fields to empty strings/arrays — `offloadPlugin: ''`, `storageSecret: ''`, `storageProduct: ''`, `dedicatedMigrationHosts: []`.
- Details edit modal: `transformStorageMapToFormValues(storageMap)` via `getOffloadConfigFields` / `resolveOffloadPlugin`; `reset(initialFormValues)` on storageMap change.
- Offload is "all or nothing" (`validateOffloadFields`): either all three (plugin, secret, product) are set, or none. Empty strings in `defaultStorageMapping` represent "no offload configured".

### Details Pages

**Both** share identical structure (Details + YAML tabs):
```
*MapDetailsPage → LoadingSuspend
├── *MapPageHeadings (title, critical conditions, actions, learning button)
└── HorizontalNav
    ├── Details tab
    │   ├── DetailsSection (name, namespace, created, owner)
    │   ├── MapProvidersDetails (+ MapProvidersEdit modal)
    │   ├── *MapReviewTable (+ *MapEdit modal)
    │   └── ConditionsSection
    └── YAML tab (ResourceYAMLEditorWrapper)
```

**Network edit:** `NetworkMapEdit` modal patches `/spec/map` via `k8sPatch`.
**Storage edit:** `StorageMapEdit` modal with offload support, transforms via `transformStorageMapToFormValues` / `transformFormValuesToK8sSpec` (and shared `createOffloadPluginConfig` / `resolveOffloadPlugin` under `storageMaps/utils`).

### Overlay Edit Modals — `useResolvedMapProviders`

Both `NetworkMapEdit` and `StorageMapEdit` are `OverlayComponent`s launched via `useOverlay`. They accept optional `sourceProvider` / `destinationProvider` launch props from the details page watch.

`useResolvedMapProviders` (`@utils/crds/maps/useResolvedMapProviders`) watches both providers from the map spec and resolves via `resolveProvider`:
1. Prefer freshly watched provider (has `metadata.uid`) over frozen launch props.
2. Fall back to launch props when watch has not resolved yet.

`useOverlay` freezes props at click time — without this hook, inventory would stay empty if the details-page watch had not resolved when the user clicked Edit.

**Confirm button gating:** `isDisabled={!isValid || !isDirty || !providersReady}`. Inventory load errors block the table; `providersLoadError` is surfaced in the table but does **not** block Confirm when launch-prop providers already resolved (`providersReady`).

### Actions

| Action | Both types |
|--------|-----------|
| Edit | Navigate to details or YAML tab |
| Delete | `DeleteModal` (gated by `permissions.canDelete`) |

Used in: list row actions + details page header.

---

## Hyper-V Multi-NIC / VLAN Network Mapping

Two related but distinct features in the **plan wizard** (not standalone network map create):

### Multi-NIC (NAD pool — MTV-5511)

`getMultiNicSourceNetworks` (`@components/mappings/network-mappings/utils/getMultiNicSourceNetworks`) detects source networks where at least one selected VM has multiple NICs on the same network. Uses per-NIC `nics[]` array for vSphere/Hyper-V (not deduplicated `networks[]`).

**UI behavior (plan wizard + plan edit):**
- `MultiNicInfoAlert` guides users to add extra mapping rows.
- `TargetNetworkField` gets `hideNonNadTargets={true}` for multi-NIC source networks — hides Pod network; only NAD targets allowed.
- `NewNetworkMapFields` clears Pod-network targets auto-assigned to multi-NIC sources.
- Duplicate source network rows are allowed (NAD pool mapping).

### Hyper-V VLAN disambiguation

`getHypervVlanQualifiedNetworks` (`plans/create/steps/network-map/hypervVlanNetworks.ts`) detects Hyper-V VMs where multiple NICs share the same switch/network but have different VLAN IDs. Returns VLAN-qualified `MappingValue` entries:
- `{ id: networkId, name: "Switch (VLAN 100)", vlan: "100" }`
- `{ id: networkId, name: "Switch (Untagged)", vlan: "0" }`

`getSourceNetworkValues` (`plans/create/steps/network-map/utils.ts`) replaces plain inventory entries with VLAN-qualified ones when conflicts exist. `buildNetworkMappings` / `getMappingValues` round-trip the `vlan` field on `spec.map[].source`.

**Standalone network map create** (`InventorySourceNetworkField`) does **not** perform VLAN disambiguation — no VM context at provider inventory level. Comment in component references `getHypervVlanQualifiedNetworks` for plan-only behavior.

---

## Offload Plugins (Storage Maps)

### Plugin keys

| Key | Label | Use case |
|-----|-------|----------|
| `vsphereXcopyConfig` | vSphere XCOPY | vSphere copy offload; supports `dedicatedMigrationHosts` |
| `csiVolumeImport` | CSI Volume Import | CSI-based import (MTV-5483); no dedicated hosts |

Enum: `OffloadPlugin` in `storageMaps/utils/types.ts`. Discovery: `useOffloadPlugins` reads CRD schema (`useStorageMapCrd` + `getStorageMapSchema`), filtered to client-supported plugins; falls back to `offloadPlugins` constants.

Gated by `FEATURE_NAMES.COPY_OFFLOAD` (`feature_copy_offload`).

### `resolveOffloadPlugin`

Reads CR/form `offloadPlugin` block and returns active plugin key or `''`:
- `csiVolumeImport` takes priority when both configured.
- Empty `{}` blocks are not configured — requires `secretRef` or `storageVendorProduct`.
- `getOffloadConfigFields` extracts form-facing fields from the active block.

### `createOffloadPluginConfig`

Form → CR transform. Returns `undefined` when plugin/secret/product incomplete or product not allowed. Builds:
- `csiVolumeImport: { secretRef, storageVendorProduct }` — no dedicated hosts.
- `vsphereXcopyConfig: { secretRef, storageVendorProduct, dedicatedMigrationHosts? }`.

Used by `buildStorageMappings` (create) and `transformFormValuesToK8sSpec` (edit).

### Vendor product allowlists

- **CSI Volume Import:** gated to `CSI_VOLUME_IMPORT_VENDOR_PRODUCTS` (`primera3par`, `ontap`) via `isVendorProductAllowedForPlugin`.
- **vSphere XCOPY:** accepts any non-empty product (CRD-discovered vendors not stripped on save).
- `useStorageVendorProducts(offloadPlugin)` reads CRD enum when available; falls back to static lists.

### Offload UI components

- `OffloadStorageRow` / `OffloadStorageIndexedForm` — expandable per-row offload fields.
- `useOffloadStorageFormState` — watches indexed fields, clears incompatible product/hosts on plugin change, validates via `validateOffloadFields`.
- `TargetStorageWithSuggestion` — vSphere datastore vendor hints via `useDatastoreVendor`.
- `OffloadOptimalityHint` — match status (optimal/suboptimal) from datastore vs StorageClass CSI provisioner.

**Never hardcode XCOPY** — form ↔ CR transforms must round-trip the selected plugin key.

---

## Plan Wizard Integration

Registered in `CreatePlanWizardInner.tsx` as steps 5 (Network) and 6 (Storage).

### Network Map Step (`plans/create/steps/network-map/NetworkMapStep.tsx`)

Radio: **Existing** vs **New** map.
- Existing: `ExistingNetworkMapField` — ownerless maps only; cloned on plan create via `copyNetworkMap`.
- New: `NewNetworkMapFields` → `NetworkMapFieldTable` with VM-aware source networks, multi-NIC alert, VLAN qualification, `validateNetworkMap`.

Plan submit: plan-local `plans/create/utils/createNetworkMap.ts` (not shared with standalone create).

### Storage Map Step (`plans/create/steps/storage-map/StorageMapStep.tsx`)

Same Existing/New pattern. New: `NewStorageMapFields` → `CreatePlanStorageMapFieldTable` (reuses `GroupedSourceStorageField`, `OffloadStorageRow`, `TargetStorageField`).

Plan submit: reuses `storageMaps/create/utils/createStorageMap.ts` (shared).

### Plan details — Mappings tab

- `PlanNetworkMapEdit`, `PlanStorageMapEdit` use same field tables/validation as wizard.
- `usePlanNetworkMapResources`, `usePlanStorageMapResources` import `getMappingValues` / `getStorageMappingValues`.

### Review tables

- `NetworkMapReviewTable` — network map details, plan mappings, plan review.
- `StorageMapReviewTable` — storage map details, plan mappings, plan review.

---

## Duplicate Source Rows

### Network maps (MTV-5511)
Multiple rows with the same source network allowed — NAD pool mapping for multi-NIC VMs.

### Storage maps (MTV-6324)
Same source storage on multiple rows allowed — multi-plugin / multi-target offload (e.g. XCOPY vs CSI to different StorageClasses).

**Plan storage remove logic:** `isSoleMappingOfUsedSource` — a used VM storage must stay covered; duplicate rows for the same used source may be removed, but the last covering row cannot.

**Validation:** Create and details Edit require every row complete; empty/incomplete rows block Create/Save (not stripped on submit).

---

## Shared Component Usage

| Component | Used by |
|-----------|---------|
| `StandardPage` | Both list pages |
| `FieldBuilderTable` | All create/edit mapping tables |
| `ProviderSelect` | Both source/target provider fields |
| `ProjectSelect` | Both project fields |
| `ModalForm` + patch constants | Both edit modals |
| `MapProvidersDetails` / `MapProvidersEdit` | Both details tabs |
| `common/Select` | Inventory source fields, storage target, offload fields |
| `LoadingSuspend` | Both details/YAML tabs |
| `ResourceYAMLEditorWrapper` | Both YAML tabs |
| `DeleteModal` | Both actions |
| `TargetNetworkField` | Network create/edit, plan wizard (from `@components/mappings/network-mappings/`) |

---

## Data Sources

### K8s Watches

| Resource | Network Maps | Storage Maps |
|----------|:-----------:|:------------:|
| `NetworkMap` / `StorageMap` | ✓ | ✓ |
| `Provider` (source/dest) | ✓ | ✓ |
| `CustomResourceDefinition` (StorageMap CRD) | — | ✓ |
| `Secret` | — | ✓ (offload) |

### Inventory / Feature Hooks

| Hook | Purpose |
|------|---------|
| `useSourceNetworks` | Source networks via provider inventory REST |
| `useOpenShiftNetworks` | NADs on OpenShift target |
| `useTargetNetworks` | OpenShift target network options (default pod network + NADs) |
| `useSourceStorages` | Source datastores/storage domains (provider-type-specific) |
| `useTargetStorages` | Target StorageClasses (virt-default → k8s-default ordering, NetApp Shift) |
| `useProviderInventory` | Low-level Forklift inventory REST client |
| `useStorageMapCrd` | CRD schema for enum discovery |
| `useOffloadPlugins` | Offload plugin names from CRD + constants |
| `useStorageVendorProducts` | Vendor product enum from CRD |
| `useDatastoreVendor` | vSphere SCSI disk → vendor for offload hints |
| `useFeatureFlags` | `feature_copy_offload` gate (storage only) |
| `useResolvedMapProviders` | Provider resolution in overlay edit modals |

---

## Cross-Feature Connections

### Providers → Mappings
- Both require source + target providers with collected inventory (Ready phase).
- `PROVIDER_TYPES` used in `buildNetworkMappings`, `buildStorageMappings`.
- Empty states redirect to providers list when `useHasSufficientProviders` is false.

### External imports of mapping code

| Consumer | Imports |
|----------|---------|
| `plans/**` | Types, constants, build utils, storage components, review tables |
| `utils/crds/maps/shared.ts` | `NetworkMapData`, `StorageMapData` types |
| `utils/hooks/useTargetStorages.ts` | `TargetStorage`, NetApp Shift utils from storageMaps |

---

## Structural Similarities and Differences

| Aspect | Network Maps | Storage Maps |
|--------|-------------|--------------|
| Complexity | Simple 2-column mapping | Offload plugins, vendor products, secrets, NetApp Shift |
| Target field | Shared `@components/mappings/` | Feature-local `TargetStorageField` etc. |
| CRD schema hooks | None | `useStorageMapCrd`, offload/product enum discovery |
| Plan create util | Duplicated in plans | Reused from storageMaps |
| Feature flags | None | `FEATURE_NAMES.COPY_OFFLOAD` |
| VM-aware source options | Plan wizard only (VLAN, multi-NIC) | Plan wizard (grouped by VM usage) |

---

## Blast Radius Notes

### Changes to shared components that break both mappings
- `StandardPage` → both list pages
- `FieldBuilderTable` → all create/edit mapping tables
- `MapProvidersDetails/Edit` → both details provider sections
- `ModalForm` → all edit modals
- `useResolvedMapProviders` / `resolveProvider` → both edit modals
- `getMapPhase` (`utils/crds/maps/shared.ts`) → both list status columns

### Network-specific exports consumed elsewhere
- `TargetNetworkField`, `getMultiNicSourceNetworks`, `MultiNicInfoAlert` → plan wizard, plan edit
- `buildNetworkMappings` / `getMappingValues` → plan mapping hooks, details
- `getHypervVlanQualifiedNetworks` → plan wizard source network options only

### Storage-specific exports consumed elsewhere (high blast radius)
- `TargetStorageField`, `TargetStorageWithSuggestion`, `GroupedSourceStorageField`, `OffloadStorageRow` → plan wizard, plan storage edit
- `createStorageMap`, `buildStorageMappings`, `resolveOffloadPlugin`, `createOffloadPluginConfig` → plan submit, plan edit, details edit
- `validateOffloadFields`, offload utils → plan storage validation
- `TargetStorage` type, `useTargetStorages` → shared utils hook
