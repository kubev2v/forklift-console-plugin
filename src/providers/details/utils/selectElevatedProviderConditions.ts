import type { K8sResourceCondition } from '@forklift-ui/types';
import { CATEGORY_TYPES, CONDITION_STATUS } from '@utils/constants';

const getConditionCategory = (condition: K8sResourceCondition): string => {
  const { category } = condition as { category?: unknown };
  return typeof category === 'string' ? category : '';
};

export const isElevatedProviderCondition = (
  condition: K8sResourceCondition | undefined,
): boolean => {
  if (condition?.status !== CONDITION_STATUS.TRUE) {
    return false;
  }

  const category = getConditionCategory(condition);

  return (
    category === CATEGORY_TYPES.CRITICAL ||
    category === CATEGORY_TYPES.WARNING ||
    category === 'Warning'
  );
};

export const selectElevatedProviderConditions = (
  conditions: K8sResourceCondition[] | undefined,
): K8sResourceCondition[] => (conditions ?? []).filter(isElevatedProviderCondition);
