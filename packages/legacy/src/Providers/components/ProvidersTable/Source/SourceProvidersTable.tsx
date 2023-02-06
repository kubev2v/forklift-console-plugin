import * as React from 'react';
import { Pagination, Level, LevelItem } from '@patternfly/react-core';
import {
  Table,
  TableHeader,
  TableBody,
  sortable,
  classNames as classNamesTransform,
  ICell,
  IRow,
  truncate,
} from '@patternfly/react-table';
import tableStyles from '@patternfly/react-styles/css/components/Table/table';

import { useSortState, usePaginationState } from 'legacy/src/common/hooks';
import {
  ICorrelatedProvider,
  IRHVProvider,
  IVMwareProvider,
  SourceInventoryProvider,
} from 'legacy/src/queries/types';
import { ProviderActionsDropdown } from '../ProviderActionsDropdown';
import { StatusCondition } from 'legacy/src/common/components/StatusCondition';
import {
  getMostSeriousCondition,
  getStorageTitle,
  hasCondition,
  numStr,
} from 'legacy/src/common/helpers';

import { PATH_PREFIX, ProviderType, PROVIDER_TYPE_NAMES } from 'legacy/src/common/constants';
import { Link } from 'react-router-dom';
import OutlinedHddIcon from '@patternfly/react-icons/dist/esm/icons/outlined-hdd-icon';

interface ISourceProvidersTableProps {
  providers: ICorrelatedProvider<SourceInventoryProvider>[];
  providerType: ProviderType;
}

/**
 * @deprecated
 */
