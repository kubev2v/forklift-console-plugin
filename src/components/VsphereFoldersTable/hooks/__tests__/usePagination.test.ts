import { act, renderHook } from '@testing-library/react';

import usePagination from '../usePagination/usePagination';
import { paginationInitialState } from '../usePagination/utils/constants';

describe('usePagination', () => {
  it('starts from the pagination initial state', () => {
    const { result } = renderHook(() => usePagination());
    expect(result.current.pagination).toEqual(paginationInitialState);
  });

  it('updates page via onSetPage', () => {
    const { result } = renderHook(() => usePagination());

    act(() => {
      result.current.onSetPage(undefined as never, 3);
    });

    expect(result.current.pagination.page).toBe(3);
  });

  it('resets to page 1 when perPage changes', () => {
    const { result } = renderHook(() => usePagination());

    act(() => {
      result.current.onSetPage(undefined as never, 4);
    });
    act(() => {
      result.current.onPerPageSelect(undefined as never, 25);
    });

    expect(result.current.pagination).toMatchObject({ page: 1, perPage: 25 });
  });

  it('merges partial updates via onPaginationChange', () => {
    const { result } = renderHook(() => usePagination());

    act(() => {
      result.current.onPaginationChange({ page: 2, startIndex: 10 } as never);
    });

    expect(result.current.pagination).toMatchObject({
      page: 2,
      perPage: paginationInitialState.perPage,
      startIndex: 10,
    });
  });
});
