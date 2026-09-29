import type { FC } from 'react';
import { TableCell } from 'src/components/TableCell/TableCell';

import { EMPTY_MSG } from '@utils/constants';
import { getVmExcludeDisks } from '@utils/crds/plans/selectors';
import type { EnhancedPlanSpecVms } from '@utils/plans/types';

type ExcludeDisksCellRendererProps = {
  specVM: EnhancedPlanSpecVms | undefined;
};

export const ExcludeDisksCellRenderer: FC<ExcludeDisksCellRendererProps> = ({ specVM }) => {
  const excluded = getVmExcludeDisks(specVM);

  if (!excluded?.length) {
    return <TableCell>{EMPTY_MSG}</TableCell>;
  }

  return <TableCell>{excluded.join(', ')}</TableCell>;
};
