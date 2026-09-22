import type { K8sResourceCondition } from '@forklift-ui/types';

/** Backend has used both `Warn` (current) and `Warning` (legacy) category values. */
export const LEGACY_PROVIDER_WARNING_CATEGORY = 'Warning';

export const getConditionCategory = (condition: K8sResourceCondition): string => {
  const { category } = condition as { category?: unknown };
  return typeof category === 'string' ? category : '';
};

export const getConditionType = (condition: K8sResourceCondition): string => {
  const { type } = condition as { type?: unknown };
  return typeof type === 'string' ? type : '';
};
