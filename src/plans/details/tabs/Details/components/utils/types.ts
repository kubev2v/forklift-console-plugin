import type { V1beta1Plan, V1beta1Provider } from '@forklift-ui/types';

export type EditableDetailsItemProps = {
  canPatch: boolean;
  plan: V1beta1Plan;
  shouldRender?: boolean;
  isVddkInitImageNotSet?: boolean;
  sourceProvider?: V1beta1Provider;
};
