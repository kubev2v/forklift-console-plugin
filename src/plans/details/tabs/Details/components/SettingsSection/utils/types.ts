import type { TargetPowerStateValue } from 'src/plans/constants';

import type { V1beta1Plan, V1beta1PlanSpec, V1beta1PlanSpecVms } from '@kubev2v/types';

export type EditPlanProps = {
  resource: V1beta1Plan;
};

type PlanNameTemplates = {
  pvcNameTemplate?: string;
  volumeNameTemplate?: string;
  networkNameTemplate?: string;
  targetName?: string;
};

export type EnhancedPlanSpecVms = V1beta1PlanSpecVms &
  PlanNameTemplates & {
    nbdeClevis?: boolean;
  };

export type EnhancedPlan = V1beta1Plan & {
  spec: V1beta1PlanSpec &
    PlanNameTemplates & {
      migrateSharedDisks?: boolean;
      vms: EnhancedPlanSpecVms[];
      skipGuestConversion?: boolean;
      useCompatibilityMode?: boolean;
      targetPowerState: TargetPowerStateValue;
    };
};
