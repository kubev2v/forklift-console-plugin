---
description: Shared components catalog with "used by" index across all feature directories
alwaysApply: false
---

# Shared Components Architecture (`src/components/`)

> Analyzed on 2026-09-17

~416 TS/TSX files. **449 importing files** across the five feature directories.

**Dependency rule:** Feature code (`providers/`, `plans/`, `networkMaps/`, `storageMaps/`, `overview/`) may import from `@components/*`. Shared code must **never** import from feature code.

---

## Page Layout & List Infrastructure

| Component | Path | Purpose |
|-----------|------|---------|
| `StandardPage` | `page/StandardPage.tsx` | Full list page: filters, sort, pagination, optional selection |
| `StandardPageWithSelection` | `page/StandardPageWithSelection.tsx` | StandardPage + enforced selection/expand props |
| `WizardStepContainer` | `common/WizardStepContainer.tsx` | Plan create wizard step wrapper |
| `RoutedTabs` | `common/RoutedTabs/RoutedTabs.tsx` | URL-synced tab navigation |
| `PageHeadings` | `DetailPageHeadings/PageHeadings.tsx` | Detail page title/breadcrumbs/actions |
| `SectionHeading` | `headers/SectionHeading.tsx` | Section title in detail views |
| `SectionHeadingWithEdit` | `headers/SectionHeadingWithEdit.tsx` | Section title + edit button |
| `ExpandableSectionHeading` | `ExpandableSectionHeading/` | Collapsible section header |
| `ExpandableReviewSection` | `ExpandableReviewSection/` | Plan wizard review accordion |
| `DrawerProvider` | `DrawerContext/DrawerProvider.tsx` | Side drawer context |

### StandardPage / StandardPageWithSelection

**StandardPage** composes `TableSortContextProvider` → `StandardPageInner` → `PageToolbar` (FilterGroup) + `PageTable` (TableView). Props: `dataSource: [data, loaded, error]`, `fieldsMetadata: ResourceField[]`, optional `row`/`cell`/`header`, `userSettings`, `pagination`, `showManageColumns`.

**StandardPageWithSelection** wraps StandardPage with compile-time discriminated unions:

| Mode | Required props | Optional |
|------|----------------|----------|
| Selection | `onSelect`, `selectedIds`, `toId` | `canSelect`, `getSelectDisabledReason`, `expandedIds`, `onExpand` |
| Expansion only | `expandedIds`, `onExpand`, `toId` | — |
| Neither | — | all selection/expand props forbidden |

- `canSelect?: (item: T) => boolean` — defaults to `() => true`; disables row checkbox when false. Used by migration VM list (status-gated) and inspection VM table (`!item.isActive`).
- `getSelectDisabledReason` — tooltip text for disabled checkboxes.
- Wraps page in `PageSelectionProvider`; injects `createRowWithSelection` + `withTr`, `createHeaderWithSelection`, and toolbar actions via `createToolbarActionWithSelection`.

**PageSelection context split** (`page/context/`):

| Context | Holds | Consumers |
|---------|-------|-----------|
| `PageSelectionConfigContext` | Stable refs: `canSelectRef`, `toIdRef`, `cellRef`, `toggleSelectForRef`, `toggleExpandForRef`, `hasSelection`, `hasExpansion` | `SelectionRow`, toolbar actions |
| `PageSelectionStateContext` | Reactive state: `selectedIds`, `expandedIds` | Row/header checkbox rendering |

Hooks: `usePageSelectionConfig<T>()`, `usePageSelectionState()`. Config uses refs so row components don't re-render on every selection change.

**List page consumers:**

| Page | Component | Selection? |
|------|-----------|------------|
| `ProvidersListPage` | StandardPage | No |
| `PlansListPage` | StandardPageWithSelection | Bulk archive |
| `NetworkMapsListPage`, `StorageMapsListPage` | StandardPage | No |
| `MigrationsListPage` (overview) | StandardPage | No |
| `PlanConcernsPanel` | StandardPage | No |
| Provider VM lists (non-vSphere) | StandardPageWithSelection | Optional (`onSelect`) or expansion-only |
| Plan spec VMs, migration status VMs | StandardPageWithSelection | Yes |
| Provider hosts (vSphere, Hyper-V) | StandardPageWithSelection | Yes |
| `InspectionVmTable` | StandardPageWithSelection | Yes (`canSelect`) |

---

## Tables & List Cells

