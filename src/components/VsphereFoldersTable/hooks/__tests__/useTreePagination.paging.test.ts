import { renderHook } from '@testing-library/react';

import useTreePagination from '../useTreePagination';

import { folderBlock, rootBlock } from './useTreePagination.fixtures';

describe('useTreePagination - paging', () => {
  it('returns empty results for empty or invalid blocks', () => {
    const { result } = renderHook(() => useTreePagination({ blocks: [], page: 1, perPage: 10 }));
    expect(result.current).toEqual({ itemCount: 0, pagedRows: [] });
  });

  it('falls back to defaults for invalid page and perPage', () => {
    const blocks = [folderBlock('a', ['vm-1', 'vm-2', 'vm-3'])];
    const { result } = renderHook(() =>
      useTreePagination({ blocks, page: Number.NaN, perPage: 0 }),
    );

    expect(result.current.itemCount).toBe(3);
    expect(result.current.pagedRows.map((row) => row.key)).toEqual([
      'folder-a',
      'vm-vm-1',
      'concerns-vm-1',
      'vm-vm-2',
      'concerns-vm-2',
      'vm-vm-3',
      'concerns-vm-3',
    ]);
  });

  it('paginates visible VMs and injects folder headers without counting them', () => {
    const blocks = [folderBlock('a', ['vm-1', 'vm-2', 'vm-3'])];
    const { result } = renderHook(() => useTreePagination({ blocks, page: 2, perPage: 2 }));

    expect(result.current.itemCount).toBe(3);
    expect(result.current.pagedRows.map((row) => row.key)).toEqual([
      'folder-a',
      'vm-vm-3',
      'concerns-vm-3',
    ]);
  });

  it('includes root VMs and skips hidden concerns', () => {
    const blocks = [rootBlock(['root-1'])];
    blocks[0].items[0].concerns = {
      ...blocks[0].items[0].concerns!,
      isHidden: true,
    };
    const { result } = renderHook(() => useTreePagination({ blocks, page: 1, perPage: 10 }));

    expect(result.current.itemCount).toBe(1);
    expect(result.current.pagedRows.map((row) => row.key)).toEqual(['vm-root-1']);
  });
});
