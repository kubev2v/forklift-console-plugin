import { JSONPath } from 'jsonpath-plus';

import { DateFilter } from '../Filter/DateFilter';
import { DateRangeFilter } from '../Filter/DateRangeFilter';
import { EnumFilter } from '../Filter/EnumFilter';
import { FreetextFilter } from '../Filter/FreetextFilter';
import { GroupedEnumFilter } from '../Filter/GroupedEnumFilter';
import { SwitchFilter } from '../Filter/SwitchFilter';
import { areSameDayInUTCZero, isInClosedRange } from '../utils/dates';
import type { ResourceField } from '../utils/types';

import type { FilterRenderer, ValueMatcher } from './types';

/**
 * Get the field value of a given field id, using resourceData and resourceFields
 * definition struct.
 *
 * @param resourceData is a struct holding all the data needed to render a resource
 * @param resourceFieldId is the field id, in the resourceFields
 * @param resourceFields the resourceData fields table
 * @returns the value of the fields based on the field jsonPath
 */
export const getResourceFieldValue = <
  T extends Record<string, object | string | ((resourceData: unknown) => unknown)>,
>(
  resourceData: T,
  resourceFieldId: keyof T,
  resourceFields: ResourceField[],
): T[keyof T] | undefined => {
  const field = resourceFields.find(
    (fieldSearched) => fieldSearched.resourceFieldId === resourceFieldId,
  );

  if (!resourceData || typeof resourceData !== 'object' || !field) {
    return undefined;
  }

  if (!field.jsonPath) {
    return resourceData[resourceFieldId];
  }

  if (typeof field.jsonPath === 'string') {
    // eslint-disable-next-line new-cap
    const result: unknown = JSONPath({ json: resourceData, path: field.jsonPath, wrap: false });
    return result as T[keyof T];
  }

  if (typeof field.jsonPath === 'function') {
    return field.jsonPath(resourceData) as T[keyof T];
  }

  return undefined;
};

/**
 * Create matcher for one filter type.
 * Features:
 * 1) fields that use different filter type are skipped
 * 2) positive match if there are no selected filter values or no fields support the chosen filter type (vacuous truth)
 * 3) all fields need to pass the test (AND condition)
 * 4) a field is accepted if at least one filter value returns positive match (OR condition)
 */
export const createMatcher =
  ({
    filterType,
    matchValue,
    resourceFields,
    selectedFilters,
  }: {
    selectedFilters: Record<string, string[]>;
    filterType: string;
    matchValue: (value: unknown) => (filterValue: string) => boolean;
    resourceFields: ResourceField[];
  }) =>
  (resourceData: unknown): boolean =>
    resourceFields
      .filter(({ filter }) => filter?.type === filterType)
      .filter(
        ({ filter, resourceFieldId }) =>
          (resourceFieldId && selectedFilters[resourceFieldId]?.length) ?? filter?.defaultValues,
      )
      .map(({ filter, resourceFieldId }) => ({
        filters:
          resourceFieldId && selectedFilters[resourceFieldId]?.length
            ? selectedFilters[resourceFieldId]
            : filter?.defaultValues,
        value: getResourceFieldValue(resourceData, resourceFieldId, resourceFields),
      }))
      .map(({ filters, value }) => filters.some(matchValue(value)))
      .every(Boolean);

/**
 * The value is accepted if it contains the trimmed filter as substring.
 */
export const freetextMatcher = {
  filterType: 'freetext',
  matchValue: (value: string) => (filter: string) =>
    value?.toLowerCase()?.includes(filter?.toLowerCase()?.trim()),
};

/**
 * The value is accepted if it matches exactly the filter (both are constants)
 */
const enumMatcher = {
  filterType: 'enum',
  matchValue: (value: string) => (filter: string) => value === filter,
};

const searchableEnumMatcher = {
  filterType: 'searchableEnum',
  matchValue: enumMatcher.matchValue,
};

const groupedEnumMatcher = {
  filterType: 'groupedEnum',
  matchValue: enumMatcher.matchValue,
};

const searchableGroupedEnumMatcher = {
  filterType: 'searchableGroupedEnum',
  matchValue: enumMatcher.matchValue,
};

const dateMatcher = {
  filterType: 'date',
  matchValue: (value: string) => (filter: string) => areSameDayInUTCZero(value, filter),
};

const dateRangeMatcher = {
  filterType: 'dateRange',
  matchValue: (value: string) => (filter: string) => isInClosedRange(filter, value),
};

const sliderMatcher = {
  filterType: 'slider',
  matchValue: (value: string) => (filter: string) => Boolean(value).toString() === filter || !value,
};

export const defaultValueMatchers: ValueMatcher[] = [
  freetextMatcher,
  enumMatcher,
  searchableEnumMatcher,
  groupedEnumMatcher,
  searchableGroupedEnumMatcher,
  sliderMatcher,
  dateMatcher,
  dateRangeMatcher,
];

export const defaultSupportedFilters: Record<string, FilterRenderer> = {
  date: DateFilter,
  dateRange: DateRangeFilter,
  enum: EnumFilter,
  freetext: FreetextFilter,
  groupedEnum: GroupedEnumFilter,
  slider: SwitchFilter,
};

/**
 * Create matcher for multiple filter types.
 * Positive match requires that all sub-matchers (per filter type) return positive result (AND condition).
 * No filter values or no filter types also yields a positive result(vacuous truth).
 *
 * @see createMatcher
 */
export const createMetaMatcher =
  (
    selectedFilters: Record<string, string[]>,
    resourceFields: ResourceField[],
    valueMatchers: ValueMatcher[] = defaultValueMatchers,
  ) =>
  (resourceData: unknown): boolean =>
    valueMatchers
      .map(({ filterType, matchValue }) =>
        createMatcher({ filterType, matchValue, resourceFields, selectedFilters }),
      )
      .map((match) => match(resourceData))
      .every(Boolean);
