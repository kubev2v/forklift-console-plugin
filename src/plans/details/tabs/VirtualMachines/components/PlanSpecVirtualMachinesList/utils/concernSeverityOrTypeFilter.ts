import {
  ConcernCategory,
  CustomFilterType,
} from 'src/modules/Providers/views/details/tabs/VirtualMachines/constants';
import type { SpecVirtualMachinePageData } from 'src/plans/details/tabs/VirtualMachines/components/PlanSpecVirtualMachinesList/utils/types';

import type { EnumValue, FilterDef } from '@components/common/utils/types';
import { getCategoryIcon, getCategoryLabel } from '@components/Concerns/utils/category';
import type { VirtualMachineWithConcerns } from '@components/Concerns/utils/constants';
import type { Concern } from '@kubev2v/types';
import { t } from '@utils/i18n';

export const concernSeverityOrTypeFilter = (): FilterDef => {
  return {
    dynamicFilter: (unknownItems: unknown[]) => {
      const items = unknownItems as SpecVirtualMachinePageData[];
      const criticalUniqueMap = new Map<string, EnumValue>();
      const warningUniqueMap = new Map<string, EnumValue>();
      const informationUniqueMap = new Map<string, EnumValue>();
      const getUniqueMap = (category: string) => {
        if (getCategoryLabel(category) === ConcernCategory.Critical) return criticalUniqueMap;
        return getCategoryLabel(category) === ConcernCategory.Warning
          ? warningUniqueMap
          : informationUniqueMap;
      };

      items.forEach((item) => {
        const concerns: Concern[] = (item?.inventoryVmData?.vm as VirtualMachineWithConcerns)
          ?.concerns;
        const conditions = item?.conditions;

        concerns?.forEach((concern) => {
          const key = concern?.label;
          if (!getUniqueMap(concern?.category).has(key)) {
            getUniqueMap(concern?.category).set(key, {
              icon: getCategoryIcon(concern.category),
              id: concern?.label,
              label: concern?.label,
            } as EnumValue);
          }
        });

        conditions?.forEach((condition) => {
          const key = condition?.type;
          if (!getUniqueMap(condition?.category).has(key)) {
            getUniqueMap(condition?.category).set(key, {
              icon: getCategoryIcon(condition?.category),
              id: condition?.type,
              label: condition?.type,
            } as EnumValue);
          }
        });
      });
      return {
        values: [
          ...criticalUniqueMap.values(),
          ...warningUniqueMap.values(),
          ...informationUniqueMap.values(),
        ],
      };
    },
    fieldLabel: t('Concerns (type)'),
    placeholderLabel: t('Filter by concerns (type)'),
    type: CustomFilterType.ConcernsSeverityOrType,
  };
};
