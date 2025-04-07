import type { FC } from 'react';
import { TableCell } from 'src/modules/Providers/utils/components/TableCell/TableCell';

import type { HostCellProps } from './HostCellProps';

// Define cell renderer for 'mtu'
export const MTUCellRenderer: FC<HostCellProps> = (props) => {
  return <TableCell>{props?.data?.networkAdapter?.mtu}</TableCell>;
};
