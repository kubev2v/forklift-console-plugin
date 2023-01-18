import * as React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Pagination,
  PageSection,
  Title,
  ToolbarItem,
  Button,
  List,
  ListItem,
} from '@patternfly/react-core';
import {
  Table,
  TableHeader,
  TableBody,
  sortable,
  classNames as classNamesTransform,
  ICell,
  IRow,
  wrappable,
  expandable,
  cellWidth,
  truncate,
  nowrap,
  textCenter,
  fitContent,
} from '@patternfly/react-table';
import { centerCellTransform } from '@app/utils/utils';
import { useSelectionState } from '@migtools/lib-ui';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import alignment from '@patternfly/react-styles/css/utilities/Alignment/alignment';

import { MustGatherModal } from '@app/common/components/MustGatherModal';
import { useSortState, usePaginationState, useFilterState } from '@app/common/hooks';
import { VMStatusPipelineTable } from './VMStatusPipelineTable';
import { PipelineSummary, getPipelineSummaryTitle } from '@app/common/components/PipelineSummary';

import { FilterCategory, FilterToolbar, FilterType } from '@app/common/components/FilterToolbar';
import { TableEmptyState } from '@app/common/components/TableEmptyState';
import { IVMStatus } from '@app/queries/types';
import {
  findLatestMigration,
  useCancelVMsMutation,
  useMigrationsQuery,
  usePlansQuery,
  useInventoryProvidersQuery,
  findProvidersByRefs,
  useSourceVMsQuery,
} from '@app/queries';
import { formatTimestamp, hasCondition } from '@app/common/helpers';
import { ResolvedQueries } from '@app/common/components/ResolvedQuery';
import { ConfirmModal } from '@app/common/components/ConfirmModal';
import { getPlanState } from './helpers';
import { VMStatusPrecopyTable } from './VMStatusPrecopyTable';
import { VMWarmCopyStatus, getWarmVMCopyState } from './VMWarmCopyStatus';
import { LONG_LOADING_MESSAGE } from '@app/queries/constants';
import '@app/Plans/components/VMMigrationDetails.css';
import { MustGatherBtn } from '@app/common/components/MustGatherBtn';
import { VMNameWithPowerState } from '@app/common/components/VMNameWithPowerState';
import { PLANS_REFERENCE } from '@app/common/constants';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

export interface IPlanMatchParams {
  url: string;
  planName: string;
  ns?: string;
}

const getTotalCopiedRatio = (vmStatus: IVMStatus) => {
  const diskTransferSteps = vmStatus.pipeline.filter((step) => step.name === 'DiskTransfer');
  let completed = 0;
  let total = 0;
  diskTransferSteps.forEach((step) => {
    completed += step.progress.completed;
    total += step.progress.total;
  });
  return { completed, total };
};

export type VMMigrationDetailsProps = {
  match: {
    params: IPlanMatchParams;
  };
};

