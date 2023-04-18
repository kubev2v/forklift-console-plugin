import { act, cleanup, renderHook } from '@testing-library/react-hooks';

import { PaginationHookProps, usePagination } from '../usePagination';

afterEach(cleanup);

interface Simple {
  id: number;
}

const flattenData: Simple[] = [...Array(20).keys()].map((it) => ({ id: it }));

describe('basic page navigation', () => {
  it('shows first page', () => {
    const {
      result: {
        current: { pageData, showPagination, itemsPerPage, currentPage },
      },
    } = renderHook((props: PaginationHookProps<Simple>) => usePagination<Simple>(props), {
      initialProps: { pagination: 'on', flattenData, filteredData: flattenData },
    });

    expect(showPagination).toBeTruthy();
    expect(itemsPerPage).toEqual(10);
    expect(currentPage).toEqual(1);
    expect(pageData).toEqual(flattenData.slice(0, 10));
  });

  it('moves from first page to second', () => {
    const hook = renderHook((props: PaginationHookProps<Simple>) => usePagination<Simple>(props), {
      initialProps: { pagination: 'on', flattenData, filteredData: flattenData },
    });

    const before = hook.result.current;
    expect(before.currentPage).toEqual(1);
    expect(before.pageData).toEqual(flattenData.slice(0, 10));

    act(() => before.setPage(2));

    const after = hook.result.current;
    expect(after.currentPage).toEqual(2);
    expect(after.pageData).toEqual(flattenData.slice(10, 20));
  });

  it('changes items per page count from 10 to 20', () => {
    const hook = renderHook((props: PaginationHookProps<Simple>) => usePagination<Simple>(props), {
      initialProps: { pagination: 'on', flattenData, filteredData: flattenData },
    });

    const before = hook.result.current;
    expect(before.currentPage).toEqual(1);
    expect(before.pageData).toEqual(flattenData.slice(0, 10));

    act(() => before.setPerPage(20));

    const after = hook.result.current;
    expect(after.currentPage).toEqual(1);
    expect(after.pageData).toEqual(flattenData);
  });
});

describe('pagination modes: on, off, auto', () => {
  it('on-mode enables pagination', () => {
    const {
      result: {
        current: { showPagination },
      },
    } = renderHook(() =>
      usePagination<Simple>({
        pagination: 'on',
        flattenData: flattenData.slice(0, 1),
        filteredData: flattenData.slice(0, 1),
      }),
    );

    expect(showPagination).toBeTruthy();
  });

  it('off-mode disables pagination', () => {
    const {
      result: {
        current: { showPagination },
      },
    } = renderHook(() =>
      usePagination<Simple>({
        pagination: 'off',
        flattenData,
        filteredData: flattenData,
      }),
    );

    expect(showPagination).toBeFalsy();
  });

  it('auto-mode hides pagination if the number of items is below or equal to the provided threshold', () => {
    const {
      result: {
        current: { showPagination },
      },
    } = renderHook(() =>
      usePagination<Simple>({
        pagination: 10,
        flattenData: flattenData.slice(0, 10),
        filteredData: flattenData.slice(0, 10),
      }),
    );

    expect(showPagination).toBeFalsy();
  });

  it('auto-mode shows pagination if the number of items is above the provided threshold', () => {
    const {
      result: {
        current: { showPagination },
      },
    } = renderHook(() =>
      usePagination<Simple>({
        pagination: 10,
        flattenData: flattenData.slice(0, 11),
        filteredData: flattenData.slice(0, 11),
      }),
    );

    expect(showPagination).toBeTruthy();
  });
});

describe('pagination hook with filtering', () => {
  it('displays paging even if no data after filtering', () => {
    const {
      result: {
        current: { pageData, showPagination, itemsPerPage, currentPage },
      },
    } = renderHook(() => usePagination<Simple>({ pagination: 10, flattenData, filteredData: [] }));

    expect(showPagination).toBeTruthy();
    expect(itemsPerPage).toEqual(10);
    expect(currentPage).toEqual(1);
    expect(pageData).toEqual([]);
  });

  it('changes the page from the last to the new last page after filtering removes items', () => {
    const hook = renderHook((props: PaginationHookProps<Simple>) => usePagination<Simple>(props), {
      initialProps: { pagination: 'on', flattenData, filteredData: flattenData },
    });

    const first = hook.result.current;
    expect(first.currentPage).toEqual(1);
    expect(first.pageData).toEqual(flattenData.slice(0, 10));

    act(() => first.setPage(2));

    const second = hook.result.current;
    expect(second.currentPage).toEqual(2);
    expect(second.pageData).toEqual(flattenData.slice(10, 20));

    hook.rerender({ pagination: 'on', flattenData, filteredData: flattenData.slice(0, 10) });

    const third = hook.result.current;
    expect(third.currentPage).toEqual(1);
    expect(third.pageData).toEqual(flattenData.slice(0, 10));
  });
});

describe('pagination hook with user settings', () => {
  it('loads "per page" from user settings', () => {
    const {
      result: {
        current: { itemsPerPage },
      },
    } = renderHook(() =>
      usePagination<Simple>({
        pagination: 'on',
        flattenData,
        filteredData: flattenData,
        userSettings: {
          perPage: 3,
          save: () => undefined,
          clear: () => undefined,
        },
      }),
    );

    expect(itemsPerPage).toEqual(3);
  });

  it('clears the "per page" setting if it is the same as the defaults', () => {
    const clear = jest.fn();
    const {
      result: {
        current: { setPerPage },
      },
    } = renderHook(() =>
      usePagination<Simple>({
        pagination: 'on',
        flattenData,
        filteredData: flattenData,
        userSettings: {
          perPage: 3,
          save: () => undefined,
          clear,
        },
      }),
    );

    act(() => setPerPage(10));

    expect(clear).toBeCalled();
  });

  it('saves the "per page" to the setting', () => {
    const save = jest.fn();
    const {
      result: {
        current: { setPerPage },
      },
    } = renderHook(() =>
      usePagination<Simple>({
        pagination: 'on',
        flattenData,
        filteredData: flattenData,
        userSettings: {
          perPage: 10,
          save,
          clear: () => undefined,
        },
      }),
    );

    act(() => setPerPage(3));

    expect(save).toHaveBeenCalledWith(3);
  });
});
