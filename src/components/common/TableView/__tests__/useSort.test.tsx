import { cleanup } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { NAME } from '../../utils';
import { useSort } from '../sort';

afterEach(cleanup);

describe('useSort hook', () => {
  const NameColumn = { isIdentity: true, label: NAME, resourceFieldId: NAME };
  it('uses first identity column as default sort', () => {
    const {
      result: {
        current: [activeSort],
      },
    } = renderHook(() => useSort([{ label: '', resourceFieldId: 'Foo' }, NameColumn]));

    expect(activeSort).toMatchObject({
      isAsc: true,
      label: NameColumn.label,
      resourceFieldId: NAME,
    });
  });

  it('uses first column as default sort if there is no identity', () => {
    const {
      result: {
        current: [activeSort],
      },
    } = renderHook(() => useSort([{ label: undefined, resourceFieldId: 'Foo' }]));

    expect(activeSort).toMatchObject({
      isAsc: true,
      label: undefined,
      resourceFieldId: 'Foo',
    });
  });

  it('works if no resourceFields(the sort is not defined)', () => {
    const {
      result: {
        current: [activeSort, setActiveSort, compareFn],
      },
    } = renderHook(() => useSort([]));

    expect(activeSort).toMatchObject({
      isAsc: true,
      label: undefined,
      resourceFieldId: undefined,
    });

    expect(setActiveSort).toBeDefined();

    expect(compareFn('a', 'b')).toBe(0);
  });
});
