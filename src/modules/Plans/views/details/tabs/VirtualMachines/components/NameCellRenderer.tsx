import React from 'react';
import { TableCell } from 'src/modules/Providers/utils';

import type { PlanVMsCellProps } from './PlanVMsCellProps';

// Define cell renderer for 'name'
export const NameCellRenderer: React.FC<PlanVMsCellProps> = ({ data }) => {
  return <TableCell>{data?.specVM?.name}</TableCell>;
};
