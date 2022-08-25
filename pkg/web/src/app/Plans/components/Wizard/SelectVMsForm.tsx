import * as React from 'react';
import {
  Pagination,
  TextContent,
  Text,
  Level,
  LevelItem,
  Button,
  Dropdown,
  DropdownToggle,
  DropdownToggleCheckbox,
  DropdownItem,
  ToolbarItem,
} from '@patternfly/react-core';

import {
  Table,
  TableHeader,
  TableBody,
  TableVariant,
  sortable,
  ICell,
  IRow,
  wrappable,
  truncate,
} from '@patternfly/react-table';

import AngleDownIcon from '@patternfly/react-icons/dist/esm/icons/angle-down-icon';
import AngleRightIcon from '@patternfly/react-icons/dist/esm/icons/angle-right-icon';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import '@app/Plans/components/Wizard/SelectVMsForm.css';

import {
  SourceVM,
  IInventoryHostTree,
  IVMwareFolderTree,
  SourceInventoryProvider,
  InventoryTree,
  InventoryTreeType,
} from '@app/queries/types';
import { useSelectionState } from '@migtools/lib-ui';

import { useSortState, usePaginationState, useFilterState } from '@app/common/hooks';
import { PlanWizardFormState } from './PlanWizard';
import {
  getAvailableVMs,
  getMostSevereVMConcern,
  getVMConcernStatusLabel,
  getVMTreePathInfo,
  vmMatchesConcernFilter,
} from './helpers';
import { IndexedTree, useSourceVMsQuery } from '@app/queries';
import { TableEmptyState } from '@app/common/components/TableEmptyState';
import { FilterToolbar, FilterType, FilterCategory } from '@app/common/components/FilterToolbar';
import { ResolvedQueries } from '@app/common/components/ResolvedQuery';
import { VMConcernsIcon } from './VMConcernsIcon';
import { VMConcernsDescription } from './VMConcernsDescription';
import { LONG_LOADING_MESSAGE } from '@app/queries/constants';
import { PROVIDER_TYPE_NAMES } from '@app/common/constants';
import { UseQueryResult } from 'react-query';
import { getVMPowerState, VMNameWithPowerState } from '@app/common/components/VMNameWithPowerState';

interface ISelectVMsFormProps {
  form: PlanWizardFormState['selectVMs'];
  treeType: InventoryTreeType;
  selectedTreeNodes: InventoryTree[];
  sourceProvider: SourceInventoryProvider | null;
  selectedVMs: SourceVM[];
  hostTreeQuery: UseQueryResult<IndexedTree<IInventoryHostTree>, unknown>;
  vmTreeQuery: UseQueryResult<IndexedTree<IVMwareFolderTree>, unknown>;
}

