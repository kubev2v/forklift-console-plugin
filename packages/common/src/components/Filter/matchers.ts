import jsonpath from 'jsonpath';

import { Field } from '../types';

import { ValueMatcher } from './types';

/**
 * Get a value for a data field based on the table fields
 * and the row data.
 *
 * @param entity is the row data stuct
 * @param id is the field id, in the fields table
 * @param fields the fields table
 * @returns the value of the fields based on the field jsonPath
 */
export const getFieldValue = (entity: unknown, id: string, fields: Field[]) => {
  const field = fields.find((f) => f.id === id);
  if (typeof entity !== 'object' || !field) {
    return undefined;
  }

  if (!field.jsonPath) {
    return entity?.[id];
  }

  switch (typeof field.jsonPath) {
    case 'string':
      return jsonpath.query(entity, field.jsonPath);
    case 'function':
      return field.jsonPath(entity);
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
    fields,
  }: {
    selectedFilters: { [id: string]: string[] };
    filterType: string;
    matchValue: (value: unknown) => (filterValue: string) => boolean;
    fields: Field[];
  }) =>
  (entity): boolean =>
    fields
      .filter(({ filter }) => filter?.type === filterType)
      .filter(
        ({ id, filter }) =>
          (selectedFilters[id] && selectedFilters[id]?.length) || filter?.defaultValues,
      )
      .map(({ id, filter }) => ({
        value: getFieldValue(entity, id, fields),
        filters: selectedFilters[id]?.length ? selectedFilters[id] : filter?.defaultValues,
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
    fields: Field[],
    valueMatchers: ValueMatcher[] = defaultValueMatchers,
  ) =>
  (entity): boolean =>
    valueMatchers
      .map(({ filterType, matchValue }) =>
        createMatcher({ selectedFilters, filterType, matchValue, fields }),
      )
      .map((match) => match(entity))
      .every(Boolean);
