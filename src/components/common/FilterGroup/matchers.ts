import jsonpath from 'jsonpath';

import {
  DateFilter,
  DateRangeFilter,
  EnumFilter,
  FreetextFilter,
  GroupedEnumFilter,
  SwitchFilter,
} from '../Filter';
import { areSameDayInUTCZero, isInClosedRange, type ResourceField } from '../utils';

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
export const getResourceFieldValue = (
  resourceData: unknown,
  resourceFieldId: string,
  resourceFields: ResourceField[],
) => {
  const field = resourceFields.find((f) => f.resourceFieldId === resourceFieldId);
  if (typeof resourceData !== 'object' || !field) {
    return undefined;
  }

  if (!field.jsonPath) {
    return resourceData?.[resourceFieldId];
  }

  switch (typeof field.jsonPath) {
    case 'string':
      return jsonpath.query(resourceData, field.jsonPath)?.[0];
    case 'function':
      return field.jsonPath(resourceData);
    default:
      return undefined;
  }
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
  (resourceData): boolean =>
    resourceFields
      .filter(({ filter }) => filter?.type === filterType)
      .filter(
        ({ filter, resourceFieldId }) =>
          selectedFilters[resourceFieldId]?.length || filter?.defaultValues,
      )
      .map(({ filter, resourceFieldId }) => ({
        filters: selectedFilters[resourceFieldId]?.length
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
  matchValue: (value: string) => (filter: string) => value?.includes(filter?.trim()),
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
  (resourceData): boolean =>
    valueMatchers
      .map(({ filterType, matchValue }) =>
        createMatcher({ filterType, matchValue, resourceFields, selectedFilters }),
      )
      .map((match) => match(resourceData))
      .every(Boolean);
