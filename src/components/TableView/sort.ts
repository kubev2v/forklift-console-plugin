import { useMemo, useState } from 'react';
import { useTranslation } from 'src/internal/i18n';
import { localeCompare } from 'src/utils/helpers';

import { ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base';

import { Field, SortType } from '../types';

import { Column } from './types';

/**
 * Compares all types by converting them to string.
 * Nullish entities are converted to empty string.
 * @see localeCompare
 * @param locale to be used by string comparator
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const universalComparator = (a: any, b: any, locale: string) =>
  localeCompare(String(a ?? ''), String(b ?? ''), locale);

/**
 * Creates a comparator function based on provided current sort definition.
 * If there is no sort defined then comparator considers all entities equal.
 *
 * @see universalComparator
 * @param currentSort
 * @param locale defaults to "en"
 * @param fieldComparator (optional) custom field comparator. Defaults to universal string based comparator.
 * @returns comparator function
 */
export function compareWith(
  currentSort: SortType,
  locale: string,
  fieldComparator: (a, b, locale: string) => number,
): (a, b) => number {
  return (a, b) => {
    if (!currentSort?.id) {
      return 0;
    }
    const comparator = fieldComparator ?? universalComparator;
    const compareValue = comparator(a?.[currentSort.id], b?.[currentSort.id], locale ?? 'en');
    return currentSort.isAsc ? compareValue : -compareValue;
  };
}

/**
 * Hook for maintaining sort state. Supported features:
 * 1) by default sort by the first identity column or by the first column available if there is no identity column
 * 2) build comparator based on the current active sort definition
 *
 * @param fields (read only) field metadata
 * @returns [activeSort, setActiveSort, comparator]
 */
export const useSort = (
  fields: Field[],
): [SortType, (sort: SortType) => void, (a, b) => number] => {
  const { i18n } = useTranslation();

  // by default sort by the first identity column (if any)
  const [firstField] = [...fields].sort(
    (a, b) => Number(Boolean(b.isIdentity)) - Number(Boolean(a.isIdentity)),
  );

  const [activeSort, setActiveSort] = useState<SortType>({
    isAsc: false,
    id: firstField?.id,
    toLabel: firstField?.toLabel,
  });

  const comparator = useMemo(
    () =>
      compareWith(
        activeSort,
        i18n.resolvedLanguage,
        fields.find((field) => field.id === activeSort.id)?.comparator,
      ),
    [fields],
  );

  return [activeSort, setActiveSort, comparator];
};

/**
 * Builds table specific sort definition based on provided active sort definition.
 * @see ThSortType
 */
export const buildSort = ({
  columnIndex,
  columns,
  activeSort,
  setActiveSort,
}: {
  columnIndex: number;
  columns: Column[];
  activeSort: SortType;
  setActiveSort: (sort: SortType) => void;
}): ThSortType => ({
  sortBy: {
    index:
      columns.find(({ id }) => id === activeSort.id) &&
      columns.findIndex(({ id }) => id === activeSort.id),
    direction: activeSort.isAsc ? 'asc' : 'desc',
  },
  onSort: (_event, index, direction) => {
    columns[index]?.id &&
      setActiveSort({
        isAsc: direction === 'asc',
        ...columns[index],
      });
  },
  columnIndex,
});
