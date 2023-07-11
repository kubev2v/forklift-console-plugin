import { useMemo, useState } from 'react';

import { ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base';

import { localeCompare, ResourceField } from '../../utils';
import { getResourceFieldValue } from '../FilterGroup';

import { SortType } from './types';

/**
 * Compares all types by converting them to string.
 * Nullish entities are converted to empty string.
 * @see localeCompare
 * @param locale to be used by string compareFn
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const universalComparator = (a: any, b: any, locale: string) => {
  return localeCompare(String(a ?? ''), String(b ?? ''), locale);
};

/**
 * Creates a compareFn function based on provided current sort definition.
 * If there is no sort defined then compareFn considers all entities equal.
 *
 * @see universalComparator
 * @param currentSort
 * @param locale defaults to "en"
 * @param fieldComparator (optional) custom field compareFn. Defaults to universal string based compareFn.
 * @returns compareFn function
 */
export function compareWith(
  currentSort: SortType,
  locale: string,
  fieldComparator: (a, b, locale: string) => number,
  fields: ResourceField[],
): (a, b) => number {
  return (a, b) => {
    if (!currentSort?.resourceFieldId) {
      return 0;
    }
    const compareFn = fieldComparator ?? universalComparator;
    const compareValue = compareFn(
      getResourceFieldValue(a, currentSort.resourceFieldId, fields),
      getResourceFieldValue(b, currentSort.resourceFieldId, fields),
      locale ?? 'en',
    );
    return currentSort.isAsc ? compareValue : -compareValue;
  };
}

/**
 * Hook for maintaining sort state. Supported features:
 * 1) by default sort by the first identity column or by the first column available if there is no identity column
 * 2) build compareFn based on the current active sort definition
 *
 * @param fields (read only) field metadata
 * @returns [activeSort, setActiveSort, compareFn]
 */
export const useSort = (
  fields: ResourceField[],
  resolvedLanguage = 'en',
): [SortType, (sort: SortType) => void, (a, b) => number] => {
  // by default sort by the first identity column (if any)
  const [firstField] = [...fields].sort(
    (a, b) => Number(Boolean(b.isIdentity)) - Number(Boolean(a.isIdentity)),
  );

  const [activeSort, setActiveSort] = useState<SortType>({
    // when no other order is define, default to ascending order
    isAsc: true,
    resourceFieldId: firstField?.resourceFieldId,
    label: firstField?.label,
  });

  const compareFn = useMemo(
    () =>
      compareWith(
        activeSort,
        resolvedLanguage,
        fields.find((field) => field.resourceFieldId === activeSort.resourceFieldId)?.compareFn,
        fields,
      ),
    [fields, activeSort],
  );

  return [activeSort, setActiveSort, compareFn];
};

/**
 * Builds table specific sort definition based on provided active sort definition.
 * @see ThSortType
 */
export const buildSort = ({
  columnIndex,
  resourceFields,
  activeSort,
  setActiveSort,
}: {
  columnIndex: number;
  resourceFields: ResourceField[];
  activeSort: SortType;
  setActiveSort: (sort: SortType) => void;
}): ThSortType => ({
  sortBy: {
    index:
      resourceFields.find(
        ({ resourceFieldId }) => resourceFieldId === activeSort.resourceFieldId,
      ) &&
      resourceFields.findIndex(
        ({ resourceFieldId }) => resourceFieldId === activeSort.resourceFieldId,
      ),
    direction: activeSort.isAsc ? 'asc' : 'desc',
  },
  onSort: (_event, index, direction) => {
    resourceFields[index]?.resourceFieldId &&
      setActiveSort({
        isAsc: direction === 'asc',
        ...resourceFields[index],
      });
  },
  columnIndex,
});