| Component | Path | Purpose |
|-----------|------|---------|
| `TableView` | `common/TableView/TableView.tsx` | Sortable PF table with stable row keys |
| `DefaultRow` / `withTr` | `common/TableView/` | Row wrapper; `withTr` adds expand chevron |
| `DefaultHeader` / `DefaultSelectHeader` | `common/TableView/` | Column headers; select header adds bulk checkbox |
| `useFields` | `common/Page/useFields.tsx` | Column visibility + user-settings persistence |
| `TableCell` family | `TableCell/` | Link, label, icon, empty, visible-data cells |
| `TableBulkSelect` | `TableBulkSelect.tsx` | Header checkbox for bulk select |
| `TableSortContextProvider` | `TableSortContextProvider.tsx` | Sort state provider |
| `FieldBuilderTable` | `FieldBuilderTable/FieldBuilderTable.tsx` | Dynamic mapping rows (add/remove) |
| `VsphereFolderTreeTable` | `VsphereFoldersTable/` | vSphere VM folder tree table |
| `createStatusCell` | `table/utils/createStatusCell.tsx` | Factory for status column cells |

### TableView pattern

1. Define `ResourceField[]` with `resourceFieldId`, `render`, `sortable`, filter metadata.
2. Create `*Row.tsx` implementing `RowProps<T>` (`resourceData`, `resourceFields`, `namespace`, `isExpanded`).
3. Compose `StandardPage` with `row={MyRow}`, `fieldsMetadata`, `dataSource`.
4. `useFields` + `userSettings` (via `loadUserSettings`) persist column order/visibility per page ID.
5. `TableView` uses `uidFieldId` (default `UID`) for stable keys; `visibleColumns` drives header + cells.

Row components read selection state via `usePageSelectionConfig` / `usePageSelectionState` when inside `StandardPageWithSelection`.

### VsphereFoldersTable — tree pagination

Custom tree table for vSphere provider VM inventory (`VSphereVirtualMachinesList`). **Does not use StandardPage.**

Pipeline: `useTreeRows` → `useTreeSortBlocks` → `useTreeVMFilters` → **`useTreePagination`** → `TreeTableBody`.

**`useTreePagination`** counts only user-visible items:
- **Collapsed folders** (no visible child VMs) = one paginated row (user can expand).
- **Expanded folders** = free context headers; child VMs consume pagination slots.
- Concerns sub-rows ride along with their VM without extra slots.

Also: `AttributeFilter` toolbar, `usePagination` for page/perPage state, `InspectVirtualMachinesButton` in toolbar, inspection status columns via `InspectionStatusColumnPopover` / `InspectionConcernBadges`.

---

## Filters

| Component | Path | Purpose |
|-----------|------|---------|
| `FilterGroup` | `common/FilterGroup/FilterGroup.tsx` | Multi-filter toolbar |
| `AttributeValueFilter` | `common/FilterGroup/AttributeValueFilter.tsx` | Filter chip UI |
| `useUrlFilters` | `common/FilterGroup/useUrlFilters.ts` | Sync filters to URL |
| `EnumFilter`, `GroupedEnumFilter`, `SwitchFilter`, `DateFilter` | `common/Filter/` | Typed filter renderers |
| `ResourceField` types | `common/utils/types.ts` | Column + filter definitions |

---

## Forms & Inputs

| Component | Path | Purpose |
|-----------|------|---------|
| `Select` (custom) | `common/Select.tsx` | Project-standard PF Select wrapper — **always use instead of PF Select** |
| `FilterableSelect` | `FilterableSelect/FilterableSelect.tsx` | Searchable/creatable select |
| `TypeaheadSelect` / `MultiTypeaheadSelect` | `common/TypeaheadSelect/` | Typeahead / multi-select |
| `ProjectSelect` | `common/ProjectSelect/ProjectSelect.tsx` | Namespace/project picker |
| `ProviderSelect` | `ProviderSelect/ProviderSelect.tsx` | Provider dropdown with icons |
| `FormGroupWithHelpText` | `common/FormGroupWithHelpText/` | PF FormGroup + helper/error text |
| `FormGroupWithErrorText` | `common/FormGroupWithErrorText.tsx` | Form group wired to RHF errors |
| `FormErrorHelperText` | `FormErrorHelperText.tsx` | Standalone form error text |
| `HelpIconPopover` | `common/HelpIconPopover/` | `?` icon with popover help |
| `InputList` | `InputList/InputList.tsx` | Dynamic list of inputs |
| `TargetNetworkField` / `SourceNetworkField` | `mappings/network-mappings/` | Network map fields |

### Select pattern

`common/Select` enforces: `id`, `value`, `onSelect`, `options[]` (`label`/`value`), `placeholder`, `testId`, `status` (MenuToggleStatus). Used in plan wizard, storage map forms, settings dropdowns. `ProviderSelect` and `FilterableSelect` build on top for provider icons and creatable options.

---

## Modals & Confirmations

