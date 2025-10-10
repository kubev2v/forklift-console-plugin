import { type FC, useCallback, useEffect, useState } from 'react';
import type { VmData } from 'src/modules/Providers/views/details/tabs/VirtualMachines/components/VMCellProps';

import type { ResourceField } from '@components/common/utils/types';
import SectionHeading from '@components/headers/SectionHeading';
import type { ProviderHost, VSphereResource } from '@kubev2v/types';
import {
  PageSection,
  Pagination,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { Table, Th, Thead, Tr } from '@patternfly/react-table';
import { isEmpty } from '@utils/helpers';
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
  initialSelectedIds: string[] | undefined;
  onSelect: ((selectedVMs: VmData[] | undefined) => void) | undefined;
  vmData: VmData[] | undefined;
  foldersDict: Record<string, VSphereResource>;
  hostsDict: Record<string, ProviderHost>;
};

const VsphereFolderTreeTable: FC<VsphereFolderTreeTableProps> = ({
  foldersDict,
  hostsDict,
  initialSelectedIds,
  onSelect,
  vmData,
}) => {
  const { t } = useForkliftTranslation();
  const [columns, setColumns] = useState<ResourceField[]>(defaultColumns);

  const setSelectedVmKeysControlled = useCallback(
    (ids: string[]) => {
      const set = new Set(ids);
      const selected = vmData?.filter((data) => set.has(data.vm.id));
      onSelect?.(selected);
    },
    [vmData, onSelect],
  );

  const canSelect = initialSelectedIds !== undefined;
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
      vmDataArr: vmData,
    });

  const {
    onPerPageSelect,
    onSetPage,
    pagination: { page, perPage },
  } = usePagination();

  const attributes = useTreeFilterAttributes(rows);
  const filters = useAttributeFilters<VmRow>(attributes);

  const filteredRows = useTreeFilters({ filters, rows, showAll });

  const { handleOnSort, sortBy, sortedBlocks, visibleCols } = useTreeSortBlocks({
    columns,
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
      />
      <Table isTreeTable data-testid="vsphere-tree-table">
        <Thead>
          <Tr>
            {visibleCols.map((col, idx) => (
              <Th key={col.id} sort={{ columnIndex: idx, onSort: handleOnSort, sortBy }}>
                {col.label}
              </Th>
            ))}
          </Tr>
        </Thead>
        <TreeTableBody
          clearAllFilters={filters.clearAll}
          columns={columns}
          groupVMCountByFolder={groupVMCountByFolder}
          hasFiltersApplied={filters.hasAttrFilters}
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
