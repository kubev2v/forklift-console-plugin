import type { ResourceField } from '@components/common/utils/types';
import { act, renderHook } from '@testing-library/react';

import { BlockKind, COLUMN_IDS } from '../../utils/types';
import useTreeSortBlocks from '../useTreeSortBlocks';
import { FOLDER_PREFIX, NO_FOLDER } from '../utils/constants';

import { concerns, folder, folderTreeRows, vm } from './rowFixtures';

const columns: ResourceField[] = [
  { isVisible: true, label: 'Host', resourceFieldId: COLUMN_IDS.Host, sortable: true },
  { isVisible: false, label: 'Path', resourceFieldId: COLUMN_IDS.Path, sortable: true },
  { isVisible: true, label: 'Power', resourceFieldId: COLUMN_IDS.Power, sortable: false },
];

describe('useTreeSortBlocks - blocks', () => {
  it('returns empty blocks for empty filtered rows', () => {
    const { result } = renderHook(() =>
      useTreeSortBlocks({ columns, conversions: [], filteredRows: [] }),
    );

    expect(result.current.sortedBlocks).toEqual([]);
    expect(result.current.sortBy).toEqual({ direction: 'asc', index: 0 });
  });

  it('builds folder and root blocks and attaches concerns', () => {
    const { result } = renderHook(() =>
      useTreeSortBlocks({ columns, conversions: [], filteredRows: folderTreeRows }),
    );

    const kinds = result.current.sortedBlocks.map((block) => block.kind);
    expect(kinds).toContain(BlockKind.Folder);
    expect(kinds).toContain(BlockKind.Root);

    const folderA = result.current.sortedBlocks.find(
      (block) => block.kind === BlockKind.Folder && block.folder.folderName === 'a',
    );
    expect(folderA?.items).toHaveLength(2);
    expect(folderA?.items[0].concerns?.key).toBe('concerns-vm-1');
    expect(folderA?.items[1].concerns).toBeUndefined();
  });

  it('creates a root block for NO_FOLDER VMs after a folder', () => {
    const rows = [
      folder('a'),
      vm('in-folder', { parentFolderKey: `${FOLDER_PREFIX}a` }),
      vm('root', { parentFolderKey: NO_FOLDER }),
    ];
    const { result } = renderHook(() =>
      useTreeSortBlocks({ columns, conversions: [], filteredRows: rows }),
    );

    expect(result.current.sortedBlocks.map((block) => block.kind)).toEqual([
      BlockKind.Root,
      BlockKind.Folder,
    ]);
    expect(result.current.sortedBlocks[0].items[0].vm.key).toBe('vm-root');
  });

  it('skips stray concerns rows', () => {
    const rows = [concerns('orphan'), vm('alone', { parentFolderKey: NO_FOLDER })];
    const { result } = renderHook(() =>
      useTreeSortBlocks({ columns, conversions: [], filteredRows: rows }),
    );

    expect(result.current.sortedBlocks).toHaveLength(1);
    expect(result.current.sortedBlocks[0].items[0].vm.key).toBe('vm-alone');
    expect(result.current.sortedBlocks[0].items[0].concerns).toBeUndefined();
  });

  it('exposes visibleCols from name plus visible columns only', () => {
    const { result } = renderHook(() =>
      useTreeSortBlocks({ columns, conversions: [], filteredRows: [] }),
    );

    expect(result.current.visibleCols.map((col) => col.id)).toEqual([
      COLUMN_IDS.Name,
      COLUMN_IDS.Host,
      COLUMN_IDS.Power,
    ]);
    expect(result.current.visibleCols.find((col) => col.id === COLUMN_IDS.Power)?.sortable).toBe(
      false,
    );
  });

  it('ignores handleOnSort for non-sortable columns', () => {
    const { result } = renderHook(() =>
      useTreeSortBlocks({ columns, conversions: [], filteredRows: [] }),
    );

    act(() => {
      result.current.handleOnSort?.(
        {} as Parameters<NonNullable<typeof result.current.handleOnSort>>[0],
        2,
        'desc' as never,
        {},
      );
    });

    expect(result.current.sortBy).toEqual({ direction: 'asc', index: 0 });
  });
});
