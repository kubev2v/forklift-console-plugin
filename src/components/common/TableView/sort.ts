import { useMemo, useState } from 'react';

import { SortByDirection, type ThProps } from '@patternfly/react-table';

import { getResourceFieldValue } from '../FilterGroup/matchers';
import { localeCompare } from '../utils/localCompare';
import type { ResourceField, SortDirection } from '../utils/types';

import type { SortType } from './types';

const toSortKey = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return JSON.stringify(value) ?? '';
};

/**
 * Compares all types by converting them to string.
 * Nullish entities are converted to empty string.
 * @see localeCompare
 * @param a
 * @param b
 * @param locale to be used by string compareFn
 */
export const universalComparator = (a: unknown, b: unknown, locale: string): number => {
  return localeCompare(toSortKey(a), toSortKey(b), locale);
};

/**
 * Creates a compareFn function based on provided current sort definition.
 * If there is no sort defined then compareFn considers all entities equal.
 *
 * @see universalComparator
 * @param currentSort
 * @param locale defaults to "en"
 * @param fieldComparator (optional) custom field compareFn. Defaults to universal string based compareFn.
 * @param fields
 * @returns compareFn function
 */
export const compareWith = <
  T extends Record<string, object | string | boolean | ((resourceData: T) => unknown)>,
>(
  currentSort: SortType,
  locale: string | undefined,
  fieldComparator: ((a: string, b: string, locale: string) => number) | undefined,
  fields: ResourceField[],
): ((a?: T | null, b?: T | null) => number) => {
  return (a, b) => {
    if (!currentSort?.resourceFieldId) {
      return 0;
    }
    const compareFn = fieldComparator ?? universalComparator;
    const compareValue = compareFn(
      String(getResourceFieldValue<T>(a, currentSort.resourceFieldId, fields, true) ?? ''),
      String(getResourceFieldValue<T>(b, currentSort.resourceFieldId, fields, true) ?? ''),
      locale ?? 'en',
    );
    return currentSort.isAsc ? compareValue : -compareValue;
  };
};

/**
 * Hook for maintaining sort state. Supported features:
 * 1) by default sort by the first identity column or by the first column available if there is no identity column
 * 2) build compareFn based on the current active sort definition
 *
 * @param fields (read only) field metadata
 * @param resolvedLanguage
 * @param defaultSort
 * @returns [activeSort, setActiveSort, compareFn]
 */
export const useSort = (
  fields: ResourceField[],
  resolvedLanguage = 'en',
  defaultSort?: { direction: SortDirection; resourceFieldId: string },
): [SortType, (sort: SortType) => void, (a: unknown, b: unknown) => number] => {
  // by default sort by the first identity column (if any)
  const [firstField] = [...fields].sort(
    (a, b) => Number(Boolean(b.isIdentity)) - Number(Boolean(a.isIdentity)),
  );

  const [activeSort, setActiveSort] = useState<SortType>(() => {
    if (defaultSort) {
      const field = fields.find((fld) => fld.resourceFieldId === defaultSort.resourceFieldId);
      return {
        isAsc: defaultSort.direction === 'asc',
        label: field?.label ?? undefined,
        resourceFieldId: defaultSort.resourceFieldId ?? '',
      };
    }
    return {
      isAsc: true,
      label: firstField?.label ?? undefined,
      resourceFieldId: firstField?.resourceFieldId ?? '',
    };
  });

  const compareFn = useMemo(
    () =>
      compareWith(
        activeSort,
        resolvedLanguage,
        fields.find((field) => field.resourceFieldId === activeSort.resourceFieldId)?.compareFn,
        fields,
      ),
    [activeSort, resolvedLanguage, fields],
  );

  return [activeSort, setActiveSort, compareFn as (a: unknown, b: unknown) => number];
};

/**
 * Builds table specific sort definition based on provided active sort definition.
 */
export const buildSort = ({
  activeSort,
  columnIndex,
  resourceFields,
  setActiveSort,
}: {
  activeSort: SortType;
  columnIndex: number;
  resourceFields: ResourceField[];
  setActiveSort: (sort: SortType) => void;
}): ThProps['sort'] => ({
  columnIndex,
  onSort: (_event, index, direction): void => {
    const { label, resourceFieldId } = resourceFields[index] ?? {};
    if (resourceFieldId) {
      setActiveSort({
        isAsc: direction === SortByDirection.asc,
        ...resourceFields[index],
        label: label ?? '',
        resourceFieldId,
      });
    }
  },
  sortBy: {
    direction: activeSort.isAsc ? 'asc' : 'desc',
    index:
      resourceFields.find(
        ({ resourceFieldId }) => resourceFieldId === activeSort.resourceFieldId,
      ) &&
      resourceFields.findIndex(
        ({ resourceFieldId }) => resourceFieldId === activeSort.resourceFieldId,
      ),
  },
});
