import { ROW_TYPE } from '@components/VsphereFoldersTable/utils/types';

import { NO_FOLDER } from '../constants';
import { makeFolderRow, makeVmAndConcernsRows, partitionFolderEntries } from '../treeRowBuilders';

const baseVmArgs = {
  canSelect: false as const,
  checkboxId: undefined,
  isVmExpanded: true,
  level1SetSize: 1,
  onToggle: jest.fn(),
  parentSize: 1,
  rowIndex: 1,
  vmChecked: false,
  vmData: { name: 'vm1', namespace: 'ns', vm: { id: '1' } as never },
  vmIdx: 0,
  vmKey: '1',
};

describe('treeRowBuilders - rows', () => {
  it('builds a selectable expanded folder row', () => {
    const onCheckChange = jest.fn();
    const { folderKey, row } = makeFolderRow({
      canSelect: true,
      checkboxId: 'cb-folder',
      folderChecked: true,
      folderIdx: 0,
      folderName: 'Prod',
      isExpanded: true,
      level1SetSize: 2,
      onCheckChange,
      onToggle: jest.fn(),
      rowIndex: 0,
    });

    expect(folderKey).toBe('folder-Prod');
    expect(row.type).toBe(ROW_TYPE.Folder);
    expect(row.isSelected).toBe(true);
    expect(row.treeRow?.props?.isExpanded).toBe(true);
    expect(row.treeRow?.props?.isChecked).toBe(true);
    expect(row.treeRow?.props?.['aria-posinset']).toBe(1);
    expect(row.treeRow?.onCheckChange).toBe(onCheckChange);
  });

  it('omits checkbox props when selection is disabled', () => {
    const { row } = makeFolderRow({
      canSelect: false,
      checkboxId: undefined,
      folderChecked: false,
      folderIdx: 1,
      folderName: 'Dev',
      isExpanded: false,
      level1SetSize: 1,
      onToggle: jest.fn(),
      rowIndex: 3,
    });

    expect(row.treeRow?.props?.checkboxId).toBeUndefined();
    expect(row.treeRow?.onCheckChange).toBeUndefined();
    expect(row.isSelected).toBe(false);
  });

  it('treats indeterminate folderChecked as selected', () => {
    const { row } = makeFolderRow({
      canSelect: true,
      checkboxId: 'cb',
      folderChecked: null,
      folderIdx: 0,
      folderName: 'Mixed',
      isExpanded: false,
      level1SetSize: 1,
      onCheckChange: jest.fn(),
      onToggle: jest.fn(),
      rowIndex: 0,
    });

    expect(row.isSelected).toBe(true);
    expect(row.treeRow?.props?.isChecked).toBeNull();
  });

  it('builds vm and concerns rows under an expanded folder', () => {
    const onCheckChange = jest.fn();
    const { concernsRow, vmRow } = makeVmAndConcernsRows({
      ...baseVmArgs,
      canSelect: true,
      checkboxId: 'cb-vm',
      onCheckChange,
      parentExpanded: true,
      parentFolderKey: 'folder-Prod',
      vmChecked: true,
    });

    expect(vmRow.type).toBe(ROW_TYPE.Vm);
    expect(vmRow.key).toBe('vm-1');
    expect(vmRow.isHidden).toBe(false);
    expect(vmRow.isSelected).toBe(true);
    expect(vmRow.treeRow?.props).toMatchObject({
      'aria-level': 2,
      'aria-posinset': 1,
      'aria-setsize': 1,
      checkboxId: 'cb-vm',
      isChecked: true,
    });
    expect(vmRow.treeRow?.onCheckChange).toBe(onCheckChange);
    expect(concernsRow.key).toBe('concerns-1');
    expect(concernsRow.isHidden).toBe(false);
  });

  it('hides nested vm and concerns when parent folder is collapsed', () => {
    const { concernsRow, vmRow } = makeVmAndConcernsRows({
      ...baseVmArgs,
      parentExpanded: false,
      parentFolderKey: 'folder-Prod',
    });

    expect(vmRow.isHidden).toBe(true);
    expect(concernsRow.isHidden).toBe(true);
  });

  it('treats no-folder parent as top-level vm', () => {
    const { concernsRow, vmRow } = makeVmAndConcernsRows({
      ...baseVmArgs,
      isVmExpanded: false,
      level1SetSize: 3,
      parentExpanded: false,
      parentFolderKey: NO_FOLDER,
      rowIndex: 0,
    });

    expect(vmRow.treeRow?.props?.['aria-level']).toBe(1);
    expect(vmRow.treeRow?.props?.['aria-setsize']).toBe(3);
    expect(vmRow.isHidden).toBe(false);
    expect(concernsRow.isHidden).toBe(true);
  });

  it('partitions real folders and root vms', () => {
    const map = new Map<string, string[]>([
      ['Prod', ['1']],
      [NO_FOLDER, ['2', '3']],
      ['Dev', ['4']],
    ]);
    const result = partitionFolderEntries(map);
    expect(
      result.realFolderEntries
        .map(([folderName]) => folderName)
        .toSorted((left, right) => left.localeCompare(right)),
    ).toEqual(['Dev', 'Prod']);
    expect(result.rootVmKeys).toEqual(['2', '3']);
    expect(result.level1SetSize).toBe(4);
  });

  it('handles empty folder map', () => {
    const result = partitionFolderEntries(new Map());
    expect(result.realFolderEntries).toEqual([]);
    expect(result.rootVmKeys).toEqual([]);
    expect(result.level1SetSize).toBe(0);
  });
});
