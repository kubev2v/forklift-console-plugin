import type { SpecVirtualMachinePageData } from 'src/plans/details/tabs/VirtualMachines/components/PlanSpecVirtualMachinesList/utils/types';

import { EnumFilter } from '@components/common/Filter/EnumFilter';
import { GroupedEnumFilter } from '@components/common/Filter/GroupedEnumFilter';
import type { ValueMatcher } from '@components/common/FilterGroup/types';
import { getCategoryLabel } from '@components/Concerns/utils/category';
import type { VirtualMachineWithConcerns } from '@components/Concerns/utils/constants';
import type { Concern } from '@kubev2v/types';

import { CustomFilterType } from '../constants';

import type { VmData } from './VMCellProps';

export const extraSupportedMatchers: ValueMatcher[] = [
  {
    filterType: CustomFilterType.CriticalConcerns,
    matchValue: (value: unknown) => (filter: string) =>
      Array.isArray(value) && value.some(({ label }) => label === filter),
  },
  {
    filterType: CustomFilterType.Concerns,
    matchValue: (value: unknown) => (filter: string) =>
      Array.isArray(value) &&
      value.some(({ category, label }) => category === filter || label === filter),
  },
  {
    filterType: CustomFilterType.ConcernsSeverityOrType,
    matchValue: (value: unknown) => (filter: string) => {
      const vm =
        (value as VmData)?.vm ?? (value as SpecVirtualMachinePageData)?.inventoryVmData?.vm;
      const concerns: Concern[] = (vm as VirtualMachineWithConcerns)?.concerns;
      const conditions = (value as SpecVirtualMachinePageData)?.conditions;

      const isConcernsFit =
        Array.isArray(concerns) &&
        concerns.some(({ category, label }) => category === filter || label === filter);

      const isConditionsFit =
        Array.isArray(conditions) &&
        conditions.some(
          ({ category, type }) => getCategoryLabel(category) === filter || type === filter,
        );
      return isConcernsFit || isConditionsFit;
    },
  },

  {
    filterType: CustomFilterType.Host,
    matchValue: (value: unknown) => (filter: string) => value === filter,
  },
  {
    filterType: CustomFilterType.Features,
    matchValue: (value: unknown) => (filter: string) => {
      if (!value || typeof value !== 'object') return false;
      const features = value as Record<string, boolean>;
      return Boolean(features?.[filter]);
    },
  },
];

export const extraSupportedFilters = {
  [CustomFilterType.Concerns]: GroupedEnumFilter,
  [CustomFilterType.ConcernsSeverityOrType]: EnumFilter,
  [CustomFilterType.CriticalConcerns]: EnumFilter,
  [CustomFilterType.Features]: EnumFilter,
  [CustomFilterType.Host]: EnumFilter,
};
