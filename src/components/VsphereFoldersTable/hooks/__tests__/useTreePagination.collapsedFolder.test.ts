import { renderHook } from '@testing-library/react';

import useTreePagination from '../useTreePagination';

import { collapsedFolderBlock, folderBlock } from './useTreePagination.fixtures';

describe('useTreePagination - collapsedFolder', () => {
  it('counts collapsed folders with no visible VMs as pagination items', () => {
    const blocks = [collapsedFolderBlock('empty'), folderBlock('full', ['vm-1'])];
    const { result } = renderHook(() => useTreePagination({ blocks, page: 1, perPage: 10 }));

    expect(result.current.itemCount).toBe(2);
    expect(result.current.pagedRows.map((row) => row.key)).toEqual([
      'folder-empty',
      'folder-full',
      'vm-vm-1',
      'concerns-vm-1',
    ]);
  });

  it('paginates collapsed folders independently of expanded folder VMs', () => {
    const blocks = [
      collapsedFolderBlock('c1'),
      collapsedFolderBlock('c2'),
      folderBlock('full', ['vm-1', 'vm-2']),
    ];
    const page1 = renderHook(() => useTreePagination({ blocks, page: 1, perPage: 2 })).result;
    expect(page1.current.itemCount).toBe(4);
    expect(page1.current.pagedRows.map((row) => row.key)).toEqual(['folder-c1', 'folder-c2']);

    const page2 = renderHook(() => useTreePagination({ blocks, page: 2, perPage: 2 })).result;
    expect(page2.current.pagedRows.map((row) => row.key)).toEqual([
      'folder-full',
      'vm-vm-1',
      'concerns-vm-1',
      'vm-vm-2',
      'concerns-vm-2',
    ]);
  });

  it('treats collapsed fixture VMs as a collapsed folder item', () => {
    const blocks = [
      folderBlock('hidden', ['vm-1'], { collapsed: true }),
      folderBlock('visible', ['vm-2']),
    ];
    const { result } = renderHook(() => useTreePagination({ blocks, page: 1, perPage: 10 }));

    expect(result.current.itemCount).toBe(2);
    expect(result.current.pagedRows.map((row) => row.key)).toEqual([
      'folder-hidden',
      'folder-visible',
      'vm-vm-2',
      'concerns-vm-2',
    ]);
  });

  it('skips hidden VMs when building descriptors', () => {
    const blocks = [folderBlock('a', ['visible', 'hidden'])];
    blocks[0].items[1].vm.isHidden = true;
    const { result } = renderHook(() => useTreePagination({ blocks, page: 1, perPage: 10 }));

    expect(result.current.itemCount).toBe(1);
    expect(result.current.pagedRows.map((row) => row.key)).toEqual([
      'folder-a',
      'vm-visible',
      'concerns-visible',
    ]);
  });
});