export const VMMigrationDetails: React.FunctionComponent<VMMigrationDetailsProps> = ({ match }) => {
  const currentNamespace = match?.params?.ns;
  const plansQuery = usePlansQuery(currentNamespace);
  const plan = plansQuery.data?.items.find((item) => item.metadata.name === match?.params.planName);
  const planStarted = !!plan?.status?.migration?.started;
  const effectiveNamespace = plan?.metadata?.namespace || currentNamespace;

  const providersQuery = useInventoryProvidersQuery();
  const { sourceProvider } = findProvidersByRefs(plan?.spec.provider || null, providersQuery);

  const vmsQuery = useSourceVMsQuery(sourceProvider);
  const getVMName = (vmStatus: IVMStatus) => {
    const nameFromInventory = vmsQuery.data?.findVMByRef(vmStatus)?.name || null;
    return nameFromInventory || vmStatus.name;
  };

  const migrationsQuery = useMigrationsQuery(effectiveNamespace);
  const latestMigration = findLatestMigration(plan || null, migrationsQuery.data?.items || null);
  const planState = getPlanState(plan || null, latestMigration, migrationsQuery.data?.items);
  const isShowingPrecopyView =
    !!plan?.spec.warm &&
    (planState === 'Starting' ||
      planState === 'Copying' ||
      planState === 'Copying-CutoverScheduled' ||
      planState === 'Copying-Canceled' ||
      planState === 'Copying-Failed');

  const vmStatuses: IVMStatus[] = planStarted
    ? plan?.status?.migration?.vms || []
    : plan?.spec.vms.map((vm) => ({
        id: vmsQuery.data?.findVMByRef(vm)?.id || '',
        name: vmsQuery.data?.findVMByRef(vm)?.name || '',
        pipeline: [],
        phase: '',
      })) || [];

  const getSortValues = (vmStatus: IVMStatus) => {
    return [
      '', // Expand/collapse control column
      getVMName(vmStatus),
      ...(!isShowingPrecopyView
        ? [
            vmStatus.started || '',
            vmStatus.completed || '',
            getTotalCopiedRatio(vmStatus).completed,
            getPipelineSummaryTitle(vmStatus),
          ]
        : [vmStatus.warm?.precopies?.length || 0, getWarmVMCopyState(vmStatus).state]),
    ];
  };

  const filterCategories: FilterCategory<IVMStatus>[] = [
    {
      key: 'id',
      title: 'Name',
      type: FilterType.search,
      placeholderText: 'Filter by name ...',
      getItemValue: getVMName,
    },
    ...(!isShowingPrecopyView
      ? [
          {
            key: 'begin',
            title: 'Start time',
            type: FilterType.search,
            placeholderText: 'Filter by start time ...',
            getItemValue: (item) => {
              return item.started || '';
            },
          },
          {
            key: 'end',
            title: 'End time',
            type: FilterType.search,
            placeholderText: 'Filter by end time ...',
            getItemValue: (item) => {
              return item.completed || '';
            },
          },
        ]
      : []),
    {
      key: 'status',
      title: 'Status',
      type: FilterType.select,
      selectOptions: !isShowingPrecopyView
        ? [
            { key: 'Completed', value: 'Completed' },
            { key: 'Not Started', value: 'Not Started' },
            { key: 'On Error', value: 'On Error' },
            { key: 'In Progress', value: 'In Progress' },
            { key: 'Canceled', value: 'Canceled' },
          ]
        : [
            { key: 'Not Started', value: 'Not Started' },
            { key: 'On Error', value: 'On Error' },
            { key: 'Idle', value: 'Idle' },
            { key: 'Copying', value: 'Copying' },
            { key: 'Canceled', value: 'Canceled' },
          ],
      getItemValue: (item) => {
        if (!isShowingPrecopyView) {
          if (!item.started) return 'Not Started';
          if (isVMCanceled(item)) return 'Canceled';
          if (item.completed) return 'Completed';
          if (item.pipeline.find((step) => step.error)) return 'On Error';
          return 'In Progress';
        } else {
          const { state } = getWarmVMCopyState(item);
          if (state === 'Starting') return 'Not Started';
          if (state === 'Copying') return 'Copying';
          if (state === 'Idle') return 'Idle';
          if (state === 'Failed' || state === 'Warning') return 'On Error';
          return 'In Progress';
        }
      },
    },
  ];

  const { filterValues, setFilterValues, filteredItems } = useFilterState(
    vmStatuses,
    filterCategories
  );

  const { sortBy, onSort, sortedItems } = useSortState(filteredItems, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  React.useEffect(() => setPageNumber(1), [sortBy, setPageNumber]);

  const { selectedItems, isItemSelected, toggleItemSelected, setSelectedItems } =
    useSelectionState<IVMStatus>({
      items: sortedItems,
      isEqual: (a, b) => a.id === b.id,
    });

  const isVMCanceled = (vm: IVMStatus) =>
    !!(latestMigration?.spec.cancel || []).find((canceledVM) => canceledVM.id === vm.id);
  const cancelableVMs = !hasCondition(plan?.status?.conditions || [], 'Executing')
    ? []
    : vmStatuses.filter((vm) => !vm.completed && !isVMCanceled(vm));
  const selectAllCancelable = (isSelected: boolean) =>
    isSelected ? setSelectedItems(cancelableVMs) : setSelectedItems([]);

  const [isCancelModalOpen, toggleCancelModal] = React.useReducer((isOpen) => !isOpen, false);

  const cancelVMsMutation = useCancelVMsMutation(plan || null, effectiveNamespace, () => {
    toggleCancelModal();
    setSelectedItems([]);
  });

  const { toggleItemSelected: toggleVMExpanded, isItemSelected: isVMExpanded } =
    useSelectionState<IVMStatus>({
      items: sortedItems,
      isEqual: (a, b) => a.id === b.id,
    });

  const columns: ICell[] = [
    {
      title: 'Name',
      transforms: [sortable, wrappable],
      cellTransforms: [truncate, centerCellTransform],
      cellFormatters: planStarted ? [expandable] : [],
    },
    ...(!isShowingPrecopyView
      ? [
          {
            title: 'Start time',
            transforms: [sortable],
            cellTransforms: [truncate, centerCellTransform],
          },
          {
            title: 'End time',
            transforms: [sortable],
            cellTransforms: [truncate, centerCellTransform],
          },
          { title: 'Data copied', transforms: [sortable], cellTransforms: [centerCellTransform] },
        ]
      : [
          {
            title: 'Incremental copies',
            transforms: [sortable],
            columnTransforms: [textCenter, fitContent],
          },
        ]),
    {
      title: 'Status',
      transforms: [sortable, cellWidth(20)],
      cellTransforms: [nowrap, centerCellTransform],
    },
    { title: '', columnTransforms: [classNamesTransform(alignment.textAlignRight)] },
  ];

  const rows: IRow[] = [];

  currentPageItems.forEach((vmStatus: IVMStatus) => {
    const isExpanded = isVMExpanded(vmStatus);
    const ratio = getTotalCopiedRatio(vmStatus);
    const isCanceled = isVMCanceled(vmStatus);
    const vm = vmsQuery.data?.findVMByRef(vmStatus);
    rows.push({
      meta: { vmStatus },
      selected: isItemSelected(vmStatus),
      disableSelection: !cancelableVMs.find((vm) => vm === vmStatus),
      isOpen: planStarted ? isExpanded : undefined,
      cells: [
        {
          title: (
            <VMNameWithPowerState
              vm={vm}
              vmStatus={vmStatus}
              sourceProvider={sourceProvider}
              key={`row${rows.length}-${vmStatus.id}`} // Ensure it always re-mounts when table rows change so tooltip state doesn't get messed up
            />
          ),
        },
        ...(!isShowingPrecopyView
          ? [
              {
                title: <time dateTime={vmStatus.started}>{formatTimestamp(vmStatus.started)}</time>,
              },
              {
                title: (
                  <time dateTime={vmStatus.completed}>{formatTimestamp(vmStatus.completed)}</time>
                ),
              },
              `${(ratio.completed / 1024).toFixed(2)} / ${(ratio.total / 1024).toFixed(2)} GB`,
              { title: <PipelineSummary status={vmStatus} isCanceled={isCanceled} /> },
            ]
          : [
              vmStatus.warm?.precopies?.length || 0,
              { title: <VMWarmCopyStatus vmStatus={vmStatus} isCanceled={isCanceled} /> },
            ]),
        {
          title: (
            <MustGatherBtn
              type="vm"
              isCompleted={!!vmStatus.completed}
              displayName={getVMName(vmStatus)}
            />
          ),
        },
      ],
    });
    if (isExpanded) {
      rows.push({
        parent: rows.length - 1,
        fullWidth: true,
        cells: [
          {
            title: !isShowingPrecopyView ? (
              <VMStatusPipelineTable status={vmStatus} isCanceled={isCanceled} />
            ) : (
              <VMStatusPrecopyTable status={vmStatus} isCanceled={isCanceled} />
            ),
          },
        ],
      });
    }
  });

  return (
    <>
      <PageSection variant="light">
        <Breadcrumb className={`${spacing.mbLg} ${spacing.prLg}`}>
          <BreadcrumbItem>
            <ResourceLink kind={PLANS_REFERENCE} hideIcon displayName="Migration plans" />
          </BreadcrumbItem>
          <BreadcrumbItem>{match?.params.planName}</BreadcrumbItem>
        </Breadcrumb>
        <Title headingLevel="h1">Migration details by VM</Title>
      </PageSection>
      <PageSection>
        <ResolvedQueries
          results={[plansQuery, providersQuery, vmsQuery]}
          errorTitles={['Cannot load plan details', 'Cannot load providers', 'Cannot load VMs']}
          errorsInline={false}
          emptyStateBody={LONG_LOADING_MESSAGE}
        >
          <FilterToolbar<IVMStatus>
            filterCategories={filterCategories}
            filterValues={filterValues}
            setFilterValues={setFilterValues}
            endToolbarItems={
              <ToolbarItem>
                <Button
                  variant="secondary"
                  isDisabled={selectedItems.length === 0 || cancelVMsMutation.isLoading}
                  onClick={toggleCancelModal}
                >
                  Cancel
                </Button>
              </ToolbarItem>
            }
            pagination={
              <Pagination
                className={spacing.mtMd}
                {...paginationProps}
                widgetId="migration-vms-table-pagination-top"
              />
            }
          />
          {filteredItems.length > 0 ? (
            <Table
              className="migration-details-table"
              aria-label="Migration VMs table"
              cells={columns}
              rows={rows}
              sortBy={sortBy}
              onSort={onSort}
              onCollapse={(event, rowKey, isOpen, rowData) => {
                toggleVMExpanded(rowData.meta.vmStatus);
              }}
              onSelect={(_event, isSelected, rowIndex, rowData) => {
                if (rowIndex === -1) {
                  selectAllCancelable(isSelected);
                } else {
                  toggleItemSelected(rowData.meta.vmStatus, isSelected);
                }
              }}
              canSelectAll={cancelableVMs.length > 0}
            >
              <TableHeader />
              <TableBody />
            </Table>
          ) : (
            <TableEmptyState
              titleText="No migration details found"
              bodyText="No results match your filter."
            />
          )}
          <Pagination
            {...paginationProps}
            widgetId="migration-vms-table-pagination-bottom"
            variant="bottom"
          />
        </ResolvedQueries>
      </PageSection>
      <MustGatherModal />
      <ConfirmModal
        isOpen={isCancelModalOpen}
        toggleOpen={toggleCancelModal}
        mutateFn={() => {
          const vmsToCancel = vmsQuery.data?.findVMsByRefs(selectedItems) || [];
          cancelVMsMutation.mutate(vmsToCancel);
        }}
        mutateResult={cancelVMsMutation}
        title="Cancel migrations?"
        confirmButtonText="Yes, cancel"
        cancelButtonText="No, keep migrating"
        body={
          <>
            Migration of the following VMs will be stopped, and any partially created resources on
            the target provider will be deleted.
            <List className={spacing.mtSm}>
              {selectedItems.map((vmStatus) => (
                <ListItem key={vmStatus.id}>
                  <strong>{getVMName(vmStatus)}</strong>
                </ListItem>
              ))}
            </List>
          </>
        }
        errorText="Cannot cancel migrations"
      />
    </>
  );
};
