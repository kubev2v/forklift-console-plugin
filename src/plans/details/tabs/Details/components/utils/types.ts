import type { V1beta1Plan } from '@forklift-ui/types';

export type EditableDetailsItemProps = {
  canPatch: boolean;
  plan: V1beta1Plan;
  shouldRender?: boolean;
  isVddkInitImageNotSet?: boolean;
};
