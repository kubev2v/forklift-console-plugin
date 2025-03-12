import { SortByDirection } from '@patternfly/react-table';

import { NAME, NAMESPACE } from '../../../utils';
import { buildSort, compareWith, universalComparator } from '../sort';

describe('universal compareFn', () => {
  it('works for nullish data', () => {
    expect(universalComparator(null, undefined, 'en')).toBe(0);
  });
  it('uses numeric option', () => {
    expect(universalComparator('a10', 'a5', 'en')).toBeGreaterThan(0);
  });
});

describe('compareWith compareFn factory', () => {
  it('works without custom compareFn', () => {
    expect(
      compareWith({ resourceFieldId: NAME, isAsc: true, label: NAME }, 'en', undefined, [
        {
          resourceFieldId: NAME,
          label: NAME,
        },
      ])({ name: 'name_a' }, { name: 'name_b' }),
    ).toBeLessThan(0);
  });

  it('works for nullish entities', () => {
    expect(
      compareWith({ resourceFieldId: NAME, isAsc: true, label: NAME }, 'en', undefined, [
        {
          resourceFieldId: NAME,
          label: NAME,
        },
      ])(null, undefined),
    ).toBe(0);
  });

  it('treats all values equal if sortType is not defined', () => {
    expect(
      compareWith({ resourceFieldId: undefined, isAsc: false, label: undefined }, 'en', undefined, [
        {
          resourceFieldId: NAME,
          label: NAME,
        },
      ])('a', 'b'),
    ).toBe(0);
  });

  it('reverts sorting order based on sortType.isAsc', () => {
    expect(
      compareWith({ resourceFieldId: NAME, isAsc: false, label: NAME }, 'en', undefined, [
        {
          resourceFieldId: NAME,
          label: NAME,
        },
      ])({ name: 'name_a' }, { name: 'name_b' }),
    ).toBeGreaterThan(0);
  });

  it('uses custom field compareFn if provided', () => {
    expect(
      compareWith(
        { resourceFieldId: NAME, isAsc: true, label: NAME },
        'en',
        (a, b) => a.localeCompare(b), // no numeric
        [
          {
            resourceFieldId: NAME,
            label: NAME,
          },
        ],
      )({ name: 'a10' }, { name: 'a5' }),
    ).toBeLessThan(0);
  });
});

describe('buildSort factory', () => {
  const NameColumn = { resourceFieldId: NAME, label: NAME };
  const NamespaceColumn = { resourceFieldId: NAMESPACE, label: NAMESPACE };
  it('sorts ascending', () => {
    const setActiveSort = jest.fn();
    const { sortBy, onSort, columnIndex } = buildSort({
      columnIndex: 0,
      resourceFields: [NameColumn, NamespaceColumn],
      activeSort: {
        resourceFieldId: NAME,
        isAsc: true,
        label: NAME,
      },
      setActiveSort,
    });
    expect(columnIndex).toBe(0);
    expect(sortBy).toStrictEqual({ index: 0, direction: 'asc' });
    onSort(undefined, 1, SortByDirection.asc, undefined);
    expect(setActiveSort).toBeCalledWith({
      isAsc: true,
      resourceFieldId: NAMESPACE,
      label: NamespaceColumn.label,
    });
  });

  it('sorts descending', () => {
    const setActiveSort = jest.fn();
    const { sortBy, onSort, columnIndex } = buildSort({
      columnIndex: 1,
      resourceFields: [NameColumn, NamespaceColumn],
      activeSort: {
        resourceFieldId: NAME,
        isAsc: false,
        label: NAME,
      },
      setActiveSort,
    });
    expect(columnIndex).toBe(1);
    expect(sortBy).toStrictEqual({ index: 0, direction: 'desc' });
    onSort(undefined, 1, SortByDirection.desc, undefined);
    expect(setActiveSort).toBeCalledWith({
      isAsc: false,
      resourceFieldId: NAMESPACE,
      label: NamespaceColumn.label,
    });
  });

  it('shows no sorting if activeSort column cannot be found', () => {
    const setActiveSort = jest.fn();
    const { sortBy } = buildSort({
      columnIndex: 1,
      resourceFields: [NameColumn, NamespaceColumn],
      activeSort: {
        resourceFieldId: undefined,
        isAsc: undefined,
        label: undefined,
      },
      setActiveSort,
    });
    expect(sortBy).toStrictEqual({ index: undefined, direction: 'desc' });
  });

  it('skips sort callback if column cannot be found', () => {
    const setActiveSort = jest.fn();
    const { onSort } = buildSort({
      columnIndex: 1,
      resourceFields: [NameColumn, NamespaceColumn],
      activeSort: {
        resourceFieldId: NAME,
        isAsc: false,
        label: NAME,
      },
      setActiveSort,
    });
    onSort(undefined, 100, SortByDirection.desc, undefined);
    expect(setActiveSort).toBeCalledTimes(0);
  });
});
