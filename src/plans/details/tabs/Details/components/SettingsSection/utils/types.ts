import type { V1beta1Plan } from '@kubev2v/types';

export type SettingsDetailsItemProps = {
  canPatch: boolean;
  plan: V1beta1Plan;
  shouldRender?: boolean;
};

export type EditPlanProps = {
  resource: V1beta1Plan;
};
