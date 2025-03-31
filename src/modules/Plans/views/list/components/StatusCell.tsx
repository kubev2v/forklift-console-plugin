import React from 'react';
import { getPlanPhase } from 'src/modules/Plans/utils/helpers/getPlanPhase';
import { PlanPhase } from 'src/modules/Plans/utils/types/PlanPhase';
import { TableIconCell } from 'src/modules/Providers/utils/components/TableCell/TableIconCell';

import { CellProps } from './CellProps';
import { ErrorStatusCell } from './ErrorStatusCell';
import { PlanStatusIcon } from './PlanStatusIcon';
import { VMsProgressCell } from './VMsProgressCell';

export const StatusCell: React.FC<CellProps> = (props) => {
  const { data } = props;

  const phase = getPlanPhase(data);
  const phaseLabel: string = phase;

  switch (phase) {
    case PlanPhase.Error:
    case PlanPhase.Warning:
      return ErrorStatusCell(props);
    case PlanPhase.Failed:
    case PlanPhase.Canceled:
    case PlanPhase.Running:
    case PlanPhase.Succeeded:
    case PlanPhase.vmError:
      return VMsProgressCell(props);
  }

  return <TableIconCell icon={<PlanStatusIcon phase={phase} />}>{phaseLabel}</TableIconCell>;
};
