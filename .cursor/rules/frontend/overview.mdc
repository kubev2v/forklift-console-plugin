---
description: Overview/dashboard feature architecture -- tabbed layout, dashboard cards, health, history, settings
alwaysApply: false
---

# Overview Feature Architecture (`src/overview/`)

> Analyzed on 2026-09-17

Route: `/mtv/overview` (`OVERVIEW_BASE_PATH` in `src/utils/paths/overview.ts`). Plugin registration: `src/overview/dynamic-plugin.ts` — `console.page/route` + nav items for `admin` and `virtualization-perspective` (requires `CAN_LIST_NS`). Exposes `OverviewContext` as a `console.context-provider`.

---

## Page Composition

### Main Page (`OverviewPage.tsx`)

```
LearningExperienceDrawer
└── forklift-details-page-layout
    ├── PageSection: H1 "Migration Toolkit for Virtualization" + LearningExperienceButton
    ├── PageSection (conditional): InventoryNotReachable alert
    ├── PageSection (conditional): LightspeedMcpWarning
    ├── RoutedTabs (5 tabs, telemetry on click via useForkliftAnalytics)
    └── Routes → active tab component
```

### Tabs (`OverviewTabHref` enum + `constants.ts` `OverviewTabName`)

| Tab | Component | Path |
|-----|-----------|------|
| Overview | `ForkliftControllerOverviewTab` | index (`/mtv/overview`) |
| YAML | `ForkliftControllerYAMLTab` | `yaml` |
| Health | `ForkliftControllerHealthTab` | `health` |
| History | `ForkliftControllerHistoryTab` | `history` |
| Settings | `ForkliftControllerSettingsTab` | `settings` |

Build tab URLs with `getOverviewPath(tab?)` from `@utils/helpers/getOverviewPath`.

### Overview Tab — Dashboard Cards (`ForkliftControllerOverviewTab.tsx`)

```
ForkliftControllerOverviewTab (vertical Flex, PatternFly charts CSS)
├── WelcomeCard (full width)
├── Row: VmMigrationsDonutCard (325px) | VmMigrationsHistoryCard (flex-1)
├── Row: MigrationPlansDonutCard (325px) | MigrationAlertsCard (flex-1) | ControllerCard limit=6 (flex-1)
└── Row: ThroughputCard (network) | ThroughputCard (storage) — stacks on small screens
```

| Card | Data / behavior |
|------|-----------------|
| `WelcomeCard` | Expandable intro; provider tiles → provider create (`~new?providerType=`). Tiles from `getProviderTypeOptions` (same order as create-provider). EC2 gated via `useClusterIsAwsPlatform`. Collapse state in `OverviewContext`. |
| `VmMigrationsDonutCard` | VM counts by status (Running/Failed/Succeeded/Canceled) for selected time range. Slice click → History tab via `navigateToHistoryTab()`. Range persisted in context. |
| `VmMigrationsHistoryCard` | Stacked area chart of VM migrations over time. Uses `useVmMigrationsDataPoints` + `useMigrationCounts` for header totals. |
| `MigrationPlansDonutCard` | Plan counts by UI `PlanStatuses` (9 statuses). Slice click → plans list filtered by phase. |
| `MigrationAlertsCard` | Plan-level monitoring alerts (`useMigrationAlerts`). Summary counts + list; "View alerts" → monitoring alerts page. |
| `ControllerCard` | Forklift pods (`app=forklift`), limited to 6 on overview. "View all" → Health tab. |
| `ThroughputCard` (×2) | Prometheus `mtv_migration_net_throughput` / `mtv_migration_storage_throughput`. Plan filter + time range via `useThroughputQuery`. |

### Health Tab

```
ForkliftControllerHealthTab
├── ControllerCard (full pod list, no limit)
│   └── PodsTable (pagination when >10)
└── ConditionsCard
    └── ConditionsSection
```

### History Tab

