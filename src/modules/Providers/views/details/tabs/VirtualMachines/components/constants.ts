import { EnumFilter } from '@components/common/Filter/EnumFilter';
import { GroupedEnumFilter } from '@components/common/Filter/GroupedEnumFilter';
import type { ValueMatcher } from '@components/common/FilterGroup/types';

import { CustomFilterType } from '../constants';

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
  [CustomFilterType.CriticalConcerns]: EnumFilter,
  [CustomFilterType.Features]: EnumFilter,
  [CustomFilterType.Host]: EnumFilter,
};
