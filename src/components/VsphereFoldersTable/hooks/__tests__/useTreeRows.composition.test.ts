import type { ProviderVmData } from 'src/utils/types';

import { act, renderHook } from '@testing-library/react';

import { useTreeRows } from '../useTreeRows';
import { NO_FOLDER } from '../utils/constants';

const makeVm = (id: string, parentId?: string): ProviderVmData =>
  ({
    name: id,
    namespace: 'ns',
    vm: {
      id,
      name: id,
      ...(parentId ? { parent: { id: parentId, kind: 'Folder' } } : {}),
      providerType: 'vsphere',
    },
  }) as ProviderVmData;

describe('useTreeRows - composition', () => {
  it('returns empty rows and maps when vmDataArr is undefined', () => {
    const { result } = renderHook(() =>
      useTreeRows({
        canSelect: true,
        foldersDict: {},
        hostsDict: {},
        vmDataArr: undefined,
      }),
    );

    expect(result.current.rows).toEqual([]);
    expect(result.current.folderToVmKeys.size).toBe(0);
    expect(result.current.groupVMCountByFolder.size).toBe(0);
    expect(result.current.showAll).toBe(true);
    expect(result.current.selectedVmKeys).toEqual([]);
  });

  it('builds folder and root rows from vm and folder dictionaries', () => {
    const foldersDict = {
      'folder-id-a': { id: 'folder-id-a', name: 'folder-a', path: '/folder-a' },
    } as never;
    const { result } = renderHook(() =>
      useTreeRows({
        canSelect: true,
        foldersDict,
        hostsDict: {},
        vmDataArr: [makeVm('vm-1', 'folder-id-a'), makeVm('vm-root')],
      }),
    );

    expect(result.current.folderToVmKeys.get('folder-a')).toEqual(['vm-1']);
    expect(result.current.folderToVmKeys.get(NO_FOLDER)).toEqual(['vm-root']);
    expect(result.current.groupVMCountByFolder.get('folder-a')).toBe(1);
    expect(result.current.rows.map((row) => row.key)).toEqual([
      'folder-folder-a',
      'vm-vm-1',
      'concerns-vm-1',
      'vm-vm-root',
      'concerns-vm-root',
    ]);
  });

  it('delegates selection through setSelectedVmKeys', () => {
    const { result } = renderHook(() =>
      useTreeRows({
        canSelect: false,
        foldersDict: {},
        hostsDict: {},
        vmDataArr: [makeVm('vm-1')],
      }),
    );

    act(() => {
      result.current.setSelectedVmKeys(['vm-1']);
      result.current.setShowAll(false);
    });

    expect(result.current.selectedVmKeys).toEqual(['vm-1']);
    expect(result.current.showAll).toBe(false);
  });

  it('uses controlled selectedVmKeys when controls are provided', () => {
    const setSelectedVmKeys = jest.fn();
    const { result } = renderHook(() =>
      useTreeRows({
        canSelect: true,
        controls: { selectedVmKeys: ['vm-1'], setSelectedVmKeys },
        foldersDict: {},
        hostsDict: {},
        vmDataArr: [makeVm('vm-1')],
      }),
    );

    expect(result.current.selectedVmKeys).toEqual(['vm-1']);
    act(() => {
      result.current.setSelectedVmKeys(['vm-1', 'vm-2']);
    });
    expect(setSelectedVmKeys).toHaveBeenCalledWith(['vm-1', 'vm-2']);
  });
});
