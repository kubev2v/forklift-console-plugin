import { type FC, useCallback, useEffect, useRef, useState } from 'react';
import { useCanInspectProvider } from 'src/providers/details/hooks/useCanInspectProvider';
import type { ProviderVmData } from 'src/utils/types';

import type { ResourceField } from '@components/common/utils/types';
import SectionHeading from '@components/headers/SectionHeading';
import InspectVirtualMachinesButton from '@components/InspectVirtualMachines/InspectVirtualMachinesButton';
import type { ProviderHost, V1beta1Provider, VSphereResource } from '@forklift-ui/types';
import {
  PageSection,
  Pagination,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { Table, Th, Thead, Tr } from '@patternfly/react-table';
import { CONVERSION_LABELS, CONVERSION_TYPE } from '@utils/crds/conversion/constants';
import { isEmpty } from '@utils/helpers';
import { useWatchConversions } from '@utils/hooks/useWatchConversions';
import { useForkliftTranslation } from '@utils/i18n';

import { useAttributeFilters } from './components/AttributeFilter/hooks/useAttributeFilters';
import TreeTableBody from './components/TreeTableBody/TreeTableBody';
import TreeToolbar from './components/TreeToolbar/TreeToolbar';
import usePagination from './hooks/usePagination/usePagination';
import { useTreeFilterAttributes } from './hooks/useTreeFilterAttributes';
import useTreePagination from './hooks/useTreePagination';
import { useTreeRows } from './hooks/useTreeRows';
import useTreeSortBlocks from './hooks/useTreeSortBlocks';
import useTreeFilters from './hooks/useTreeVMFilters';
import { getVmRowsId } from './hooks/utils/treeUtils';
import { defaultColumns } from './utils/constants';
import type { VmRow } from './utils/types';

type VsphereFolderTreeTableProps = {
  foldersDict: Record<string, VSphereResource>;
  hostsDict: Record<string, ProviderHost>;
  initialSelectedIds: string[] | undefined;
  onSelect: ((selectedVMs: ProviderVmData[] | undefined) => void) | undefined;
  provider?: V1beta1Provider;
  providerNamespace?: string;
  providerUid?: string;
  vmData: ProviderVmData[] | undefined;
};

const VsphereFolderTreeTable: FC<VsphereFolderTreeTableProps> = ({
  foldersDict,
  hostsDict,
  initialSelectedIds,
  onSelect,
  provider,
  providerNamespace,
  providerUid,
  vmData,
}) => {
  const { t } = useForkliftTranslation();
  const [columns, setColumns] = useState<ResourceField[]>(defaultColumns);
  const [inspectionExpandedRows, setInspectionExpandedRows] = useState<Set<string>>(new Set());

  const [conversions] = useWatchConversions({
    namespace: providerNamespace ?? '',
    selector: {
      matchLabels: {
        [CONVERSION_LABELS.CONVERSION_TYPE]: CONVERSION_TYPE.DEEP_INSPECTION,
        ...(providerUid ? { [CONVERSION_LABELS.PROVIDER]: providerUid } : {}),
      },
    },
  });
  const visibleVmIdsRef = useRef<Set<string> | undefined>(undefined);

  const setSelectedVmKeysControlled = useCallback(
    (ids: string[]) => {
      const set = new Set(ids);
      const selected = vmData?.filter((data) => set.has(data.vm.id));
      onSelect?.(selected);
    },
    [vmData, onSelect],
  );

  const canSelect = initialSelectedIds !== undefined;
  const { canInspect, disabledReason } = useCanInspectProvider(provider);

  const inspectToolbarAction =
    !canSelect && provider ? (
      <ToolbarItem>
        <InspectVirtualMachinesButton
          canInspect={canInspect}
          disabledReason={disabledReason}
          provider={provider}
        />
      </ToolbarItem>
    ) : undefined;
  const { groupVMCountByFolder, rows, selectedVmKeys, setSelectedVmKeys, setShowAll, showAll } =
    useTreeRows({
      ...(initialSelectedIds
        ? {
            controls: {
              selectedVmKeys: initialSelectedIds,
              setSelectedVmKeys: setSelectedVmKeysControlled,
            },
          }
        : undefined),
      canSelect,
      foldersDict,
      hostsDict,
      visibleVmIdsRef,
      vmDataArr: vmData,
    });

  const {
    onPerPageSelect,
    onSetPage,
    pagination: { page, perPage },
  } = usePagination();

  const attributes = useTreeFilterAttributes(rows, conversions);
  const filters = useAttributeFilters<VmRow>(attributes);

  const { filteredGroupVMCountByFolder, filteredRows, visibleVmIds } = useTreeFilters({
    filters,
    rows,
    showAll,
  });

  visibleVmIdsRef.current = filters.hasAttrFilters || !showAll ? visibleVmIds : undefined;

  const { handleOnSort, sortBy, sortedBlocks, visibleCols } = useTreeSortBlocks({
    columns,
    conversions,
    filteredRows,
  });

  const { itemCount, pagedRows } = useTreePagination({ blocks: sortedBlocks, page, perPage });

  useEffect(() => {
    // if page > max pages after filter/sort, snap back
    const maxPage = Math.max(1, Math.ceil(itemCount / perPage));
    if (page > maxPage) onSetPage({} as MouseEvent, 1);
  }, [itemCount, onSetPage, page, perPage]);

  const pagination = (
    <ToolbarItem variant="pagination">
      <Pagination
        page={page}
        onSetPage={onSetPage}
        onPerPageSelect={onPerPageSelect}
        itemCount={itemCount}
        perPage={perPage}
      />
    </ToolbarItem>
  );

  return (
    <PageSection hasBodyWrapper={false}>
      {!canSelect && <SectionHeading text={t('Virtual machines')} />}
      <TreeToolbar
        attributes={attributes}
        canSelect={canSelect}
        columns={columns}
        dataIds={getVmRowsId(rows)}
        onSelect={(selectIds) => {
          setSelectedVmKeys(selectIds);
          if (!showAll && isEmpty(selectIds)) {
            setShowAll(true);
          }
        }}
        pageDataIds={getVmRowsId(pagedRows)}
        selectedVmKeys={selectedVmKeys}
        filters={filters}
        pagination={pagination}
        setColumns={setColumns}
        setShowAll={setShowAll}
        showAll={showAll}
        toolbarActions={inspectToolbarAction}
      />
      <Table isTreeTable data-testid="vsphere-tree-table">
        <Thead>
          <Tr>
            {visibleCols.map((col, idx) => (
              <Th
                key={col.id}
                sort={col.sortable ? { columnIndex: idx, onSort: handleOnSort, sortBy } : undefined}
                info={col.info}
              >
                {col.label}
              </Th>
            ))}
          </Tr>
        </Thead>
        <TreeTableBody
          clearAllFilters={filters.clearAll}
          columns={columns}
          conversions={conversions}
          groupVMCountByFolder={
            filters.hasAttrFilters ? filteredGroupVMCountByFolder : groupVMCountByFolder
          }
          hasFiltersApplied={filters.hasAttrFilters}
          inspectionExpandedRows={inspectionExpandedRows}
          onToggleInspectionExpand={setInspectionExpandedRows}
          pagedRows={pagedRows}
          showAll={showAll}
        />
      </Table>
      <Toolbar>
        <ToolbarContent>{pagination}</ToolbarContent>
      </Toolbar>
    </PageSection>
  );
};

export default VsphereFolderTreeTable;
