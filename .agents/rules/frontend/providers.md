---
description: Provider pages - list, create, details (per-type dispatch), tabs, actions, modals
alwaysApply: false
---

# Provider Pages

> Analyzed on 2026-09-17

## Page Composition

### Route entry points (`src/providers/dynamic-plugin.ts`)

| Extension | Component | File |
|---|---|---|
| `console.page/resource/list` | `ProvidersListPage` | `src/providers/list/ProvidersListPage.tsx` |
| `console.page/resource/details` | `ProviderDetailsPage` | `src/providers/details/ProviderDetailsPage.tsx` |
| `console.resource/create` | `ProvidersCreatePage` | `src/providers/create/ProvidersCreatePage.tsx` |

Nav items (`console.navigation/resource-ns`): `admin` and `virtualization-perspective`.

### List page

```
ProvidersListPage
├── LearningExperienceDrawer
│   └── StandardPage<ProviderData>
│       ├── ProvidersAddButton
│       ├── ProviderRow → ProviderDataCell (per-column renderer)
│       ├── ProvidersEmptyState
│       └── InventoryNotReachable (inventory API down)
```

List row actions: `ProviderActionsDropdown` (kebab; no `isDetailsPage`).

### Create page

```
ProvidersCreatePage
├── LearningExperienceDrawer
│   ├── Title + LearningExperienceButton
│   └── CreateProviderForm
│       ├── FormProvider (react-hook-form)
│       │   └── CreateProviderFormContextProvider (existing names for uniqueness)
│       │       └── ProviderTypeFields (conditional per type)
│       ├── Create / Cancel
│       └── Telemetry: PROVIDER_CREATE_STARTED / COMPLETED / FAILED
```

Pre-select type from `?providerType=` URL param (validated against `PROVIDER_TYPES`).

**Per-type create fields** (`ProviderTypeFields.tsx`):

| Type | Fields |
|---|---|
| `ec2` | Ec2RegionField, Ec2CredentialsFields, Ec2TargetSettingsFields, Ec2CrossAccountCredentialsFields |
| `ova` | NfsDirectoryField, OvaApplianceManagementField |
| `openshift` | OpenShiftUrlField, ServiceAccountTokenField, CertificateValidationField |
| `openstack` | OpenStackUrlField, OpenStackAuthenticationTypeField (5 auth strategies), CertificateValidationField |
| `ovirt` | OvirtUrlField, OvirtCredentialsFields, CertificateValidationField |
| `vsphere` | VsphereEndpointTypeField, VsphereUrlField, VsphereVddkField, VsphereCredentialsFields, CertificateValidationField |
| `hyperv` | HypervManagementTypeField, HypervCredentialsFields, CertificateValidationField |
| `nutanix` | NutanixPrismTypeField, NutanixUrlField, NutanixCredentialsFields, CertificateValidationField |

Submit: `buildProviderResources` → `createProviderSecret` → `createProvider` → `patchProviderSecretOwner` → navigate to details.

### Details page — type dispatch

```
ProviderDetailsPage
├── useK8sWatchResource<V1beta1Provider>
├── LoadingSuspend / ErrorState
└── ProviderDetailsPageByType (switch on spec.type)
    ├── OpenshiftProviderDetailsPage
    ├── VSphereProviderDetailsPage
    ├── OVirtProviderDetailsPage
    ├── OpenStackProviderDetailsPage
    ├── OvaProviderDetailsPage
    ├── HypervProviderDetailsPage
    ├── Ec2ProviderDetailsPage
    └── NutanixProviderDetailsPage
```

Each per-type page shares:

```
<Type>ProviderDetailsPage
└── ProviderDetailsLayout
    ├── ProviderIssuesDrawer → ProviderIssuesPanel (Critical + Warn conditions table)
    ├── ProviderPageHeader
    │   ├── PageHeadings
    │   ├── ProviderPageHeaderAlerts (InventoryNotReachable + ProviderIssuesAlerts)
    │   ├── LearningExperienceButton
    │   ├── CreatePlanAction
    │   └── ProviderActionsDropdown (isDetailsPage)
    └── HorizontalNav (Console SDK tabs)
```

