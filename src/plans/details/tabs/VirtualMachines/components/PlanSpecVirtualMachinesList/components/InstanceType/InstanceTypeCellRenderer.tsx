import type { FC } from 'react';
import { TableCell } from 'src/components/TableCell/TableCell';

import { EMPTY_MSG } from '@utils/constants';

type InstanceTypeCellRendererProps = {
  instanceType: string | undefined;
};

export const InstanceTypeCellRenderer: FC<InstanceTypeCellRendererProps> = ({ instanceType }) => (
  <TableCell>{instanceType ?? EMPTY_MSG}</TableCell>
);
