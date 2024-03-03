import { ProgressVariant } from '@patternfly/react-core';

import { PlanPhase } from '../types';

export const getPlanProgressVariant = (phase: PlanPhase): ProgressVariant => {
  let progressVariant;

  switch (phase) {
    case 'Error':
    case 'Failed':
      progressVariant = ProgressVariant.danger;
      break;
    case 'Unknown':
    case 'Archived':
    case 'Canceled':
    case 'vmError':
      progressVariant = ProgressVariant.warning;
      break;
    case 'Succeeded':
      progressVariant = ProgressVariant.success;
      break;
  }

  return progressVariant;
};