| Component | Path | Purpose |
|-----------|------|---------|
| `ModalForm` | `ModalForm/ModalForm.tsx` | Standard edit modal (loading, errors, confirm) |
| Patch constants (`ADD`, `REPLACE`, `REMOVE`) | `ModalForm/utils/constants.ts` | JSON patch ops for `k8sPatch` |
| `DeleteModal` | `modals/DeleteModal/DeleteModal.tsx` | Generic K8s delete modal |
| `CreateProjectModal` | `modals/CreateProjectModal.tsx` | Create namespace/project |

Launch modals with Console SDK `useOverlay` + `OverlayComponent`. Pass `closeOverlay` to `ModalForm`.

---

## Loading & Status

| Component | Path | Purpose |
|-----------|------|---------|
| `LoadingSuspend` | `LoadingSuspend.tsx` | Spinner until obj loaded without error |
| `StatusIcon` | `status/StatusIcon.tsx` | Phase → icon mapper (K8s/pod/plan conditions) |
| `STATUS_ICONS` | `status/statusIcons.tsx` | Themed PF6 icons: `danger`, `warning`, `success`, `info` |
| `ConsoleTimestamp` | `ConsoleTimestamp/ConsoleTimestamp.tsx` | Console-style relative time |
| `ProviderIconLink` | `ProviderIconLink.tsx` | Provider icon + link |

### Status icons

- **`STATUS_ICONS`** — use for static severity display (concerns popover, overview alerts, `useStatusPhaseValues`). Respects PF6 theming via `Icon status={PF_LABEL_STATUS.*}`.
- **`StatusIcon`** — maps condition `phase` strings (Ready, Failed, Running, Pending, …) to icons. Used in plan conditions, plan details critical alert, overview health pods table.
- **Plan-specific:** `migrationStatusIconMap` in `plans/details/components/PlanStatus/utils/statusIconMapper.tsx` + `VMStatusIconsRow` (plans list, migrations table, overview history).
- **Concerns:** `Concerns/utils/category.tsx` maps `ConcernCategoryOptions` → `STATUS_ICONS`.

---

## Detail Display

| Component | Path | Purpose |
|-----------|------|---------|
| `DetailsItem` + prebuilt items | `DetailItems/` | Description list rows (name, namespace, owner, created) |
| `ConditionsSection` | `ConditionsSection/ConditionsSection.tsx` | Conditions table for CRs |
| `MapProvidersDetails` / `MapProvidersEdit` | `MapProvidersDetails/` | Map provider summary + edit |
| `ResourceYAMLEditorWrapper` | `ResourceYAMLEditorWrapper/` | YAML tab for resources |
| `ExternalLink` | `common/ExternalLink/` | Doc/external links |

---

## Domain-specific

| Component | Path | Purpose |
|-----------|------|---------|
| `ConcernsColumnPopover`, `ConcernsAndConditionsTable` | `Concerns/`, `ConcernsAndConditionsTable/` | VM concerns in tables |
| `InspectVirtualMachines*` | `InspectVirtualMachines/` | Deep inspection (Conversion CR) UI |
| `AffinityModal`, `NodeSelectorModal`, `LabelsModal` | respective dirs | Plan VM affinity, node selector, labels |
| `OvaFileUploader`, `VddkUploader` | respective dirs | OVA / VDDK upload |
| `TechPreviewLabel`, `DevPreviewLabel` | `PreviewLabels/` | Preview badges |

### InspectVirtualMachines

Deep inspection flow creating `Conversion` CRs (`CONVERSION_TYPE.DEEP_INSPECTION`).

| Piece | Role |
|-------|------|
| `InspectVirtualMachinesButton` | Toolbar button; launches modal via `useOverlay` |
| `InspectVirtualMachinesModal` | `ModalForm` shell; plan or provider flow |
| `InspectionVmTable` | `StandardPageWithSelection` + `canSelect` (skip active inspections) |
| `InspectionExpandedSection` | Expandable concern details (plan spec VMs + vSphere tree) |
| `InspectionStatusLabel`, `InspectionConcernBadges`, `InspectionStatusColumnPopover` | Status display in tables |

**Consumers:** plan spec VM list toolbar + columns; vSphere folder tree toolbar + VM rows. Watches conversions via `useWatchConversions` + `useVmInspectionStatus`.

---

## "Used By" Index

File counts per feature directory (grep for component name in `src/<feature>/`).

### Tier 1 — all 5 features

| Component | providers | plans | networkMaps | storageMaps | overview |
|-----------|:---------:|:-----:|:-----------:|:-----------:|:--------:|
| **ModalForm** (+ patch constants) | 21 | 57 | 1 | 3 | 2 |
| **LoadingSuspend** | 4 | 5 | 2 | 2 | 4 |
| **ResourceYAMLEditorWrapper** | 1 | 1 | 1 | 1 | 1 |
| **DetailItems** | 33 | 31 | 1 | 1 | 1 |
| **ResourceField** / filter types | heavy | heavy | ✓ | ✓ | ✓ |
| **SectionHeading**\* | ✓ | ✓ | ✓ | ✓ | ✓ |
| **HelpIconPopover** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **FormGroupWithHelpText** | ✓ | ✓ | ✓ | ✓ | ✓ |

