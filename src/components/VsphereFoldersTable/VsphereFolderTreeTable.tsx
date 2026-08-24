import type { FC } from 'react';
import type { ProviderVmData } from 'src/utils/types';

import SectionHeading from '@components/headers/SectionHeading';
import InspectVirtualMachinesButton from '@components/InspectVirtualMachines/InspectVirtualMachinesButton';
import type { V1beta1Provider, VSphereResource } from '@forklift-ui/types';
import type { ProviderHost } from '@forklift-ui/types';
import {
  PageSection,
  Pagination,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { Table } from '@patternfly/react-table';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import TreeTableBody from './components/TreeTableBody/TreeTableBody';
import TreeToolbar from './components/TreeToolbar/TreeToolbar';
import VsphereFolderTreeTableHead from './components/VsphereFolderTreeTableHead';
import { useVsphereFolderTreeTable } from './hooks/useVsphereFolderTreeTable';
import { getVmRowsId } from './hooks/utils/vmRowAccessors';

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

const VsphereFolderTreeTable: FC<VsphereFolderTreeTableProps> = (props) => {
  const { t } = useForkliftTranslation();
  const {
    attributes,
    canInspect,
    canSelect,
    columns,
    conversions,
    disabledReason,
    filteredGroupVMCountByFolder,
    filters,
    groupVMCountByFolder,
    handleOnSort,
    inspectionExpandedRows,
    itemCount,
    onPerPageSelect,
    onSetPage,
    page,
    pagedRows,
    perPage,
    provider,
    rows,
    selectedVmKeys,
    setColumns,
    setInspectionExpandedRows,
    setSelectedVmKeys,
    setShowAll,
    showAll,
    sortBy,
    visibleCols,
  } = useVsphereFolderTreeTable(props);

  const inspectToolbarAction =
    !canSelect && provider ? (
      <ToolbarItem>
        <InspectVirtualMachinesButton
          canInspect={canInspect}
          disabledReason={disabledReason}
          provider={provider}
          testId="provider-inspect-vms-button"
        />
      </ToolbarItem>
    ) : undefined;

  const pagination = (
    <ToolbarItem variant="pagination">
      <Pagination
        itemCount={itemCount}
        onPerPageSelect={onPerPageSelect}
        onSetPage={onSetPage}
        page={page}
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
        filters={filters}
        onSelect={(selectIds) => {
          setSelectedVmKeys(selectIds);
          if (!showAll && isEmpty(selectIds)) {
            setShowAll(true);
          }
        }}
        pageDataIds={getVmRowsId(pagedRows)}
        pagination={pagination}
        selectedVmKeys={selectedVmKeys}
        setColumns={setColumns}
        setShowAll={setShowAll}
        showAll={showAll}
        toolbarActions={inspectToolbarAction}
      />
      <Table data-testid="vsphere-tree-table" isTreeTable>
        <VsphereFolderTreeTableHead
          handleOnSort={handleOnSort}
          sortBy={sortBy}
          visibleCols={visibleCols}
        />
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
