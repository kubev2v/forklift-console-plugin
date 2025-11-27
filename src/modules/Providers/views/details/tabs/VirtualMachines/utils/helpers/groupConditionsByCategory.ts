import { getCategoryLabel } from '@components/Concerns/utils/category';
import { ConcernCategoryOptions } from '@components/Concerns/utils/constants';
import type { V1beta1PlanStatusConditions } from '@kubev2v/types';

export const groupConditionsByCategory = (
  conditions: V1beta1PlanStatusConditions[] = [],
): Record<string, V1beta1PlanStatusConditions[]> => {
  return conditions.reduce<Record<string, V1beta1PlanStatusConditions[]>>(
    (acc, condition) => {
      if (!acc[getCategoryLabel(condition.category)]) {
        acc[condition.category] = [];
      }
      acc[getCategoryLabel(condition.category)].push(condition);
      return acc;
    },
    {
      [ConcernCategoryOptions.Critical]: [],
      [ConcernCategoryOptions.Information]: [],
      [ConcernCategoryOptions.Warning]: [],
    },
  );
};