### Tier 2 — 4 features

| Component | providers | plans | networkMaps | storageMaps | overview |
|-----------|:---------:|:-----:|:-----------:|:-----------:|:--------:|
| **StandardPage** | 4 | 5 | 1 | 1 | 1 |
| **TableView** / `RowProps` | ✓ | ✓ | ✓ | ✓ | ✓ |
| **FilterGroup** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **common/Select** | ✓ | ✓ | ✓ | ✓ | — |
| **FormGroupWithErrorText** | ✓ | ✓ | ✓ | ✓ | — |
| **PageHeadings** | ✓ | ✓ | ✓ | ✓ | — |
| **DeleteModal** | ✓ | ✓ | ✓ | ✓ | — |

### Tier 3 — 2–3 features

| Component | Consumers |
|-----------|-----------|
| **StandardPageWithSelection** | providers (VM lists, hosts), plans (list, spec VMs, migration VMs) |
| **FieldBuilderTable** | plans (8), networkMaps (2), storageMaps (2) |
| **ProviderSelect** | plans, networkMaps, storageMaps |
| **MapProvidersDetails/Edit** | networkMaps, storageMaps |
| **ConcernsAndConditionsTable** | providers, plans |
| **TableSortContextProvider** | providers (7), plans (1) |
| **ProviderIconLink** | providers, plans |
| **TechPreviewLabel** | providers, plans |
| **mappings/network-mappings** | plans, networkMaps |
| **StatusIcon** / **STATUS_ICONS** | plans, overview (+ concerns in providers/plans) |
| **FilterableSelect** | providers, plans |
| **createStatusCell** | networkMaps, storageMaps |

### Tier 4 — single feature

| Component | Consumer |
|-----------|----------|
| **WizardStepContainer**, **ExpandableReviewSection** | plans |
| **DrawerProvider**, **InspectVirtualMachines** (entry) | plans |
| **AffinityModal**, **NodeSelectorModal**, **LabelsModal**, **InputList** | plans |
| **VsphereFolderTreeTable** | providers (vSphere VMs only) |
| **OvaFileUploader**, **VddkUploader** | providers |
| **RoutedTabs**, **LightspeedMcpWarning** | overview |

---

## Internal Dependency Graph

```
StandardPage → StandardPageInner → PageToolbar (FilterGroup) + PageTable (TableView)
StandardPageWithSelection → PageSelectionProvider → StandardPage + SelectionRow/withTr
ProviderSelect → common/Select + ExternalLink
ProjectSelect → TypeaheadSelect + CreateProjectModal
VsphereFolderTreeTable → useTreePagination + Concerns + InspectVirtualMachines
InspectVirtualMachines → StandardPageWithSelection + ModalForm + Conversion watches
```

---

## Blast Radius

### Critical (most of the app)

1. **ModalForm** — ~84 files; every edit modal.
2. **ResourceField / filter types** — all list pages, filters, sort.
3. **StandardPage + FilterGroup + TableView** — all list pages.
4. **DetailItems** — ~67 files; universal detail-tab layout.
5. **TableCell primitives** — all `*Row.tsx` list components.

### High

6. **common/Select** — ~21 files; dropdowns in create flows and settings.
7. **FormGroupWithHelpText / FormGroupWithErrorText** — form validation UX.
8. **LoadingSuspend** — detail tab loading guards.

### Medium (scoped but deep)

9. **StandardPageWithSelection + PageSelection contexts** — bulk actions, VM selection, expansion.
10. **FieldBuilderTable** — map editors + plan mapping steps.
11. **VsphereFolderTreeTable / InspectVirtualMachines** — large vSphere + inspection surfaces.
12. **STATUS_ICONS / StatusIcon** — status display across plans and overview.

### Low

- `RoutedTabs`, `LightspeedMcpWarning` — overview only
- `images/logos` — visual only

---

## Practical Notes

- Import paths are mixed (`@components/...`, `src/components/...`, relative) — grep all variants when assessing impact.
- New modals → `ModalForm`; new dropdowns → `common/Select`; new list pages → `StandardPage` + `ResourceField[]`.
- For selectable lists, prefer `StandardPageWithSelection` over wiring selection into `StandardPage` directly.
- Use `STATUS_ICONS` for severity; `StatusIcon` for K8s/condition phase strings.
- vSphere VM inventory is the only consumer of `VsphereFoldersTable` — changes don't affect flat VM lists.
