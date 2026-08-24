import type { FC } from 'react';

import { Th, Thead, Tr } from '@patternfly/react-table';

import type useTreeSortBlocks from '../hooks/useTreeSortBlocks';

type VsphereFolderTreeTableHeadProps = Pick<
  ReturnType<typeof useTreeSortBlocks>,
  'handleOnSort' | 'sortBy' | 'visibleCols'
>;

const VsphereFolderTreeTableHead: FC<VsphereFolderTreeTableHeadProps> = ({
  handleOnSort,
  sortBy,
  visibleCols,
}) => (
  <Thead>
    <Tr>
      {visibleCols.map((col, idx) => (
        <Th
          info={col.info}
          key={col.id}
          sort={col.sortable ? { columnIndex: idx, onSort: handleOnSort, sortBy } : undefined}
        >
          {col.label}
        </Th>
      ))}
    </Tr>
  </Thead>
);

export default VsphereFolderTreeTableHead;
