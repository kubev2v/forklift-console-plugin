import type { FC } from 'react';
import { TableCell } from 'src/components/TableCell/TableCell';

import type { VMCellProps } from './VMCellProps';

export const VMNameCellRenderer: FC<VMCellProps> = ({ data }) => {
  return <TableCell>{data.name}</TableCell>;
};
