import { EnumFilter } from '@components/common/Filter/EnumFilter';
import { GroupedEnumFilter } from '@components/common/Filter/GroupedEnumFilter';
import type { ValueMatcher } from '@components/common/FilterGroup/types';
import type { Concern } from '@kubev2v/types';

import { CustomFilterType } from '../constants';

export const extraSupportedMatchers: ValueMatcher[] = [
  {
    filterType: CustomFilterType.CriticalConcerns,
    matchValue: (concerns: Concern[]) => (filter) =>
      Array.isArray(concerns) && concerns.some(({ label }) => label === filter),
  },
  {
    filterType: CustomFilterType.Concerns,
    matchValue: (concerns: Concern[]) => (filter) =>
      Array.isArray(concerns) &&
      concerns.some(({ category, label }) => category === filter || label === filter),
  },
  {
    filterType: CustomFilterType.Host,
    matchValue: (value: string) => (filter) => value === filter,
  },
  {
    filterType: CustomFilterType.Features,
    matchValue: (features: Record<string, boolean>) => (filter) => Boolean(features?.[filter]),
  },
];

export const extraSupportedFilters = {
  [CustomFilterType.Concerns]: GroupedEnumFilter,
  [CustomFilterType.CriticalConcerns]: EnumFilter,
  [CustomFilterType.Features]: EnumFilter,
  [CustomFilterType.Host]: EnumFilter,
};
