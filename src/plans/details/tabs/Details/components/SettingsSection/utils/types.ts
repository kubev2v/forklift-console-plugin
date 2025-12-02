import type { V1beta1Plan, V1beta1PlanSpecVms } from '@kubev2v/types';

export type EditPlanProps = {
  resource: V1beta1Plan;
  isVddkInitImageNotSet?: boolean;
};

export type EnhancedPlanSpecVms = V1beta1PlanSpecVms & {
  nbdeClevis?: boolean;
};
