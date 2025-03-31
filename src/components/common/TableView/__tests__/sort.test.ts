import { SortByDirection } from '@patternfly/react-table';

import { NAME, NAMESPACE } from '../../utils';
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
      compareWith({ isAsc: true, label: NAME, resourceFieldId: NAME }, 'en', undefined, [
        {
          label: NAME,
          resourceFieldId: NAME,
        },
      ])({ name: 'name_a' }, { name: 'name_b' }),
    ).toBeLessThan(0);
  });

  it('works for nullish entities', () => {
    expect(
      compareWith({ isAsc: true, label: NAME, resourceFieldId: NAME }, 'en', undefined, [
        {
          label: NAME,
          resourceFieldId: NAME,
        },
      ])(null, undefined),
    ).toBe(0);
  });

  it('treats all values equal if sortType is not defined', () => {
    expect(
      compareWith({ isAsc: false, label: undefined, resourceFieldId: undefined }, 'en', undefined, [
        {
          label: NAME,
          resourceFieldId: NAME,
        },
      ])('a', 'b'),
    ).toBe(0);
  });

  it('reverts sorting order based on sortType.isAsc', () => {
    expect(
      compareWith({ isAsc: false, label: NAME, resourceFieldId: NAME }, 'en', undefined, [
        {
          label: NAME,
          resourceFieldId: NAME,
        },
      ])({ name: 'name_a' }, { name: 'name_b' }),
    ).toBeGreaterThan(0);
  });

  it('uses custom field compareFn if provided', () => {
    expect(
      compareWith(
        { isAsc: true, label: NAME, resourceFieldId: NAME },
        'en',
        (a, b) => a.localeCompare(b), // no numeric
        [
          {
            label: NAME,
            resourceFieldId: NAME,
          },
        ],
      )({ name: 'a10' }, { name: 'a5' }),
    ).toBeLessThan(0);
  });
});

describe('buildSort factory', () => {
  const NameColumn = { label: NAME, resourceFieldId: NAME };
  const NamespaceColumn = { label: NAMESPACE, resourceFieldId: NAMESPACE };
  it('sorts ascending', () => {
    const setActiveSort = jest.fn();
    const { columnIndex, onSort, sortBy } = buildSort({
      activeSort: {
        isAsc: true,
        label: NAME,
        resourceFieldId: NAME,
      },
      columnIndex: 0,
      resourceFields: [NameColumn, NamespaceColumn],
      setActiveSort,
    });
    expect(columnIndex).toBe(0);
    expect(sortBy).toStrictEqual({ direction: 'asc', index: 0 });
    onSort(undefined, 1, SortByDirection.asc, undefined);
    expect(setActiveSort).toBeCalledWith({
      isAsc: true,
      label: NamespaceColumn.label,
      resourceFieldId: NAMESPACE,
    });
  });

  it('sorts descending', () => {
    const setActiveSort = jest.fn();
    const { columnIndex, onSort, sortBy } = buildSort({
      activeSort: {
        isAsc: false,
        label: NAME,
        resourceFieldId: NAME,
      },
      columnIndex: 1,
      resourceFields: [NameColumn, NamespaceColumn],
      setActiveSort,
    });
    expect(columnIndex).toBe(1);
    expect(sortBy).toStrictEqual({ direction: 'desc', index: 0 });
    onSort(undefined, 1, SortByDirection.desc, undefined);
    expect(setActiveSort).toBeCalledWith({
      isAsc: false,
      label: NamespaceColumn.label,
      resourceFieldId: NAMESPACE,
    });
  });

  it('shows no sorting if activeSort column cannot be found', () => {
    const setActiveSort = jest.fn();
    const { sortBy } = buildSort({
      activeSort: {
        isAsc: undefined,
        label: undefined,
        resourceFieldId: undefined,
      },
      columnIndex: 1,
      resourceFields: [NameColumn, NamespaceColumn],
      setActiveSort,
    });
    expect(sortBy).toStrictEqual({ direction: 'desc', index: undefined });
  });

  it('skips sort callback if column cannot be found', () => {
    const setActiveSort = jest.fn();
    const { onSort } = buildSort({
      activeSort: {
        isAsc: false,
        label: NAME,
        resourceFieldId: NAME,
      },
      columnIndex: 1,
      resourceFields: [NameColumn, NamespaceColumn],
      setActiveSort,
    });
    onSort(undefined, 100, SortByDirection.desc, undefined);
    expect(setActiveSort).toBeCalledTimes(0);
  });
});
