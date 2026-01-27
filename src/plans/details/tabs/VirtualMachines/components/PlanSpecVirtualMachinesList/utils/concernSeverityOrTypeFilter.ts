import { CustomFilterType } from 'src/components/common/FilterGroup/constants';
import type { SpecVirtualMachinePageData } from 'src/plans/details/tabs/VirtualMachines/components/PlanSpecVirtualMachinesList/utils/types';

import type { FilterDef } from '@components/common/utils/types';
import { getCategoryIcon } from '@components/Concerns/utils/category';
import type { VirtualMachineWithConcerns } from '@components/Concerns/utils/constants';
import type { Concern } from '@forklift-ui/types';
import { t } from '@utils/i18n';

import { createInitialUniqueMaps, getUniqueMapByCategory } from './getUniqueMapByCategory';

export const concernSeverityOrTypeFilter = (): FilterDef => {
  return {
    dynamicFilter: (unknownItems: unknown[]) => {
      const items = unknownItems as SpecVirtualMachinePageData[];

      const result = items.reduce((acc, item) => {
        const concerns: Concern[] = (item?.inventoryVmData?.vm as VirtualMachineWithConcerns)
          ?.concerns;

        const conditions = item?.conditions;

        concerns?.forEach((concern) => {
          const key = concern?.label;
          const map = getUniqueMapByCategory(acc, concern?.category);
          if (!map.has(key)) {
            map.set(key, {
              icon: getCategoryIcon(concern.category),
              id: concern.label,
              label: concern.label,
            });
          }
        });

        conditions?.forEach((condition) => {
          const key = condition?.type;
          const map = getUniqueMapByCategory(acc, condition?.category);
          if (!map.has(key)) {
            map.set(key, {
              icon: getCategoryIcon(condition.category),
              id: condition.type,
              label: condition.type,
            });
          }
        });

        return acc;
      }, createInitialUniqueMaps());

      return {
        values: [
          ...result.critical.values(),
          ...result.warning.values(),
          ...result.information.values(),
        ],
      };
    },
    fieldLabel: t('Concerns (type)'),
    placeholderLabel: t('Filter by concerns (type)'),
    type: CustomFilterType.ConcernsSeverityOrType,
  };
};
