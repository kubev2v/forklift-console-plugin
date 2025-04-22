import type { FC } from 'react';
import { TableCell } from 'src/modules/Providers/utils/components/TableCell/TableCell';

import type { HostCellProps } from './HostCellProps';

// Define cell renderer for 'host id'
export const IDCellRenderer: FC<HostCellProps> = (props) => {
  return <TableCell>{props?.data?.inventory.id}</TableCell>;
};
