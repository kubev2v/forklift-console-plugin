import type { FC } from 'react';
import { TableCell } from 'src/modules/Providers/utils/components/TableCell/TableCell';

import type { HostCellProps } from './utils/types';

// Define cell renderer for 'mtu'
const MTUCellRenderer: FC<HostCellProps> = (props) => {
  return <TableCell>{props?.data?.networkAdapter?.mtu}</TableCell>;
};

export default MTUCellRenderer;
