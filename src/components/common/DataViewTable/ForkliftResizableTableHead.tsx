import type { FC } from 'react';

import type { DataViewTh } from '@patternfly/react-data-view/dist/esm/DataViewTable/DataViewTable';
import { Thead, Tr } from '@patternfly/react-table';

import ForkliftResizableHeaderCell from './ForkliftResizableHeaderCell';

type ForkliftResizableTableHeadProps = {
  columns: DataViewTh[];
};

const getColumnKey = (column: DataViewTh): string => {
  if (column !== null && typeof column === 'object' && 'cell' in column) {
    return column.props?.id ?? column.props?.screenReaderText ?? 'layout-spacer';
  }
  return typeof column === 'string' ? column : 'unnamed-header';
};

const ForkliftResizableTableHead: FC<ForkliftResizableTableHeadProps> = ({ columns }) => (
  <Thead>
    <Tr>
      {columns.map((column) => (
        <ForkliftResizableHeaderCell column={column} key={getColumnKey(column)} />
      ))}
    </Tr>
  </Thead>
);

export default ForkliftResizableTableHead;
