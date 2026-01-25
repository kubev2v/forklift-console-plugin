import type { FC } from 'react';
import { TableCell } from 'src/components/TableCell/TableCell';

import type { HostCellProps } from './utils/types';

// Define cell renderer for 'host id'
const IDCellRenderer: FC<HostCellProps> = (props) => {
  return <TableCell>{props?.data?.inventory.id}</TableCell>;
};

export default IDCellRenderer;
