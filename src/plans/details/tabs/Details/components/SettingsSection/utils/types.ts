import type { V1beta1Plan, V1beta1PlanSpecVms, V1beta1Provider } from '@forklift-ui/types';

export type EditPlanProps = {
  resource: V1beta1Plan;
  isVddkInitImageNotSet?: boolean;
  sourceProvider?: V1beta1Provider;
};

export type EnhancedPlanSpecVms = V1beta1PlanSpecVms & {
  nbdeClevis?: boolean;
};
