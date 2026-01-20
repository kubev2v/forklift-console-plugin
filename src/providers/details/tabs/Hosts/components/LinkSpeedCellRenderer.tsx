import type { FC } from 'react';
import { TableCell } from 'src/components/TableCell/TableCell';

import type { HostCellProps } from './utils/types';

// Define cell renderer for 'linkSpeed'
const LinkSpeedCellRenderer: FC<HostCellProps> = (props: HostCellProps) => {
  const linkSpeed = props?.data?.networkAdapter?.linkSpeed;
  return <TableCell>{linkSpeed ? `${linkSpeed} Mbps` : ''}</TableCell>;
};

export default LinkSpeedCellRenderer;
