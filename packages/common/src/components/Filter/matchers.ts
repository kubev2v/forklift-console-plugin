import jsonpath from 'jsonpath';

import { ResourceField } from '../types';

import { ValueMatcher } from './types';

/**
 * Get the field value of a given field id, using resourceData and resourceFields
 * definition struct.
 *
 * @param resourceData is a struct holding all the data needed to render a resource
 * @param resourceFieldID is the field id, in the resourceFields
 * @param resourceFields the resourceData fields table
 * @returns the value of the fields based on the field jsonPath
 */
export const getResourceFieldValue = (
  resourceData: unknown,
  resourceFieldID: string,
  resourceFields: ResourceField[],
) => {
  const field = resourceFields.find((f) => f.resourceFieldID === resourceFieldID);
  if (typeof resourceData !== 'object' || !field) {
    return undefined;
  }

  if (!field.jsonPath) {
    return resourceData?.[resourceFieldID];
  }

  switch (typeof field.jsonPath) {
    case 'string':
      return jsonpath.query(resourceData, field.jsonPath);
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
 * 4) a field is accepted if at least one filter value returns positive match (OR condtion)
 */
export const createMatcher =
  ({
    selectedFilters,
    filterType,
    matchValue,
    resourceFields,
  }: {
    selectedFilters: { [id: string]: string[] };
    filterType: string;
    matchValue: (value: unknown) => (filterValue: string) => boolean;
    resourceFields: ResourceField[];
  }) =>
  (resourceData): boolean =>
    resourceFields
      .filter(({ filter }) => filter?.type === filterType)
      .filter(
        ({ resourceFieldID, filter }) =>
          (selectedFilters[resourceFieldID] && selectedFilters[resourceFieldID]?.length) ||
          filter?.defaultValues,
      )
      .map(({ resourceFieldID, filter }) => ({
        value: getResourceFieldValue(resourceData, resourceFieldID, resourceFields),
        filters: selectedFilters[resourceFieldID]?.length
          ? selectedFilters[resourceFieldID]
          : filter?.defaultValues,
      }))
      .map(({ value, filters }) => filters.some(matchValue(value)))
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

const groupedEnumMatcher = {
  filterType: 'groupedEnum',
  matchValue: enumMatcher.matchValue,
};

const sliderMatcher = {
  filterType: 'slider',
  matchValue: (value: string) => (filter: string) => Boolean(value).toString() === filter || !value,
};

export const defaultValueMatchers: ValueMatcher[] = [
  freetextMatcher,
  enumMatcher,
  groupedEnumMatcher,
  sliderMatcher,
];

/**
 * Create matcher for multiple filter types.
 * Positive match requires that all sub-matchers (per filter type) return positve result (AND condtion).
 * No filter values or no filter types also yields a positve result(vacuous truth).
 *
 * @see createMatcher
 */
export const createMetaMatcher =
  (
    selectedFilters: { [id: string]: string[] },
    resourceFields: ResourceField[],
    valueMatchers: ValueMatcher[] = defaultValueMatchers,
  ) =>
  (resourceData): boolean =>
    valueMatchers
      .map(({ filterType, matchValue }) =>
        createMatcher({ selectedFilters, filterType, matchValue, resourceFields }),
      )
      .map((match) => match(resourceData))
      .every(Boolean);
