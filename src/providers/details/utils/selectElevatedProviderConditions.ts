import type { K8sResourceCondition } from '@forklift-ui/types';
import { CATEGORY_TYPES, CONDITION_STATUS } from '@utils/constants';

import { getConditionCategory, LEGACY_PROVIDER_WARNING_CATEGORY } from './providerConditionUtils';

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
    category === LEGACY_PROVIDER_WARNING_CATEGORY
  );
};

export const selectElevatedProviderConditions = (
  conditions: K8sResourceCondition[] | undefined,
): K8sResourceCondition[] => (conditions ?? []).filter(isElevatedProviderCondition);
