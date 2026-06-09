import type { FC } from 'react';
import { TableCell } from 'src/components/TableCell/TableCell';
import { TableEmptyCell } from 'src/components/TableCell/TableEmptyCell';

import { getVmGuestOS } from '@utils/vm/getVmGuestOS';

import type { VMCellProps } from './VMCellProps';

export const GuestOSCellRenderer: FC<VMCellProps> = ({ data }) => {
  const guestOS = getVmGuestOS(data?.vm);

  if (!guestOS) {
    return <TableEmptyCell />;
  }

  return <TableCell>{guestOS}</TableCell>;
};
