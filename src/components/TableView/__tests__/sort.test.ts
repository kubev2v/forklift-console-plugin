import { NAME, NAMESPACE } from 'src/utils/constants';

import { SortByDirection } from '@patternfly/react-table';

import { buildSort, compareWith, universalComparator } from '../sort';

describe('universal comparator', () => {
  it('works for nullish data', () => {
    expect(universalComparator(null, undefined, 'en')).toBe(0);
  });
  it('uses numeric option', () => {
    expect(universalComparator('a10', 'a5', 'en')).toBeGreaterThan(0);
  });
});

describe('compareWith comparator factory', () => {
  it('works without custom comparator', () => {
    expect(
      compareWith(
        { id: NAME, isAsc: true, toLabel: () => NAME },
        'en',
        undefined,
      )({ name: 'name_a' }, { name: 'name_b' }),
    ).toBeLessThan(0);
  });

  it('works for nullish entities', () => {
    expect(
      compareWith({ id: NAME, isAsc: true, toLabel: () => NAME }, 'en', undefined)(null, undefined),
    ).toBe(0);
  });

  it('treats all values equal if sortType is not defined', () => {
    expect(
      compareWith({ id: undefined, isAsc: false, toLabel: undefined }, 'en', undefined)('a', 'b'),
    ).toBe(0);
  });

  it('reverts sorting order based on sortType.isAsc', () => {
    expect(
      compareWith(
        { id: NAME, isAsc: false, toLabel: () => NAME },
        'en',
        undefined,
      )({ name: 'name_a' }, { name: 'name_b' }),
    ).toBeGreaterThan(0);
  });

  it('uses custom field comparator if provided', () => {
    expect(
      compareWith(
        { id: NAME, isAsc: true, toLabel: () => NAME },
        'en',
        (a, b) => a.localeCompare(b), // no numeric
      )({ name: 'a10' }, { name: 'a5' }),
    ).toBeLessThan(0);
  });
});

describe('buildSort factory', () => {
  const NameColumn = { id: NAME, toLabel: () => NAME };
  const NamespaceColumn = { id: NAMESPACE, toLabel: () => NAMESPACE };
  it('sorts ascending', () => {
    const setActiveSort = jest.fn();
    const { sortBy, onSort, columnIndex } = buildSort({
      columnIndex: 0,
      columns: [NameColumn, NamespaceColumn],
      activeSort: {
        id: NAME,
        isAsc: true,
        toLabel: () => NAME,
      },
      setActiveSort,
    });
    expect(columnIndex).toBe(0);
    expect(sortBy).toStrictEqual({ index: 0, direction: 'asc' });
    onSort(undefined, 1, SortByDirection.asc, undefined);
    expect(setActiveSort).toBeCalledWith({
      isAsc: true,
      id: NAMESPACE,
      toLabel: NamespaceColumn.toLabel,
    });
  });

  it('sorts descending', () => {
    const setActiveSort = jest.fn();
    const { sortBy, onSort, columnIndex } = buildSort({
      columnIndex: 1,
      columns: [NameColumn, NamespaceColumn],
      activeSort: {
        id: NAME,
        isAsc: false,
        toLabel: () => NAME,
      },
      setActiveSort,
    });
    expect(columnIndex).toBe(1);
    expect(sortBy).toStrictEqual({ index: 0, direction: 'desc' });
    onSort(undefined, 1, SortByDirection.desc, undefined);
    expect(setActiveSort).toBeCalledWith({
      isAsc: false,
      id: NAMESPACE,
      toLabel: NamespaceColumn.toLabel,
    });
  });

  it('shows no sorting if activeSort column cannot be found', () => {
    const setActiveSort = jest.fn();
    const { sortBy } = buildSort({
      columnIndex: 1,
      columns: [NameColumn, NamespaceColumn],
      activeSort: {
        id: undefined,
        isAsc: undefined,
        toLabel: undefined,
      },
      setActiveSort,
    });
    expect(sortBy).toStrictEqual({ index: undefined, direction: 'desc' });
  });

  it('skips sort callbeck if column cannot be found', () => {
    const setActiveSort = jest.fn();
    const { onSort } = buildSort({
      columnIndex: 1,
      columns: [NameColumn, NamespaceColumn],
      activeSort: {
        id: NAME,
        isAsc: false,
        toLabel: () => NAME,
      },
      setActiveSort,
    });
    onSort(undefined, 100, SortByDirection.desc, undefined);
    expect(setActiveSort).toBeCalledTimes(0);
  });
});
