import { NAME } from 'src/utils/constants';

import { cleanup, renderHook } from '@testing-library/react-hooks';

import { useSort } from '../sort';

afterEach(cleanup);

describe('useSort hook', () => {
  const NameColumn = { id: NAME, toLabel: () => NAME, isIdentity: true };
  it('uses first identity column as default sort', () => {
    const {
      result: {
        current: [activeSort],
      },
    } = renderHook(() => useSort([{ id: 'Foo', toLabel: () => '' }, NameColumn]));

    expect(activeSort).toMatchObject({
      id: NAME,
      toLabel: NameColumn.toLabel,
      isAsc: false,
    });
  });

  it('uses first column as default sort if there is no identity', () => {
    const {
      result: {
        current: [activeSort],
      },
    } = renderHook(() => useSort([{ id: 'Foo', toLabel: undefined }]));

    expect(activeSort).toMatchObject({
      id: 'Foo',
      toLabel: undefined,
      isAsc: false,
    });
  });

  it('works if no columns(the sort is not defined)', () => {
    const {
      result: {
        current: [activeSort, setActiveSort, comparator],
      },
    } = renderHook(() => useSort([]));

    expect(activeSort).toMatchObject({
      id: undefined,
      toLabel: undefined,
      isAsc: false,
    });

    expect(setActiveSort).toBeDefined();

    expect(comparator('a', 'b')).toBe(0);
  });
});
