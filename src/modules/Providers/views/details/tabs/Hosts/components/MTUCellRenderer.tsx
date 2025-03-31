import React from 'react';
import { TableCell } from 'src/modules/Providers/utils';

import type { HostCellProps } from './HostCellProps';

// Define cell renderer for 'mtu'
export const MTUCellRenderer: React.FC<HostCellProps> = (props) => {
  return <TableCell>{props?.data?.networkAdapter?.mtu}</TableCell>;
};
