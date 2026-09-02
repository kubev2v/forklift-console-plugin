import type { Dispatch, FC, ReactNode, SetStateAction } from 'react';

import type { ResourceField } from '@components/common/utils/types';
import { ManageColumnsToolbar } from '@components/page/ManageColumnsToolbar';
import SelectedToggle from '@components/SelectedToggle/SelectedToggle';
import TableBulkSelect from '@components/TableBulkSelect/TableBulkSelect';
import { defaultColumns } from '@components/VsphereFoldersTable/utils/constants';
import type { VmRow } from '@components/VsphereFoldersTable/utils/types';
import { Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import { AttributeFiltersToolbar } from '../AttributeFilter/AttributeFilter';
import type { AttributeFilters } from '../AttributeFilter/hooks/useAttributeFilters';
import type { AttributeConfig } from '../AttributeFilter/utils/types';

type TreeToolbarProps = {
  attributes: AttributeConfig<VmRow>[];
  canSelect: boolean;
  columns: ResourceField[];
  dataIds: string[];
  filters: AttributeFilters<VmRow>;
  onSelect: (selectedIds: string[]) => void;
  pageDataIds: string[];
  pagination: ReactNode;
  selectedVmKeys: string[];
  setColumns: Dispatch<SetStateAction<ResourceField[]>>;
  setShowAll: Dispatch<SetStateAction<boolean>>;
  showAll: boolean;
  toolbarActions?: ReactNode;
};

const TreeToolbar: FC<TreeToolbarProps> = ({
  attributes,
  canSelect,
  columns,
  dataIds,
  filters,
  onSelect,
  pageDataIds,
  pagination,
  selectedVmKeys,
  setColumns,
  setShowAll,
  showAll,
  toolbarActions,
}) => {
  return (
    <Toolbar className="pf-v6-u-pb-0" clearAllFilters={filters.clearAll} id="vm-list-toolbar">
      <ToolbarContent>
        {canSelect && (
          <ToolbarItem>
            <TableBulkSelect
              canPageSelect={!isEmpty(pageDataIds)}
              dataIds={dataIds}
              onSelect={onSelect}
              pageDataIds={pageDataIds}
              selectedIds={selectedVmKeys}
            />
          </ToolbarItem>
        )}
        <ToolbarItem>
          <AttributeFiltersToolbar attributes={attributes} {...filters} />
        </ToolbarItem>
        <ManageColumnsToolbar
          defaultColumns={defaultColumns}
          resourceFields={columns}
          setColumns={setColumns}
        />
        {toolbarActions}
        {canSelect && (
          <ToolbarItem>
            <SelectedToggle
              selectedVmKeys={selectedVmKeys}
              setShowAll={setShowAll}
              showAll={showAll}
            />
          </ToolbarItem>
        )}
        {pagination}
      </ToolbarContent>
    </Toolbar>
  );
};

export default TreeToolbar;
