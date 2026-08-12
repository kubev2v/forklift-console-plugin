import type { V1beta1Plan, V1beta1Provider } from '@forklift-ui/types';

export type EditPlanProps = {
  isVddkInitImageNotSet?: boolean;
  resource: V1beta1Plan;
  sourceProvider?: V1beta1Provider;
};
