import { renderHook } from '@testing-library/react';

import useTreePagination from '../useTreePagination';

import { folderBlock, rootBlock } from './useTreePagination.fixtures';

describe('useTreePagination - paging', () => {
  it('returns empty results for empty blocks or zero descriptors', () => {
    expect(
      renderHook(() => useTreePagination({ blocks: [], page: 1, perPage: 10 })).result.current,
    ).toEqual({ itemCount: 0, pagedRows: [] });
    expect(
      renderHook(() => useTreePagination({ blocks: [rootBlock([])], page: 1, perPage: 10 })).result
        .current,
    ).toEqual({ itemCount: 0, pagedRows: [] });
  });

  it('returns empty pagedRows when page is past the last page', () => {
    const blocks = [folderBlock('a', ['vm-1', 'vm-2', 'vm-3'])];
    const { result } = renderHook(() => useTreePagination({ blocks, page: 5, perPage: 2 }));

    expect(result.current.itemCount).toBe(3);
    expect(result.current.pagedRows).toEqual([]);
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

  it('injects a second folder header mid-page without counting it', () => {
    const blocks = [folderBlock('a', ['vm-1', 'vm-2']), folderBlock('b', ['vm-3'])];
    const { result } = renderHook(() => useTreePagination({ blocks, page: 1, perPage: 3 }));

    expect(result.current.itemCount).toBe(3);
    expect(result.current.pagedRows.map((row) => row.key)).toEqual([
      'folder-a',
      'vm-vm-1',
      'concerns-vm-1',
      'vm-vm-2',
      'concerns-vm-2',
      'folder-b',
      'vm-vm-3',
      'concerns-vm-3',
    ]);
  });

  it('includes root VMs and skips hidden concerns', () => {
    const blocks = [rootBlock(['root-1'])];
    const [item] = blocks[0].items;
    if (item.concerns) {
      item.concerns = { ...item.concerns, isHidden: true };
    }
    const { result } = renderHook(() => useTreePagination({ blocks, page: 1, perPage: 10 }));

    expect(result.current.itemCount).toBe(1);
    expect(result.current.pagedRows.map((row) => row.key)).toEqual(['vm-root-1']);
  });

  it('omits concerns when hideConcerns fixture option is set', () => {
    const blocks = [folderBlock('a', ['vm-1'], { hideConcerns: true })];
    const { result } = renderHook(() => useTreePagination({ blocks, page: 1, perPage: 10 }));

    expect(result.current.pagedRows.map((row) => row.key)).toEqual(['folder-a', 'vm-vm-1']);
  });
});
