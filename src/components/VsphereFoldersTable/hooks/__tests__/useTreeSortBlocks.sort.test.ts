import { act, renderHook } from '@testing-library/react-hooks';

import type { ResourceField } from '@components/common/utils/types';
import { BlockKind, COLUMN_IDS } from '../../utils/types';
import { FOLDER_PREFIX, NO_FOLDER } from '../utils/constants';
import useTreeSortBlocks from '../useTreeSortBlocks';

import { folder, vm } from './rowFixtures';

const columns: ResourceField[] = [
  { isVisible: true, label: 'Host', resourceFieldId: COLUMN_IDS.Host, sortable: true },
];

const unsortedRows = [
  folder('b'),
  vm('zeta', {
    parentFolderKey: `${FOLDER_PREFIX}b`,
    vmData: { name: 'zeta', namespace: 'ns', vm: { id: 'zeta', name: 'zeta' } },
  }),
  vm('alpha', {
    parentFolderKey: `${FOLDER_PREFIX}b`,
    vmData: { name: 'alpha', namespace: 'ns', vm: { id: 'alpha', name: 'alpha' } },
  }),
  folder('a'),
  vm('mid', {
    parentFolderKey: `${FOLDER_PREFIX}a`,
    vmData: { name: 'mid', namespace: 'ns', vm: { id: 'mid', name: 'mid' } },
  }),
  vm('root-z', {
    parentFolderKey: NO_FOLDER,
    vmData: { name: 'root-z', namespace: 'ns', vm: { id: 'root-z', name: 'root-z' } },
  }),
];

describe('useTreeSortBlocks - sort', () => {
  it('sorts VMs ascending by name within each block by default', () => {
    const { result } = renderHook(() =>
      useTreeSortBlocks({ columns, conversions: [], filteredRows: unsortedRows }),
    );

    const folderB = result.current.sortedBlocks.find(
      (block) => block.kind === BlockKind.Folder && block.folder.folderName === 'b',
    );
    expect(folderB?.items.map((item) => item.vm.vmData.name)).toEqual(['alpha', 'zeta']);
  });

  it('orders root before folders ascending by name', () => {
    const { result } = renderHook(() =>
      useTreeSortBlocks({ columns, conversions: [], filteredRows: unsortedRows }),
    );

    expect(result.current.sortedBlocks.map((block) => block.kind)).toEqual([
      BlockKind.Root,
      BlockKind.Folder,
      BlockKind.Folder,
    ]);
    expect(
      result.current.sortedBlocks
        .filter((block) => block.kind === BlockKind.Folder)
        .map((block) => (block.kind === BlockKind.Folder ? block.folder.folderName : '')),
    ).toEqual(['a', 'b']);
  });

  it('toggles name sort direction via handleOnSort', () => {
    const { result } = renderHook(() =>
      useTreeSortBlocks({ columns, conversions: [], filteredRows: unsortedRows }),
    );

    act(() => {
      result.current.handleOnSort?.(
        {} as Parameters<NonNullable<typeof result.current.handleOnSort>>[0],
        0,
        'desc',
      );
    });

    expect(result.current.sortBy).toEqual({ direction: 'desc', index: 0 });
    expect(
      result.current.sortedBlocks
        .filter((block) => block.kind === BlockKind.Folder)
        .map((block) => (block.kind === BlockKind.Folder ? block.folder.folderName : '')),
    ).toEqual(['b', 'a']);
  });

  it('resets direction to asc when sorting a different column', () => {
    const { result } = renderHook(() =>
      useTreeSortBlocks({ columns, conversions: [], filteredRows: unsortedRows }),
    );

    act(() => {
      result.current.handleOnSort?.(
        {} as Parameters<NonNullable<typeof result.current.handleOnSort>>[0],
        0,
        'desc',
      );
    });
    act(() => {
      result.current.handleOnSort?.(
        {} as Parameters<NonNullable<typeof result.current.handleOnSort>>[0],
        1,
        'desc',
      );
    });

    expect(result.current.sortBy).toEqual({ direction: 'asc', index: 1 });
  });
});