```
ForkliftControllerHistoryTab → HistoryCard → MigrationsListPage (StandardPage)
    └── MigrationRow
```

Filterable table of all Migration CRs. Columns: Migration name, Status, Plan, Started at, Completed at. Filters: freetext (name, plan), enum (status), date range, "Group by plan" toggle (`SwitchFilter`). Deep-linking from overview charts via `navigateToHistoryTab()` query params (`range`, `recent`, `vms`, `name`). Empty state links to plan create.

### Settings Tab

```
ForkliftControllerSettingsTab
└── SettingsCard (requires controller loaded)
    ├── SectionHeadingWithEdit → SettingsEdit modal (useOverlay)
    └── SettingsDetailsList (DescriptionList of DetailsItem rows)
        └── SettingsEdit (ModalForm + react-hook-form)
            └── 12 field editors → k8sPatch on ForkliftControllerModel
```

### YAML Tab

`ResourceYAMLEditorWrapper` + `ResourceYAMLEditor` for the ForkliftController CR. Feature flags (`feature_copy_offload`, `feature_ocp_live_migration`, `feature_volume_populator`) are visible here but **not** in Settings UI.

---

## ForkliftController Settings

Central watch: `useK8sWatchForkliftController` — list watch, returns first controller via `useMemo`.

**12 configurable fields** (`SettingsFields` enum in `tabs/Settings/utils/types.ts`):

| Setting | Spec field | Default |
|---------|-----------|---------|
| Max concurrent VM migrations | `controller_max_vm_inflight` | 20 |
| Controller CPU limit | `controller_container_limits_cpu` | 500m |
| Controller memory limit | `controller_container_limits_memory` | 800Mi |
| Inventory memory limit | `inventory_container_limits_memory` | 1000Mi |
| Precopy interval | `controller_precopy_interval` | 60 min |
| Snapshot polling interval | `controller_snapshot_status_check_rate_seconds` | 10s |
| Conversion appliance memory (MB) | `virt_v2v_memsize` | 0 (virt-v2v chooses) |
| Conversion appliance vCPUs | `virt_v2v_smp` | 0 (virt-v2v chooses) |
| Controller transfer network | `controller_transfer_network` | None |
| AAP URL | `aap_url` | Not configured |
| AAP token secret | `aap_token_secret_name` | Not configured |
| AAP timeout | `aap_timeout` | 0 |

**Edit flow:** `SettingsEdit` uses `getDefaultValues` / `defaultValuesMap`, `buildSettingsPatches` (JSON Patch ADD/REPLACE/REMOVE; zero-value fields for AAP timeout and virt-v2v settings use REMOVE). Per-field editors under `tabs/Settings/components/<Field>/`. Select fields use `SettingsSelectInput`; numeric fields use `SettingsNumberInput`. `EditControllerTransferNetwork` watches NADs; `EditAapTokenSecret` watches Secrets.

---

## Migration Counts & Hooks

### Data flow

```
useK8sWatchResource(Migration[]) ─┬─ useMigrationCounts(range)
                                   │     ├─ getPlanMigrationCounts()  → migration-level condition counts
                                   │     └─ getVmCounts(migrations, range) → per-VM counts in time window
                                   │
                                   ├─ useVmMigrationsDataPoints(range, singleBucket?)
                                   │     ├─ migrationTimeBuckets (createTimeBuckets, createBuckets)
                                   │     └─ migrationVmStatusChecks (isFailed/isSucceeded/isRunning/isCanceled)
                                   │
                                   └─ MigrationsListPage (History tab, direct watch)

useK8sWatchResource(Plan[]) ─────── usePlanStatusCounts()
                                        └─ getPlanStatusCounts() → getPlanStatus() from plans feature
```

### Hook reference

