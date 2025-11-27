import { groupConcernsByCategory } from 'src/modules/Providers/views/details/tabs/VirtualMachines/utils/helpers/groupConcernsByCategory';
import { groupConditionsByCategory } from 'src/modules/Providers/views/details/tabs/VirtualMachines/utils/helpers/groupConditionsByCategory';
import type { SpecVirtualMachinePageData } from 'src/plans/details/tabs/VirtualMachines/components/PlanSpecVirtualMachinesList/utils/types';

import type { Concern, V1beta1PlanStatusConditions } from '@kubev2v/types';

import { getCategorySeverityRank } from './category';
import { orderedConcernCategories, type VirtualMachineWithConcerns } from './constants';

export const getOrderedConcernCategoriesSum = (
  obj: string | boolean | object | ((resourceData: unknown) => unknown),
): number[] => {
  const concerns: Concern[] = (
    (obj as SpecVirtualMachinePageData)?.inventoryVmData?.vm as VirtualMachineWithConcerns
  )?.concerns;
  const conditions: V1beta1PlanStatusConditions[] | undefined = (obj as SpecVirtualMachinePageData)
    ?.conditions;
  const groupedConcerns = groupConcernsByCategory(concerns);
  const groupedConditions = groupConditionsByCategory(conditions);

  return orderedConcernCategories.map((category) => {
    return (
      2 - getCategorySeverityRank(category),
      groupedConcerns[category].length + groupedConditions[category].length
    );
  });
};
