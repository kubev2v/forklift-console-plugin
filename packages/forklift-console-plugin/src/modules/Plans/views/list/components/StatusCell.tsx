import React from 'react';
import { getPhaseLabel, getPlanPhase } from 'src/modules/Plans/utils';
import { TableIconCell } from 'src/modules/Providers/utils';

import { CellProps } from './CellProps';
import { ErrorStatusCell } from './ErrorStatusCell';
import { PlanStatusIcon } from './PlanStatusIcon';
import { VMsProgressCell } from './VMsProgressCell';

export const StatusCell: React.FC<CellProps> = (props) => {
  const { data } = props;

  const phase = getPlanPhase(data);
  const phaseLabel = getPhaseLabel(phase);

  switch (phase) {
    case 'Error':
    case 'Warning':
      return ErrorStatusCell(props);
    case 'Failed':
    case 'Canceled':
    case 'Running':
    case 'Succeeded':
    case 'vmError':
      return VMsProgressCell(props);
  }

  return <TableIconCell icon={<PlanStatusIcon phase={phase} />}>{phaseLabel}</TableIconCell>;
};
