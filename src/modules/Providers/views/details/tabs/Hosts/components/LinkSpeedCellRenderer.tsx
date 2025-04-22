import type { FC } from 'react';
import { TableCell } from 'src/modules/Providers/utils/components/TableCell/TableCell';

import type { HostCellProps } from './HostCellProps';

// Define cell renderer for 'linkSpeed'
export const LinkSpeedCellRenderer: FC<HostCellProps> = (props: HostCellProps) => {
  const linkSpeed = props?.data?.networkAdapter?.linkSpeed;
  return <TableCell>{linkSpeed ? `${linkSpeed} Mbps` : ''}</TableCell>;
};
