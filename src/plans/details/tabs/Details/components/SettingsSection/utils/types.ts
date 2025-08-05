import type { V1beta1Plan, V1beta1PlanSpec, V1beta1PlanSpecVms } from '@kubev2v/types';

export type EditPlanProps = {
  resource: V1beta1Plan;
};

type PlanNameTemplates = {
  pvcNameTemplate?: string;
  volumeNameTemplate?: string;
  networkNameTemplate?: string;
};

type EnhancedPlanSpecVms = V1beta1PlanSpecVms & PlanNameTemplates;

export type EnhancedPlan = V1beta1Plan & {
  spec: V1beta1PlanSpec &
    PlanNameTemplates & {
      migrateSharedDisks?: boolean;
      vms: EnhancedPlanSpecVms[];
      skipGuestConversion?: boolean;
      useCompatibilityMode?: boolean;
    };
};
