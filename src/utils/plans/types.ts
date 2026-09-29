import type { V1beta1PlanSpecVms } from '@forklift-ui/types';

export type EnhancedPlanSpecVms = V1beta1PlanSpecVms & {
  excludeDisks?: string[];
  migrateSharedDisks?: boolean;
  nbdeClevis?: boolean;
};