**Elevated conditions (MTV-6656):** Header shows a danger alert with count of active (`status: True`) `Critical` and `Warn`/`Warning` conditions. “View all issues” opens the inline drawer (same interaction as plan concerns). Advisory/Required conditions remain in Details → Conditions only.

### Tabs per provider type

| Tab | openshift | vsphere | ovirt | openstack | ova | hyperv | ec2 | nutanix |
|---|---|---|---|---|---|---|---|---|
| Details | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| YAML | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Credentials | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ |
| Virtual machines | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| ESXi hosts | — | ✓ | — | — | — | — | — | — |
| Hosts | — | — | — | — | — | ✓ (cluster only) | — | — |
| Networks | ✓ | — | — | — | — | — | — | — |

Hyper-V **Hosts** tab is added only when `isHypervClusterProvider(provider)` is true.

### Tab internals (1–2 levels)

**Details tab** (`ProviderDetailsTabPage`):
```
ProviderDetailsTabPage
├── DetailsSection → getDetailsSectionByType() (8 per-type sections)
├── UploadFilesSection (OVA-only)
├── SecretsSection
├── InventorySection → getInventorySectionByType() (8 per-type sections)
└── ConditionsSection
```

**YAML tab**: `ResourceYAMLEditorWrapper` + `useProvider`.

**Credentials tab**: `useProvider` + `useK8sWatchResource<Secret>` + `useAccessReview` (patch); `EditProviderCredentials` modal via `useOverlay`; hidden for `ova` in actions dropdown.

**Virtual machines tab**:
```
ProviderVirtualMachinesTabPage
├── useInventoryVms({ provider })
└── VirtualMachinesListSection (switch on type → 8 per-type lists)
    └── ProviderVirtualMachinesList (StandardPage shell per type)
```

**Hosts tab** (`ProviderHostsTabPage`):
- `vsphere` → `VSphereHostsList` (`useProviderInventory` `hosts?detail=4` + `useK8sWatchResource<Host>`)
- Hyper-V cluster → `HypervHostsList` (`useProviderInventory` `hosts?detail=4`)

**Networks tab** (OpenShift only): NAD table via `useProviderInventory` `networkattachmentdefinitions?detail=4`; `EditProviderDefaultTransferNetwork` modal patches `forklift.konveyor.io/defaultTransferNetwork` annotation.

### Actions (`src/providers/actions/`)

`ProviderActionsDropdown` uses `isDetailsPage`:
- **List** (default): plain kebab (`EllipsisVIcon`)
- **Details** (`isDetailsPage`): "Actions" button (`forklift-dropdown` class)

`ProviderActionsDropdownItems`:
| Action | List | Details |
|---|---|---|
| Edit / Edit YAML | Navigate to details | Navigate to `/yaml` |
| Edit provider credentials | Navigate to `/credentials` | Same (hidden for `ova`) |
| Delete provider | `DeleteModal` via `useOverlay` | Same |

---

## Shared Component Usage

| Shared component (`src/components/*`) | Where used |
|---|---|
| `page/StandardPage` | List page |
| `page/StandardPageWithSelection` | vSphere / Hyper-V hosts lists |
| `LoadingSuspend` | Details dispatch, Credentials tab, VMs tab |
| `common/Page/PageStates` (`ErrorState`) | Details, VMs tab, VM list dispatch |
| `DetailPageHeadings/PageHeadings` | `ProviderPageHeader` |
| `headers/SectionHeading`, `SectionHeadingWithEdit` | Details tab sections, Credentials tab |
| `ModalForm/ModalForm` | Credentials edit, URL/UI edit, transfer network, VDDK edit, certificate fetch, vSphere host network |
| `modals/DeleteModal` | Provider delete action |
| `ResourceYAMLEditorWrapper` | YAML tab |
| `common/FormGroupWithHelpText`, `FormGroupWithErrorText` | Create form fields, modals |
| `common/HelpIconPopover` | Create form fields |
| `common/Select` | `ProviderTypeField` |
| `common/ProjectSelect` | `ProviderProjectField` |
| `FilterableSelect` | Host network selection |
| `PreviewLabels/TechPreviewLabel`, `DevPreviewLabel` | `ProviderTypeField`, list `TypeCell` |
| `ProviderIconLink` | List name column |
| `DetailItems/*` (Name, Namespace, CreatedAt, Owner, DetailItem) | Per-type details sections, credentials |
| `ConsoleTimestamp` | Conditions table |
| `TableSortContextProvider` | VM lists (oVirt, EC2, etc.) |
| `TableCell/TableLabelCell`, `TableEmptyCell` | List type column, empty cells |
| `common/Filter/EnumFilter`, `GroupedEnumFilter` | VM list filters |
| `Concerns/*` | VM concerns column (popover, category filters) |
| `OvaFileUploader` | OVA upload section |
| `VddkUploader` | vSphere VDDK create field |
| `common/SmartLinkify` | List error status cell |
| `images/logos` | `getProviderTypeOptions` (create type picker, overview tiles) |

