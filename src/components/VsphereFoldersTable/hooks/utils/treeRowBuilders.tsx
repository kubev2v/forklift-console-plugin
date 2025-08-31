import type { FormEvent } from 'react';

import { FolderIcon, FolderOpenIcon, VirtualMachineIcon } from '@patternfly/react-icons';

import { type ConcernsRow, type FolderRow, ROW_TYPE, type VmRow } from '../../utils/types';
import { NO_FOLDER } from '../utils/constants';

type MakeFolderRowArgs = {
  folderName: string;
  folderIdx: number;
  level1SetSize: number;
  isExpanded: boolean;
  folderChecked: boolean | null;
  rowIndex: number;
  canSelect: boolean;
  checkboxId: string | undefined;
  onCheckChange?: (_event: FormEvent<HTMLInputElement>, isChecked: boolean) => void;
  onToggle: () => void;
};

export const makeFolderRow = ({
  canSelect,
  checkboxId,
  folderChecked,
  folderIdx,
  folderName,
  isExpanded,
  level1SetSize,
  onCheckChange,
  onToggle,
  rowIndex,
}: MakeFolderRowArgs): { row: FolderRow; folderKey: string } => {
  const folderKey = `folder-${folderName}`;
  const row: FolderRow = {
    folderName,
    isHidden: false,
    isSelected: folderChecked !== false,
    key: folderKey,
    treeRow: {
      ...(canSelect && onCheckChange ? { onCheckChange } : {}),
      onCollapse: onToggle,
      props: {
        'aria-level': 1,
        'aria-posinset': folderIdx + 1,
        'aria-setsize': level1SetSize,
        icon: isExpanded ? <FolderOpenIcon /> : <FolderIcon />,
        isExpanded,
        ...(canSelect ? { checkboxId, isChecked: folderChecked } : {}),
      },
      rowIndex,
    },
    type: ROW_TYPE.Folder,
  };
  return { folderKey, row };
};

type MakeVmAndConcernsArgs = {
  vmKey: string;
  vmIdx: number;
  parentFolderKey: string;
  parentExpanded: boolean;
  parentSize: number;
  level1SetSize: number;
  vmChecked: boolean;
  isVmExpanded: boolean;
  rowIndex: number;
  canSelect: boolean;
  checkboxId: string | undefined;
  onCheckChange?: (_event: FormEvent<HTMLInputElement>, isChecked: boolean) => void;
  onToggle: () => void;
  vmData: VmRow['vmData'];
};

export const makeVmAndConcernsRows = ({
  canSelect,
  checkboxId,
  isVmExpanded,
  level1SetSize,
  onCheckChange,
  onToggle,
  parentExpanded,
  parentFolderKey,
  parentSize,
  rowIndex,
  vmChecked,
  vmData,
  vmIdx,
  vmKey,
}: MakeVmAndConcernsArgs): { vmRow: VmRow; concernsRow: ConcernsRow } => {
  const topLevel = parentFolderKey === NO_FOLDER;

  const vmRow: VmRow = {
    isHidden: !topLevel && !parentExpanded,
    isSelected: vmChecked,
    key: `vm-${vmKey}`,
    parentFolderKey,
    treeRow: {
      ...(canSelect && onCheckChange ? { onCheckChange } : {}),
      onCollapse: onToggle,
      props: {
        'aria-level': topLevel ? 1 : 2,
        'aria-posinset': topLevel ? vmIdx + 1 : vmIdx + 1,
        'aria-setsize': topLevel ? level1SetSize : parentSize,
        icon: <VirtualMachineIcon />,
        isExpanded: isVmExpanded,
        isHidden: !topLevel && !parentExpanded,
        ...(canSelect ? { checkboxId, isChecked: vmChecked } : {}),
      },
      rowIndex,
    },
    type: ROW_TYPE.Vm,
    vmData,
  };

  const concernsRow: ConcernsRow = {
    isHidden: topLevel ? !isVmExpanded : !isVmExpanded || !parentExpanded,
    isSelected: vmChecked,
    key: `concerns-${vmKey}`,
    parentFolderKey,
    type: ROW_TYPE.Concerns,
    vmData,
  };

  return { concernsRow, vmRow };
};

export const partitionFolderEntries = (
  folderToVmKeys: Map<string, string[]>,
): {
  realFolderEntries: [string, string[]][];
  rootVmKeys: string[];
  level1SetSize: number;
} => {
  const entries = Array.from(folderToVmKeys.entries());
  const realFolderEntries = entries.filter(([name]) => name !== NO_FOLDER);
  const rootVmKeys = folderToVmKeys.get(NO_FOLDER) ?? [];
  return {
    level1SetSize: realFolderEntries.length + rootVmKeys.length,
    realFolderEntries,
    rootVmKeys,
  };
};
