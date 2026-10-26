import type { V1beta1PlanSpecVms } from '@forklift-ui/types';

type PlanVmExcludeDisks = {
  excludeDisks?: string[];
};

export const getPlanVmExcludeDisks = (vm?: V1beta1PlanSpecVms): string[] | undefined => {
  const withExcludeDisks = vm as PlanVmExcludeDisks | undefined;
  return withExcludeDisks?.excludeDisks;
};
