import React from 'react';
import { TableCell } from 'src/modules/Providers/utils';

import type { HostCellProps } from './HostCellProps';

// Define cell renderer for 'linkSpeed'
export const LinkSpeedCellRenderer: React.FC<HostCellProps> = (props: HostCellProps) => {
  const linkSpeed = props?.data?.networkAdapter?.linkSpeed;
  return <TableCell>{linkSpeed ? `${linkSpeed} Mbps` : ''}</TableCell>;
};
