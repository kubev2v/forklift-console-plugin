import type { FC } from 'react';
import { TableCell } from 'src/modules/Providers/utils/components/TableCell/TableCell';
import { getTargetPowerStateLabel, type TargetPowerStateValue } from 'src/plans/constants';

import type { V1beta1Plan } from '@kubev2v/types';
import { getPlanTargetPowerState } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers.ts';
import { t } from '@utils/i18n';

type VMTargetPowerStateCellRendererProps = {
  plan: V1beta1Plan;
  targetPowerState: TargetPowerStateValue;
};

export const VMTargetPowerStateCellRenderer: FC<VMTargetPowerStateCellRendererProps> = ({
  plan,
  targetPowerState,
}) => {
  const planTargetPowerState = getPlanTargetPowerState(plan);
  if (isEmpty(targetPowerState)) {
    return (
      <TableCell>
        {getTargetPowerStateLabel(planTargetPowerState)} {t('(Inherited from plan)')}
      </TableCell>
    );
  }
  return <TableCell>{getTargetPowerStateLabel(targetPowerState)}</TableCell>;
};
