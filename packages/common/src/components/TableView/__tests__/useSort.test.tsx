import { NAME } from 'common/src/utils/constants';

import { cleanup, renderHook } from '@testing-library/react-hooks';

import { useSort } from '../sort';

afterEach(cleanup);

describe('useSort hook', () => {
  const NameColumn = { resourceFieldID: NAME, label: NAME, isIdentity: true };
  it('uses first identity column as default sort', () => {
    const {
      result: {
        current: [activeSort],
      },
    } = renderHook(() => useSort([{ resourceFieldID: 'Foo', label: '' }, NameColumn]));

    expect(activeSort).toMatchObject({
      resourceFieldID: NAME,
      label: NameColumn.label,
      isAsc: false,
    });
  });

  it('uses first column as default sort if there is no identity', () => {
    const {
      result: {
        current: [activeSort],
      },
    } = renderHook(() => useSort([{ resourceFieldID: 'Foo', label: undefined }]));

    expect(activeSort).toMatchObject({
      resourceFieldID: 'Foo',
      label: undefined,
      isAsc: false,
    });
  });

  it('works if no resourceFields(the sort is not defined)', () => {
    const {
      result: {
        current: [activeSort, setActiveSort, compareFn],
      },
    } = renderHook(() => useSort([]));

    expect(activeSort).toMatchObject({
      resourceFieldID: undefined,
      label: undefined,
      isAsc: false,
    });

    expect(setActiveSort).toBeDefined();

    expect(compareFn('a', 'b')).toBe(0);
  });
});
