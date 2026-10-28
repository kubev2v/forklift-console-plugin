import type { V1beta1PlanSpecVms } from '@forklift-ui/types';

type PlanVmExcludeDisksFields = {
  excludeDisks?: string[];
};

export const getPlanVmExcludeDisks = (vm?: V1beta1PlanSpecVms): string[] | undefined => {
  if (vm === undefined) {
    return undefined;
  }
  return (vm as PlanVmExcludeDisksFields).excludeDisks;
};
