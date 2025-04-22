import { ProgressVariant } from '@patternfly/react-core';

import { PlanPhase } from '../types/PlanPhase';

export const getPlanProgressVariant = (phase: PlanPhase): ProgressVariant | undefined => {
  let progressVariant;

  switch (phase) {
    case PlanPhase.Error:
    case PlanPhase.Failed:
      progressVariant = ProgressVariant.danger;
      break;
    case PlanPhase.Unknown:
    case PlanPhase.Archived:
    case PlanPhase.Canceled:
    case PlanPhase.vmError:
      progressVariant = ProgressVariant.warning;
      break;
    case PlanPhase.Succeeded:
      progressVariant = ProgressVariant.success;
      break;
    default:
      break;
  }

  return progressVariant;
};