| Hook | Returns | Used by |
|------|---------|---------|
| `useMigrationCounts` | `{ count, vmCount, loaded, loadError }` — normalizes Failed→Failure, Succeeded→Successful | `VmMigrationsHistoryChart` header totals |
| `usePlanStatusCounts` | `{ count: Record<PlanStatuses, number> & { Total }, loaded, loadError }` | `MigrationPlansDonutCard` |
| `useVmMigrationsDataPoints` | Bucketed chart series + totals per status | `VmMigrationsDonutCard`, `VmMigrationsHistoryCard` |
| `useThroughputQuery` | Parsed Prometheus series per plan | `ThroughputCard` |
| `useMigrationAlerts` (`@utils/hooks/useMigrationAlerts`) | Plan alert list from monitoring | `MigrationAlertsCard` |

### Pure utils (unit-tested)

- `getPlanMigrationCounts` — counts Migration CR conditions (Running/Failed/Succeeded/Canceled)
- `getVmCounts` — per-VM status counts filtered by `TimeRangeOptions`
- `getPlanStatusCounts` — delegates to plans `getPlanStatus` / `PlanStatuses`
- `getPlanKey`, `getMigrationStarted` — shared by time bucketing and history matchers
- `navigateToHistoryTab` — builds History tab URL with encoded filter query params

### Time ranges

`TimeRangeOptions` + `TimeRangeOptionsDictionary` in `tabs/Overview/utils/timeRangeOptions.ts`. Donut defaults to `All`; history chart defaults to `Last10Days`. Ranges persisted via `OverviewUserSettings` / `saveOverviewSelectedRanges`.

---

## Derived State Patterns

**Rule: derive watch data with `useMemo` or synchronous render computation — never mirror K8s resources into `useState` via `useEffect`.**

### Preferred patterns in this feature

```typescript
// Hook wraps watch + useMemo (useMigrationCounts, usePlanStatusCounts, useK8sWatchForkliftController)
const counts = useMemo(() => {
  if (!loaded || loadError) return EMPTY_COUNTS;
  return normalizeCounts(getVmCounts(migrations, range));
}, [migrations, loaded, loadError, range]);

// Synchronous render derivation after early return (useVmMigrationsDataPoints)
if (!loaded) return EMPTY_RESULT;
const buckets = createBuckets(createTimeBuckets(selectedRange), migrations);
// ... build chart arrays in render loop, return directly

// Component-level derived values (MigrationAlertsCard, ThroughputLineChart)
const failedCount = useMemo(
  () => alerts.filter((a) => a.alertName === MIGRATION_ALERT_NAME.FAILED).length,
  [alerts],
);
```

### Legitimate `useState` (not derived from watches)

- **UI preferences:** `OverviewContext` — welcome card collapsed, chart time ranges (synced to localStorage via `useOverviewContext`)
- **Ephemeral UI:** chart hover index (`hoveredIndex`), throughput plan filter selection
- **Async side effects:** `useProvidersInventoryIsLive` polls inventory REST API (not a K8s watch mirror)
- **Form state:** `SettingsEdit` react-hook-form; its lone `useEffect` only calls `trigger(SettingsFields.AapUrl)` for pre-existing invalid values

### Anti-pattern

```typescript
// ❌ Do not copy watch data into local state
useEffect(() => {
  if (loaded) setCounts(computeCounts(migrations));
}, [migrations, loaded]);
```

---

## Shared Component Usage

| Component | Used in |
|-----------|---------|
| `RoutedTabs` | Main page tab navigation |
| `LightspeedMcpWarning` | Page banner |
| `LoadingSuspend` | VM donut/history cards, ControllerCard, MigrationsListPage |
| `ModalForm` + patch constants | SettingsEdit |
| `FormGroupWithHelpText`, `HelpIconPopover` | All settings editors |
| `DetailsItem`, `SectionHeadingWithEdit` | Settings card |
| `ResourceYAMLEditorWrapper` | YAML tab |
| `StandardPage` + filter types | History tab table |
| `ConsoleTimestamp`, `TableLinkCell`, `VisibleTableData` | History rows |
| `ConditionsSection` | Health conditions |
| `StatusIcon` / `STATUS_ICONS` | Pod status, MigrationAlertsCard |
| `SwitchFilter` | History "group by plan" filter |
| `TabTitle` | ControllerCard, PlanHooksPage (exported) |

