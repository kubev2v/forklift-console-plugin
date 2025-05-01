import type { V1beta1Plan } from '@kubev2v/types';

export type EditableDetailsItemProps = {
  canPatch: boolean;
  plan: V1beta1Plan;
  shouldRender?: boolean;
};
