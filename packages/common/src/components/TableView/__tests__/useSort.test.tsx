import { cleanup, renderHook } from '@testing-library/react-hooks';

import { NAME } from '../../../utils';
import { useSort } from '../sort';

afterEach(cleanup);

describe('useSort hook', () => {
  const NameColumn = { resourceFieldId: NAME, label: NAME, isIdentity: true };
  it('uses first identity column as default sort', () => {
    const {
      result: {
        current: [activeSort],
      },
    } = renderHook(() => useSort([{ resourceFieldId: 'Foo', label: '' }, NameColumn]));

    expect(activeSort).toMatchObject({
      resourceFieldId: NAME,
      label: NameColumn.label,
      isAsc: true,
    });
  });

  it('uses first column as default sort if there is no identity', () => {
    const {
      result: {
        current: [activeSort],
      },
    } = renderHook(() => useSort([{ resourceFieldId: 'Foo', label: undefined }]));

    expect(activeSort).toMatchObject({
      resourceFieldId: 'Foo',
      label: undefined,
      isAsc: true,
    });
  });

  it('works if no resourceFields(the sort is not defined)', () => {
    const {
      result: {
        current: [activeSort, setActiveSort, compareFn],
      },
    } = renderHook(() => useSort([]));

    expect(activeSort).toMatchObject({
      resourceFieldId: undefined,
      label: undefined,
      isAsc: true,
    });

    expect(setActiveSort).toBeDefined();

    expect(compareFn('a', 'b')).toBe(0);
  });
});
