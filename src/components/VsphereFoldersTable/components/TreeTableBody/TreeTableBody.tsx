import type { FC } from 'react';

import type { ResourceField } from '@components/common/utils/types';
import { ConcernsTable } from '@components/Concerns/components/ConcernsTable';
import { ROW_TYPE, type RowNode } from '@components/VsphereFoldersTable/utils/types';
import { Tbody, Td, Tr } from '@patternfly/react-table';
import { isEmpty } from '@utils/helpers';

import FolderTreeRow from '../FolderTreeRow/FolderTreeRow';
import TreeTableEmptyState from '../TreeTableEmptyState/TreeTableEmptyState';
import VmTreeRow from '../VmTreeRow/VmTreeRow';

type TreeTableBodyProps = {
  pagedRows: RowNode[];
  columns: ResourceField[];
  groupVMCountByFolder: Map<string, number>;
  clearAllFilters: () => void;
  hasFiltersApplied: boolean;
  showAll: boolean;
};

const TreeTableBody: FC<TreeTableBodyProps> = ({
  clearAllFilters,
  columns,
  groupVMCountByFolder,
  hasFiltersApplied,
  pagedRows,
  showAll,
}) => {
  const colSpan = columns.length + 1;
  if (isEmpty(pagedRows)) {
    return (
      <TreeTableEmptyState
        clearAllFilters={clearAllFilters}
        colSpan={colSpan}
        hasFiltersApplied={hasFiltersApplied}
      />
    );
  }

  return (
    <Tbody>
      {pagedRows
        .filter((row) => (showAll ? true : row.isSelected))
        .map((row) => {
          if (row.type === ROW_TYPE.Folder) {
            return (
              <FolderTreeRow key={row.key} row={row} groupVMCountByFolder={groupVMCountByFolder} />
            );
          }

          if (row.type === ROW_TYPE.Vm) {
            return <VmTreeRow key={row.key} row={row} columns={columns} />;
          }

          if (row.type === ROW_TYPE.Concerns) {
            return (
              <Tr key={row.key} isHidden={row.isHidden}>
                <Td colSpan={colSpan}>
                  <ConcernsTable vmData={row.vmData} />
                </Td>
              </Tr>
            );
          }

          return null;
        })}
    </Tbody>
  );
};

export default TreeTableBody;
