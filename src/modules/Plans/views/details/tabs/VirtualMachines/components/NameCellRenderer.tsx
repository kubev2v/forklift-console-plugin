import type { FC } from 'react';
import { TableCell } from 'src/modules/Providers/utils/components/TableCell/TableCell';

import type { PlanVMsCellProps } from './PlanVMsCellProps';

// Define cell renderer for 'name'
export const NameCellRenderer: FC<PlanVMsCellProps> = ({ data }) => {
  return <TableCell>{data?.specVM?.name}</TableCell>;
};
