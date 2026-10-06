import type { FC } from 'react';
import { TableCell } from 'src/components/TableCell/TableCell';

import type { V1beta1PlanSpecVms } from '@forklift-ui/types';
import { EMPTY_MSG } from '@utils/constants';
import { getVmExcludeDisks } from '@utils/crds/plans/selectors';

type ExcludeDisksCellRendererProps = {
  specVM: V1beta1PlanSpecVms | undefined;
};

export const ExcludeDisksCellRenderer: FC<ExcludeDisksCellRendererProps> = ({ specVM }) => {
  const excluded = getVmExcludeDisks(specVM);

  if (!excluded?.length) {
    return <TableCell>{EMPTY_MSG}</TableCell>;
  }

  return <TableCell>{excluded.join(', ')}</TableCell>;
};