export const SelectVMsForm: React.FunctionComponent<ISelectVMsFormProps> = ({
  form,
  treeType,
  selectedTreeNodes,
  sourceProvider,
  selectedVMs,
  hostTreeQuery,
  vmTreeQuery,
}: ISelectVMsFormProps) => {
  const vmsQuery = useSourceVMsQuery(sourceProvider);

  const indexedTree: IndexedTree | undefined =
    treeType === InventoryTreeType.Cluster ? hostTreeQuery.data : vmTreeQuery.data;

  // Even if some of the already-selected VMs don't match the filter, include them in the list.
  const selectedVMsOnMount = React.useRef(selectedVMs);
  const availableVMs = React.useMemo(
    () =>
      getAvailableVMs(
        indexedTree,
        selectedTreeNodes,
        vmsQuery.data,
        treeType,
        selectedVMsOnMount.current
      ),
    [indexedTree, selectedTreeNodes, vmsQuery.data, treeType]
  );

  const getVMInfo = (vm: SourceVM) =>
    getVMTreePathInfo(vm.selfLink, hostTreeQuery.data, vmTreeQuery.data);

  const filterCategories: FilterCategory<SourceVM>[] = [
    {
      key: 'name',
      title: 'VM name',
      type: FilterType.search,
      placeholderText: 'Filter by VM ...',
    },
    {
      key: 'powerState',
      title: 'VM power state',
      type: FilterType.select,
      selectOptions: [
        { key: 'on', value: 'Powered on' },
        { key: 'off', value: 'Powered off' },
        { key: 'unknown', value: 'Unknown' },
      ],
      getItemValue: (item) => getVMPowerState(sourceProvider?.type, item),
    },
    {
      key: 'migrationAnalysis',
      title: 'Migration assessment',
      type: FilterType.select,
      selectOptions: [
        { key: 'Ok', value: 'Ok' },
        { key: 'Advisory', value: 'Advisory' },
        { key: 'Warning', value: 'Warning' },
        { key: 'Critical', value: 'Critical' },
      ],
      getItemValue: (item) => {
        const worstConcern = getMostSevereVMConcern(item);
        return getVMConcernStatusLabel(worstConcern);
      },
    },
    {
      key: 'analysisCondition',
      title: 'Assessment condition',
      type: FilterType.search,
      placeholderText: 'Filter by assessment condition...',
      getItemValue: (item) => {
        // Mash all the concerns together to match against them as a continuous string
        const concernStrings = item.concerns.map(
          (concern) => `${concern.category} - ${concern.label}: ${concern.assessment}`
        );
        return concernStrings.join(' ; ');
      },
    },
    {
      key: 'dataCenter',
      title: 'Datacenter',
      type: FilterType.search,
      placeholderText: 'Filter by datacenter ...',
      getItemValue: (item) => {
        const { datacenter } = getVMInfo(item);
        return datacenter ? datacenter.name : '';
      },
    },
    {
      key: 'cluster',
      title: 'Cluster',
      type: FilterType.search,
      placeholderText: 'Filter by cluster ...',
      getItemValue: (item) => {
        const { cluster } = getVMInfo(item);
        return cluster ? cluster.name : '';
      },
    },
    {
      key: 'host',
      title: 'Host',
      type: FilterType.search,
      placeholderText: 'Filter by hostname...',
      getItemValue: (item) => {
        const { host } = getVMInfo(item);
        return host ? host.name : '';
      },
    },
    ...(sourceProvider?.type === 'vsphere'
      ? [
          {
            key: 'folderPath',
            title: 'Folder path',
            type: FilterType.search,
            placeholderText: 'Filter by folder path ...',
            getItemValue: (item: SourceVM) => {
              const { folderPathStr } = getVMInfo(item);
              return folderPathStr ? folderPathStr : '';
            },
          },
        ]
      : []),
  ];

  const { filterValues, setFilterValues, filteredItems } = useFilterState(
    availableVMs || [],
    filterCategories
  );

  const getSortValues = (vm: SourceVM) => {
    const { datacenter, cluster, host, folderPathStr } = getVMInfo(vm);
    return [
      '', // Expand control column
      '', // Checkbox column
      getVMConcernStatusLabel(getMostSevereVMConcern(vm)),
      vm.name,
      datacenter?.name || '',
      cluster?.name || '',
      host?.name || '',
      ...(sourceProvider?.type === 'vsphere' ? [folderPathStr || ''] : []),
      '', // Action column
    ];
  };

  const { sortBy, onSort, sortedItems } = useSortState(filteredItems, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  React.useEffect(() => setPageNumber(1), [sortBy, setPageNumber]);

  // manages the selection state
  const {
    isItemSelected,
    toggleItemSelected,
    selectAll,
    selectMultiple,
    areAllSelected,
    selectedItems,
  } = useSelectionState<string>({
    items: sortedItems.map((vm) => vm.id),
    externalState: [form.fields.selectedVMIds.value, form.fields.selectedVMIds.setValue],
  });

  // manages the expanded state
  const {
    toggleItemSelected: toggleVMExpanded,
    isItemSelected: isVMExpanded,
    selectAll: expandAll,
    areAllSelected: areAllExpanded,
  } = useSelectionState<SourceVM>({
    items: sortedItems,
    isEqual: (a, b) => a.selfLink === b.selfLink,
  });

  React.useEffect(() => {
    if (filterValues.analysisCondition) {
      const filterText = filterValues.analysisCondition[0];
      const firstMatchingVM = sortedItems.find((vm) => vmMatchesConcernFilter(vm, filterText));
      if (firstMatchingVM && !isVMExpanded(firstMatchingVM)) {
        toggleVMExpanded(firstMatchingVM);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValues.analysisCondition]);

  const columns: ICell[] = [
    {
      title: 'Migration assessment',
      transforms: [sortable],
      cellTransforms: [truncate],
    },
    { title: 'VM name', transforms: [sortable], cellTransforms: [truncate] },
    { title: 'Datacenter', transforms: [sortable], cellTransforms: [truncate] },
    { title: 'Cluster', transforms: [sortable], cellTransforms: [truncate] },
    { title: 'Host', transforms: [sortable, wrappable], cellTransforms: [truncate] },
    ...(sourceProvider?.type === 'vsphere'
      ? [{ title: 'Folder path', transforms: [sortable, wrappable], cellTransforms: [truncate] }]
      : []),
  ];

  const rows: IRow[] = [];

  currentPageItems.forEach((vm: SourceVM) => {
    const isExpanded = isVMExpanded(vm);
    const { datacenter, cluster, host, folderPathStr } = getVMInfo(vm);

    rows.push({
      meta: { vm },
      selected: isItemSelected(vm.id),
      isOpen: isExpanded,
      cells: [
        {
          title: <VMConcernsIcon vm={vm} />,
        },
        {
          title: (
            <VMNameWithPowerState
              vm={vm}
              sourceProvider={sourceProvider}
              key={`row${rows.length}-${vm.name}`} // Ensure it always re-mounts when table rows change so tooltip state doesn't get messed up
            />
          ),
        },
        datacenter?.name || '',
        cluster?.name || '',
        host?.name || 'N/A',
        ...(sourceProvider?.type === 'vsphere' ? [folderPathStr || ''] : []),
      ],
    });

    if (isExpanded) {
      rows.push({
        parent: rows.length - 1,
        fullWidth: true,
        cells: [
          {
            title: (
              <VMConcernsDescription
                vm={vm}
                filterText={
                  (filterValues.analysisCondition && filterValues.analysisCondition[0]) || ''
                }
              />
            ),
            props: { colSpan: columns.length + 2 },
          },
        ],
      });
    }
  });

  const toggleCollapseAll = (collapse: boolean) => {
    expandAll(!collapse);
  };

  const handleSelectAll = (checked: boolean) => {
    selectAll(!!checked);
  };

  const [bulkSelectOpen, setBulkSelectOpen] = React.useState(false);

  const dropdownItems = [
    <DropdownItem
      onClick={() => {
        handleSelectAll(false);
      }}
      data-action="none"
      key="select-none"
      component="button"
    >
      Select none (0)
    </DropdownItem>,
    <DropdownItem
      onClick={() => {
        selectMultiple(
          currentPageItems.map((vm) => vm.id),
          true
        );
      }}
      data-action="page"
      key="select-page"
      component="button"
    >
      Select page ({currentPageItems.length})
    </DropdownItem>,
    <DropdownItem
      onClick={() => {
        handleSelectAll(true);
      }}
      data-action="all"
      key="select-all"
      component="button"
    >
      Select all ({paginationProps.itemCount})
    </DropdownItem>,
  ];

  const getBulkSelectState = () => {
    let state: boolean | null;
    if (areAllSelected) {
      state = true;
    } else if (selectedItems.length === 0) {
      state = false;
    } else {
      state = null;
    }
    return state;
  };

  const collapseAllBtn = () => (
    <Button
      variant="control"
      title={`${!areAllExpanded ? 'Expand' : 'Collapse'} all`}
      onClick={() => {
        toggleCollapseAll(areAllExpanded);
      }}
    >
      {areAllExpanded ? <AngleDownIcon /> : <AngleRightIcon />}
    </Button>
  );

  return (
    <ResolvedQueries
      results={[
        hostTreeQuery,
        ...(sourceProvider?.type === 'vsphere' ? [vmTreeQuery] : []),
        vmsQuery,
      ]}
      errorTitles={[
        'Cannot load inventory host tree data',
        ...(sourceProvider?.type === 'vsphere' ? ['Cannot load inventory VM tree data'] : []),
        'Cannot load VMs',
      ]}
      emptyStateBody={LONG_LOADING_MESSAGE}
      forceLoadingState={!availableVMs}
    >
      {(availableVMs || []).length === 0 ? (
        <TableEmptyState
          titleText="No VMs found"
          bodyText="No results match your filter. Go back and make a different selection."
        />
      ) : (
        <>
          <TextContent className={spacing.mbMd}>
            <Text component="p">
              Select VMs for migration. The Migration assessment column highlights conditions
              related to migrating a particular VM, as determined by Red Hat&apos;s migration
              analytics service.
            </Text>
          </TextContent>

          <FilterToolbar<SourceVM>
            filterCategories={filterCategories}
            filterValues={filterValues}
            setFilterValues={setFilterValues}
            endToolbarItems={
              <ToolbarItem>{`${form.values.selectedVMIds.length} selected`}</ToolbarItem>
            }
            beginToolbarItems={
              <>
                <ToolbarItem>{collapseAllBtn()}</ToolbarItem>

                <ToolbarItem>
                  <Dropdown
                    toggle={
                      <DropdownToggle
                        splitButtonItems={[
                          <DropdownToggleCheckbox
                            id="bulk-selected-vms-checkbox"
                            key="bulk-select-checkbox"
                            aria-label="Select all"
                            onChange={() => {
                              if (getBulkSelectState() !== false) {
                                selectAll(false);
                              } else {
                                selectAll(true);
                              }
                            }}
                            isChecked={getBulkSelectState()}
                          />,
                        ]}
                        onToggle={(isOpen) => {
                          setBulkSelectOpen(isOpen);
                        }}
                      />
                    }
                    isOpen={bulkSelectOpen}
                    dropdownItems={dropdownItems}
                  />
                </ToolbarItem>
              </>
            }
            pagination={
              <Pagination isCompact {...paginationProps} widgetId="vms-table-pagination-top" />
            }
          />
          {filteredItems.length > 0 ? (
            <Table
              aria-label={`${PROVIDER_TYPE_NAMES[sourceProvider?.type || 'vsphere']} VMs table`}
              canSelectAll={false}
              variant={TableVariant.compact}
              cells={columns}
              rows={rows}
              sortBy={sortBy}
              onSort={onSort}
              onSelect={(_event, isSelected, rowIndex, rowData) => {
                toggleItemSelected(rowData.meta.vm.id, isSelected);
              }}
              onCollapse={(_event, _rowKey, _isOpen, rowData) => {
                toggleVMExpanded(rowData.meta.vm);
              }}
            >
              <TableHeader />
              <TableBody />
            </Table>
          ) : (
            <TableEmptyState titleText="No VMs found" bodyText="No results match your filter." />
          )}

          <Level>
            <LevelItem>
              <TextContent>
                <Text
                  component="small"
                  className={spacing.mlLg}
                >{`${form.values.selectedVMIds.length} selected`}</Text>
              </TextContent>
            </LevelItem>
            <LevelItem>
              <Pagination
                {...paginationProps}
                widgetId="vms-table-pagination-bottom"
                variant="bottom"
              />
            </LevelItem>
          </Level>
        </>
      )}
    </ResolvedQueries>
  );
};
