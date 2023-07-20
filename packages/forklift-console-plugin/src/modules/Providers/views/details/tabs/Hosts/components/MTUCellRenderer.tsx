import React from 'react';
import { TableCell } from 'src/modules/Providers/utils';

import { HostCellProps } from './HostCellProps';

// Define cell renderer for 'mtu'
export const MTUCellRenderer: React.FC<HostCellProps> = (props) => {
  return <TableCell>{props?.data?.networkAdapter?.mtu}</TableCell>;
};
