import { PlanModelRef } from '@kubev2v/types';
import { getResourceUrl } from '@utils/getResourceUrl';

/**
 * Generates the resource URL path for a migration plan
 */
export const getCreatedPlanPath = (planName: string, planProject: string) =>
  getResourceUrl({
    name: planName,
    namespace: planProject,
    reference: PlanModelRef,
  });