Online help: `LearningExperienceDrawer` / `LearningExperienceButton` (list, create, details header).

---

## Data Sources

### Inventory path builder

`buildProviderInventoryPath` (`@utils/inventory/buildProviderInventoryPath`):
- **Root GET** (empty `subPath`): `providers/{type}/{uid}?detail=1` — populates derived counts (`vmCount`, `networkCount`, `storageCount`, etc.)
- **Sub-path GET**: `providers/{type}/{uid}/{subPath}` — caller supplies own `detail` (e.g. `hosts?detail=4`, `networkattachmentdefinitions?detail=4`)

Do not Hyper-V-gate the root `?detail=1` query param.

### Hooks and API calls

| Hook / call | Source | Used in |
|---|---|---|
| `useK8sWatchResource<V1beta1Provider[]>` | K8s watch | List page |
| `useK8sWatchResource<V1beta1Provider>` | K8s watch | Details dispatch |
| `useProvider(name, namespace)` | `@utils/hooks/useProvider` (re-export in `details/hooks/`) | All detail tabs, header |
| `useProvidersInventoryList(namespace)` | `GET providers?detail=1` (or per-provider fallback via `buildProviderInventoryPath`) every 20s | List page |
| `useProviderInventory<T>({ provider, subPath? })` | Inventory REST via `buildProviderInventoryPath` | Details tab, header, Networks tab, hosts lists, modals |
| `useInventoryVms({ provider })` | Inventory REST | VMs tab |
| `useK8sWatchResource<Secret>` | K8s watch | Credentials tab |
| `useK8sWatchResource<Host[]>` | K8s watch | vSphere hosts tab |
| `useGetDeleteAndEditAccessReview` | RBAC | List, details tab, header, hosts |
| `useAccessReview` | Console SDK | Credentials tab (Secret patch) |
| `useK8sWatchProviderNames` | K8s list | Create form context |
| `useClusterIsAwsPlatform` | Cluster detection | `CreatePlanAction`, `ProviderTypeField`, `getProviderTypeOptions` |
| `getProviderTypeOptions` | `@utils/providers/getProviderTypeOptions` | Create type picker, overview WelcomeCard |

### List data shape

`ProviderData` (`@utils/providers/types`): `{ provider, inventory?, permissions?, vmData?, vmDataLoading? }`.

List joins Provider CR + inventory via `findInventoryByID(inventory, provider.metadata.uid)`.

Columns: `src/providers/list/utils/providerFields.ts` — Name, Project, Status, Endpoint, Type (grouped enum + source label), VMs, Networks, Hosts, Clusters, Storage, Actions.

### Provider type constants (`@utils/providers/constants.ts`)

`PROVIDER_TYPES`: `ec2`, `hyperv`, `nutanix`, `openshift`, `openstack`, `ova`, `ovirt`, `vsphere`.

- **Tech preview** (`isTechPreviewProvider`): `ec2`, `hyperv` → `TechPreviewLabel`
- **Dev preview** (`isDevPreviewProvider`): `nutanix` → `DevPreviewLabel`
- **EC2 platform gate**: `useClusterIsAwsPlatform` hides EC2 in create/overview; `CreatePlanAction` hidden for EC2 on non-AWS clusters

---

## Cross-Feature Connections

### Plans

- **Create from provider**: `CreatePlanAction` navigates to Plan create (`/~new?sourceProvider=&planProject=`); fires `PLAN_CREATE_FROM_PROVIDER_CLICKED`.
- **Shared VM inventory**: `useInventoryVms` is also used in plan create wizard, plan details VM/mapping tabs, and `InspectVirtualMachinesModal`.
- **Delete guard**: `DeleteModal` handles downstream Plan references generically.

