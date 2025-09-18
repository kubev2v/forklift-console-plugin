import type { Dispatch, FC, ReactNode, SetStateAction } from 'react';

import type { ResourceField } from '@components/common/utils/types';
import { ManageColumnsToolbar } from '@components/page/ManageColumnsToolbar';
import TableBulkSelect from '@components/TableBulkSelect';
import { defaultColumns } from '@components/VsphereFoldersTable/utils/constants';
import type { VmRow } from '@components/VsphereFoldersTable/utils/types';
import { Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import { AttributeFiltersToolbar } from '../AttributeFilter/AttributeFilter';
import type { AttributeFilters } from '../AttributeFilter/hooks/useAttributeFilters';
import type { AttributeConfig } from '../AttributeFilter/utils/types';
import SelectedToggle from '../SelectedToggle/SelectedToggle';

type TreeToolbarProps = {
  attributes: AttributeConfig<VmRow>[];
  canSelect: boolean;
  columns: ResourceField[];
  filters: AttributeFilters<VmRow>;
  selectedVmKeys: string[];
  pageDataIds: string[];
  dataIds: string[];
  onSelect: (selectedIds: string[]) => void;
  setColumns: Dispatch<SetStateAction<ResourceField[]>>;
  setShowAll: Dispatch<SetStateAction<boolean>>;
  showAll: boolean;
  pagination: ReactNode;
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
}) => {
  return (
    <Toolbar clearAllFilters={filters.clearAll} id="vm-list-toolbar">
      <ToolbarContent>
        {canSelect && (
          <ToolbarItem>
            <TableBulkSelect
              dataIds={dataIds}
              onSelect={onSelect}
              pageDataIds={pageDataIds}
              selectedIds={selectedVmKeys}
              canPageSelect={!isEmpty(pageDataIds)}
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
        {canSelect && (
          <ToolbarItem>
            <SelectedToggle
              showAll={showAll}
              setShowAll={setShowAll}
              selectedVmKeys={selectedVmKeys}
            />
          </ToolbarItem>
        )}
        {pagination}
      </ToolbarContent>
    </Toolbar>
  );
};

export default TreeToolbar;