---

## Data Sources

### K8s watches

| Resource | Where |
|----------|-------|
| `ForkliftController` | `useK8sWatchForkliftController` (all tabs except History) |
| `Plan` | `usePlanStatusCounts`, History plan links |
| `Migration` | `useVmMigrationsDataPoints`, `useMigrationCounts`, History table |
| `Pod` | `ControllerCard` (selector: `app=forklift`) |
| `NetworkAttachmentDefinition` | `EditControllerTransferNetwork` |
| `Secret` | `EditAapTokenSecret` |

### Other hooks

| Hook | Source |
|------|--------|
| `useProvidersInventoryIsLive` | REST poll to inventory API (20s default) |
| `useThroughputQuery` | `usePrometheusPoll` (QUERY_RANGE, 30s delay) |
| `useOverviewContext` | Console context provider — local state + localStorage |

### Context

`OverviewContext` (`dynamic-plugin.ts` registers provider + `useOverviewContext` hook). Fields: `hideWelcomeCardByContext`, `vmMigrationsDonutSelectedRange`, `vmMigrationsHistorySelectedRange`.

---

## Cross-Feature Connections

### Overview imports from other features

| Feature | Import | Purpose |
|---------|--------|---------|
| **providers** | `InventoryNotReachable`, `getInventoryApiUrl`, `getProviderTypeOptions` | Alert, liveness, welcome card |
| **plans** | `PlanStatuses`, `getPlanStatus`, `getMigrationVMsStatusCounts`, `VMStatusIconsRow` | Charts, history status |

### Overview exports used by other features

| Export | Consumer | Purpose |
|--------|----------|---------|
| `useK8sWatchForkliftController` | `plans/.../useAapConfig.ts` | Read AAP config during plan creation |
| `SettingsFields`, `EnhancedForkliftController` | `plans/.../useAapConfig.ts` | Field enum for AAP detection |
| `TabTitle` | `plans/.../PlanHooksPage.tsx` | Consistent tab title + help icon |
| `OVERVIEW_BASE_PATH`, `OverviewTabHref` | `@utils/helpers/getOverviewPath` | Build overview URLs from anywhere |

### Navigation cross-links

| From | To |
|------|-----|
| WelcomeCard provider tiles | Provider create |
| MigrationPlansDonutCard slices | Plans list filtered by phase |
| VM donut/history chart | History tab with query filters |
| MigrationAlertsCard | Monitoring alerts page |
| History empty state | Plan create |
| ControllerCard (overview) | Health tab |

---

## Blast Radius Notes

### Shared components that break overview

- `RoutedTabs` → entire tab navigation
- `LoadingSuspend` → 4+ cards loading states
- `StandardPage` + filter types → entire History tab
- `ModalForm` + `FormGroupWithHelpText` → Settings edit flow
- `ConditionsSection` → Health conditions
- `ResourceYAMLEditorWrapper` → YAML tab

### Plans utilities that break overview

- `getPlanStatus` / `PlanStatuses` → migration plans donut counts
- `getMigrationVMsStatusCounts` → history status column
- `VMStatusIconsRow` → history status icons

### Overview exports — changes affect consumers

- `useK8sWatchForkliftController` → plans AAP config hook
- `SettingsFields` → field renames break AAP config detection
- `OVERVIEW_BASE_PATH` / `OverviewTabHref` → URL structure changes break nav links

### External infrastructure dependencies

- Monitoring/Prometheus unavailable → throughput cards error/empty state
- Inventory REST API down → `InventoryNotReachable` banner
- ForkliftController CR missing → Settings, YAML, Health conditions fail to load
