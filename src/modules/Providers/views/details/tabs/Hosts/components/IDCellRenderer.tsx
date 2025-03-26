import React from 'react';
import { TableCell } from 'src/modules/Providers/utils';

import { HostCellProps } from './HostCellProps';

// Define cell renderer for 'host id'
export const IDCellRenderer: React.FC<HostCellProps> = (props) => {
  return <TableCell>{props?.data?.inventory.id}</TableCell>;
};