### Overview

- **WelcomeCard**: provider tiles from `getProviderTypeOptions` (EC2 AWS-gated); navigates to create with `?providerType=`.
- **Inventory liveness**: `useProvidersInventoryIsLive` probes `GET providers` for dashboard health.

### NetworkMaps / StorageMaps

- Both reference `spec.provider.source` / `spec.provider.destination` Provider refs.
- Empty states link to Provider list/create (`ProviderModelRef`).
- **StorageMaps** reuse `useProviderInventory` for vSphere host lists (`DedicatedMigrationHostsField`) and datastore vendor detection (`useDatastoreVendor`).

### Telemetry

Create: `PROVIDER_CREATE_STARTED`, `PROVIDER_CREATE_COMPLETED`, `PROVIDER_CREATE_FAILED`.
Create plan from provider: `PLAN_CREATE_FROM_PROVIDER_CLICKED`.

---

## Blast Radius Notes

### Adding a new provider type

1. Add to `PROVIDER_TYPES` in `@utils/providers/constants.ts`; set tech/dev preview flags if needed
2. Add `<Type>ProviderDetailsPage` with tab config in `src/providers/details/`
3. Add case to `ProviderDetailsPageByType`
4. Add create fields in `src/providers/create/fields/<type>/` + case in `ProviderTypeFields.tsx`
5. Add `<Type>DetailsSection` + `<Type>InventorySection` + dispatch cases in `getDetailsSectionByType` / `getInventorySectionByType`
6. Add `<Type>VirtualMachinesList` + row + case in `VirtualMachinesListSection`
7. Add credential fields in `tabs/Credentials/components/CredentialFieldsByType.tsx`
8. Add URL/UI modal variants if applicable (`src/providers/modals/`)
9. Update `buildProviderResources`, `getDefaultFormValues`, `createProviderSecret`, `getProviderTypeOptions`
10. Update `getProvidersInventoryByNamespace` `addProviderToInventory` switch
11. Consider platform gating (`useClusterIsAwsPlatform`) and preview labels

### Adding a new details tab

1. Create tab page in `src/providers/details/tabs/<TabName>/`
2. Add to `tabPages` in relevant `<Type>ProviderDetailsPage.tsx` file(s) only

### Changing provider actions

Single file: `ProviderActionsDropdownItems.tsx`. Use `isDetailsPage` for list vs details label/navigation. New modal actions: `useOverlay` + `ModalForm`.

### Modifying list columns

1. `src/providers/list/utils/providerFields.ts` — field definitions
2. `src/providers/list/components/utils/constants.tsx` — `ProviderDataCellRenderers` map

### Changing create form validation

Per-field validation in `src/providers/create/fields/`; cross-field via `react-hook-form` `validate` + `getValues()`. Name uniqueness via `CreateProviderFormContextProvider`.

### Inventory API changes

- Root fetches must go through `buildProviderInventoryPath` (or `useProviderInventory` without `subPath`) so `?detail=1` is applied
- Sub-path callers keep their own detail level; do not strip detail params for Hyper-V
- OVA embedded VM objects use PascalCase IDs at runtime — see project-context MTV-5734

### File index (top-level)

```
src/providers/
├── dynamic-plugin.ts
├── actions/          ProviderActionsDropdown, ProviderActionsDropdownItems
├── create/           ProvidersCreatePage, CreateProviderForm, fields/, utils/
├── details/          ProviderDetailsPage, ProviderDetailsPageByType, *ProviderDetailsPage (×8)
│   ├── components/   CreatePlanAction, ProviderPageHeaderAlerts
│   └── tabs/         Details, YAML, Credentials, VirtualMachines, Hosts, Networks
├── list/             ProvidersListPage, hooks/useProvidersInventoryList, utils/
├── modals/           EditProviderURL, EditProviderUI, EditProviderDefaultTransferNetwork
├── components/       CertificateUpload, InventoryCell, VirtualMachinesCell, VDDKRadioSelection
├── hooks/            useK8sWatchProviderNames
└── utils/            constants (field IDs, annotations), validators/, helpers/
```

Shared types/constants live in `@utils/providers/` (`constants.ts`, `types.ts`, `getProviderTypeOptions.tsx`).
