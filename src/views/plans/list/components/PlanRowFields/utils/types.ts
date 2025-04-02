import type { V1beta1Plan } from '@kubev2v/types';

export type CellProps = {
  plan: V1beta1Plan;
  fieldId?: string;
};

export type PlanFieldProps = {
  plan: V1beta1Plan;
};
