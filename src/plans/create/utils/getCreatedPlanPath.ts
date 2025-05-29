import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';

import { PlanModelRef } from '@kubev2v/types';

/**
 * Generates the resource URL path for a migration plan
 */
export const getCreatedPlanPath = (planName: string, planProject: string) =>
  getResourceUrl({
    name: planName,
    namespace: planProject,
    reference: PlanModelRef,
  });
