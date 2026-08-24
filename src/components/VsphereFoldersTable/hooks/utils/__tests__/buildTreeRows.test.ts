import type { FormEvent, MutableRefObject } from 'react';
import type { ProviderVmData } from 'src/utils/types';

import { ROW_TYPE } from '../../../utils/types';
import { buildTreeRows } from '../buildTreeRows';

const makeVmData = (name: string): ProviderVmData =>
  ({
    name,
    namespace: 'ns',
    vm: { id: name, name, providerType: 'vsphere' },
  }) as ProviderVmData;

const createArgs = (
  overrides: Partial<Parameters<typeof buildTreeRows>[0]> = {},
): Parameters<typeof buildTreeRows>[0] => ({
  canSelect: true,
  expandedFolders: new Set(['folder-a']),
  expandedVMs: new Set<string>(),
  level1SetSize: 2,
  onCheckChange: jest.fn(
    () =>
      (_event: unknown, _isChecked: boolean): void =>
        undefined,
  ),
  realFolderEntries: [
    ['folder-a', ['vm-1', 'vm-2']],
    ['folder-b', ['vm-3']],
  ],
  rootVmKeys: ['vm-root'],
  selectedSet: new Set<string>(),
  setExpandedFolders: jest.fn(),
  setExpandedVMs: jest.fn(),
  slug: (value: string): string => value,
  toggleSet: jest.fn(),
  vmByKey: new Map([
    ['vm-1', makeVmData('vm-1')],
    ['vm-2', makeVmData('vm-2')],
    ['vm-3', makeVmData('vm-3')],
    ['vm-root', makeVmData('vm-root')],
  ]),
  ...overrides,
});

describe('buildTreeRows', () => {
  it('orders folders then nested VM/concerns pairs then root VMs', () => {
    const rows = buildTreeRows(createArgs());

    expect(rows.map((row) => row.key)).toEqual([
      'folder-folder-a',
      'vm-vm-1',
      'concerns-vm-1',
      'vm-vm-2',
      'concerns-vm-2',
      'folder-folder-b',
      'vm-vm-3',
      'concerns-vm-3',
      'vm-vm-root',
      'concerns-vm-root',
    ]);
    expect(rows.filter((row) => row.type === ROW_TYPE.Concerns)).toHaveLength(4);
  });

  it('scopes folder checkbox selection to visible VMs only', () => {
    const onCheckChange = jest.fn(
      () =>
        (_event: unknown, _isChecked: boolean): void =>
          undefined,
    );
    const visibleVmIdsRef: MutableRefObject<Set<string> | undefined> = {
      current: new Set(['vm-1']),
    };

    const rows = buildTreeRows(
      createArgs({
        onCheckChange,
        realFolderEntries: [['folder-a', ['vm-1', 'vm-2']]],
        rootVmKeys: [],
        visibleVmIdsRef,
        vmByKey: new Map([
          ['vm-1', makeVmData('vm-1')],
          ['vm-2', makeVmData('vm-2')],
        ]),
      }),
    );

    const folderRow = rows.find((row) => row.type === ROW_TYPE.Folder);
    const folderOnCheckChange = folderRow?.treeRow?.onCheckChange as
      ((event: FormEvent<HTMLInputElement>, isChecked: boolean) => void) | undefined;
    folderOnCheckChange?.({} as FormEvent<HTMLInputElement>, true);

    expect(onCheckChange).toHaveBeenCalledWith(['vm-1']);
  });

  it('hides nested VM and concerns rows when parent folder is collapsed', () => {
    const rows = buildTreeRows(
      createArgs({
        expandedFolders: new Set(),
        realFolderEntries: [['folder-a', ['vm-1']]],
        rootVmKeys: [],
        vmByKey: new Map([['vm-1', makeVmData('vm-1')]]),
      }),
    );

    const vmRow = rows.find((row) => row.key === 'vm-vm-1');
    const concernsRow = rows.find((row) => row.key === 'concerns-vm-1');

    expect(vmRow?.isHidden).toBe(true);
    expect(concernsRow?.isHidden).toBe(true);
  });
});