export const SourceProvidersTable: React.FunctionComponent<ISourceProvidersTableProps> = ({
  providers,
  providerType,
}: ISourceProvidersTableProps) => {
  const getStorageCount = (provider: ICorrelatedProvider<SourceInventoryProvider>) => {
    if (!provider.inventory) return 0;
    if (providerType === 'vsphere') {
      return (provider.inventory as IVMwareProvider).datastoreCount;
    }
    if (providerType === 'ovirt') {
      return (provider.inventory as IRHVProvider).storageDomainCount;
    }
    return 0;
  };

  const getSortValues = (provider: ICorrelatedProvider<SourceInventoryProvider>) => {
    const { clusterCount, hostCount, vmCount, networkCount } = provider.inventory || {};
    return [
      // TODO restore this when https://github.com/konveyor/forklift-ui/issues/281 is settled
      // '',
      provider.metadata.name,
      provider.spec.url || '',
      numStr(clusterCount),
      numStr(hostCount),
      numStr(vmCount),
      numStr(networkCount),
      numStr(getStorageCount(provider)),
      provider.status ? getMostSeriousCondition(provider.status?.conditions) : '',
      '',
    ];
  };

  const { sortBy, onSort, sortedItems } = useSortState(providers, getSortValues);
  // TODO currentPageItems has type any, we should add generics to usePaginationState
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  React.useEffect(() => setPageNumber(1), [sortBy, setPageNumber]);

  /* TODO restore this when https://github.com/konveyor/forklift-ui/issues/281 is settled
  const {
    selectedItems,
    toggleItemSelected,
    areAllSelected,
    selectAll,
    isItemSelected,
  } = useSelectionState<ICorrelatedProvider<SourceInventoryProvider>>({ items: sortedItems });

  const inventoryDownloadURL = `/inventory-payload-api/api/v1/extract?providers=${selectedItems
    .map((provider) => `${provider.namespace}/${provider.name}`)
    .join()}`;
  */

  const columns: ICell[] = [
    /* TODO restore this when https://github.com/konveyor/forklift-ui/issues/281 is settled
    {
      // Using a custom column instead of Table's onSelect prop due to issues
      // TODO replace it with the onSelect prop of table like in https://github.com/konveyor/forklift-ui/pull/317
      title: (
        <input
          type="checkbox"
          aria-label="Select all providers"
          onChange={(event: React.FormEvent<HTMLInputElement>) => {
            selectAll(event.currentTarget.checked);
          }}
          checked={areAllSelected}
        />
      ),
      columnTransforms: [classNamesTransform(tableStyles.tableCheck)],
    },
    */

    { title: 'Name', transforms: [sortable], cellTransforms: [truncate] },
    { title: 'Endpoint', transforms: [sortable], cellTransforms: [truncate] },
    { title: 'Clusters', transforms: [sortable], cellTransforms: [truncate] },
    { title: 'Hosts', transforms: [sortable], cellTransforms: [truncate] },
    { title: 'VMs', transforms: [sortable], cellTransforms: [truncate] },
    { title: 'Networks', transforms: [sortable], cellTransforms: [truncate] },
    {
      title: getStorageTitle(providerType, true),
      transforms: [sortable],
      cellTransforms: [truncate],
    },
    { title: 'Status', transforms: [sortable], cellTransforms: [truncate] },
    { title: '', columnTransforms: [classNamesTransform(tableStyles.tableAction)] },
  ];

  const rows: IRow[] = [];
  currentPageItems.forEach((provider: ICorrelatedProvider<SourceInventoryProvider>) => {
    const { clusterCount, hostCount, vmCount, networkCount } = provider.inventory || {};
    // TODO restore this when https://github.com/konveyor/forklift-ui/issues/281 is settled
    // const isSelected = isItemSelected(provider);

    rows.push({
      meta: { provider },
      cells: [
        /* TODO restore this when https://github.com/konveyor/forklift-ui/issues/281 is settled
        {
          title: (
            <input
              type="checkbox"
              aria-label={`Select provider ${provider.name}`}
              onChange={(event: React.FormEvent<HTMLInputElement>) => {
                toggleItemSelected(provider, event.currentTarget.checked);
              }}
              checked={isSelected}
            />
          ),
        },
        */
        provider.metadata.name,
        provider.spec.url,
        numStr(clusterCount),
        (() => {
          if (hostCount === undefined) return '';
          if (providerType === 'vsphere') {
            const hostCountWithIcon = (
              <>
                <OutlinedHddIcon key="hosts-icon" /> {hostCount}
              </>
            );
            return {
              title: hasCondition(provider.status?.conditions || [], 'Ready') ? (
                <Link to={`${PATH_PREFIX}/providers/vsphere/${provider.metadata.name}`}>
                  {hostCountWithIcon}
                </Link>
              ) : (
                hostCountWithIcon
              ),
            };
          }
          if (providerType === 'ovirt') {
            return hostCount;
          }
          return null;
        })(),
        numStr(vmCount),
        numStr(networkCount),
        numStr(getStorageCount(provider)),
        {
          title: <StatusCondition status={provider.status} />,
        },
        {
          title: <ProviderActionsDropdown provider={provider} providerType={providerType} />,
        },
      ],
    });
  });

  return (
    <>
      <Level>
        <LevelItem>
          {/* TODO restore this when https://github.com/konveyor/forklift-ui/issues/281 is settled
          <Button
            variant="secondary"
            component="a"
            href={inventoryDownloadURL}
            isDisabled={selectedItems.length === 0}
          >
            Download data
          </Button>
          */}
        </LevelItem>
        <LevelItem>
          <Pagination {...paginationProps} widgetId="providers-table-pagination-top" />
        </LevelItem>
      </Level>
      <Table
        gridBreakPoint="grid-lg"
        aria-label={`${PROVIDER_TYPE_NAMES[providerType]} providers table`}
        variant="compact"
        cells={columns}
        rows={rows}
        sortBy={sortBy}
        onSort={onSort}
      >
        <TableHeader />
        <TableBody />
      </Table>
      <Pagination
        {...paginationProps}
        widgetId="providers-table-pagination-bottom"
        variant="bottom"
      />
    </>
  );
};
