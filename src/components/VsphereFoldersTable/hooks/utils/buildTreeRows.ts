import type { FormEvent, MutableRefObject } from 'react';
import type { ProviderVmData } from 'src/utils/types';

import type { RowNode } from '../../utils/types';

import { NO_FOLDER } from './constants';
import { makeFolderRow, makeVmAndConcernsRows } from './treeRowBuilders';
import { isFolderChecked } from './utils';

type OnCheckChange = (
  keys: string | string[],
) => (_event: FormEvent<HTMLInputElement>, isChecked: boolean) => void;

type BuildTreeRowsArgs = {
  canSelect: boolean;
  expandedFolders: Set<string>;
  expandedVMs: Set<string>;
  level1SetSize: number;
  onCheckChange: OnCheckChange;
  realFolderEntries: [string, string[]][];
  rootVmKeys: string[];
  selectedSet: Set<string>;
  setExpandedFolders: React.Dispatch<React.SetStateAction<Set<string>>>;
  setExpandedVMs: React.Dispatch<React.SetStateAction<Set<string>>>;
  slug: (value: string) => string;
  toggleSet: (setter: React.Dispatch<React.SetStateAction<Set<string>>>, key: string) => void;
  visibleVmIdsRef?: MutableRefObject<Set<string> | undefined>;
  vmByKey: Map<string, ProviderVmData>;
};

export const buildTreeRows = ({
  canSelect,
  expandedFolders,
  expandedVMs,
  level1SetSize,
  onCheckChange,
  realFolderEntries,
  rootVmKeys,
  selectedSet,
  setExpandedFolders,
  setExpandedVMs,
  slug,
  toggleSet,
  visibleVmIdsRef,
  vmByKey,
}: BuildTreeRowsArgs): RowNode[] => {
  const isVmSelected = (id: string): boolean => selectedSet.has(id);
  const result: RowNode[] = [];

  for (const [folderIdx, [folderName, vmIdsInFolder]] of realFolderEntries.entries()) {
    const isExpanded = expandedFolders.has(folderName);

    const getVisibleVmsInFolder = (): string[] => {
      const visibleSet = visibleVmIdsRef?.current;
      if (!visibleSet || visibleSet.size === 0) {
        return vmIdsInFolder;
      }

      return vmIdsInFolder.filter((id) => visibleSet.has(id));
    };

    const visibleVmIdsInFolder = getVisibleVmsInFolder();
    const folderChecked = isFolderChecked(visibleVmIdsInFolder, selectedSet);

    const { folderKey, row: folderRow } = makeFolderRow({
      canSelect,
      checkboxId: canSelect ? `checkbox_id_folder_${slug(folderName)}` : undefined,
      folderChecked,
      folderIdx,
      folderName,
      isExpanded,
      level1SetSize,
      onCheckChange: canSelect
        ? (_event, isChecked): void => {
            const currentlyVisibleVms = getVisibleVmsInFolder();
            onCheckChange(currentlyVisibleVms)(_event, isChecked);
          }
        : undefined,
      onToggle: () => {
        toggleSet(setExpandedFolders, folderName);
      },
      rowIndex: result.length,
    });

    result.push(folderRow);

    for (const [vmIdx, vmKey] of vmIdsInFolder.entries()) {
      const vmChecked = isVmSelected(vmKey);
      const isVmExpanded = expandedVMs.has(vmKey);
      const vmData = vmByKey.get(vmKey);

      if (vmData) {
        const { concernsRow, vmRow } = makeVmAndConcernsRows({
          canSelect,
          checkboxId: canSelect ? `checkbox_id_vm_${slug(vmKey)}` : undefined,
          isVmExpanded,
          level1SetSize,
          onCheckChange: canSelect ? onCheckChange(vmKey) : undefined,
          onToggle: () => {
            toggleSet(setExpandedVMs, vmKey);
          },
          parentExpanded: isExpanded,
          parentFolderKey: folderKey,
          parentSize: vmIdsInFolder.length,
          rowIndex: result.length,
          vmChecked,
          vmData,
          vmIdx,
          vmKey,
        });

        result.push(vmRow, concernsRow);
      }
    }
  }

  for (const [idx, vmKey] of rootVmKeys.entries()) {
    const vmChecked = isVmSelected(vmKey);
    const isVmExpanded = expandedVMs.has(vmKey);
    const vmData = vmByKey.get(vmKey);

    if (vmData) {
      const { concernsRow, vmRow } = makeVmAndConcernsRows({
        canSelect,
        checkboxId: canSelect ? `checkbox_id_vm_${slug(vmKey)}` : undefined,
        isVmExpanded,
        level1SetSize,
        onCheckChange: canSelect ? onCheckChange(vmKey) : undefined,
        onToggle: () => {
          toggleSet(setExpandedVMs, vmKey);
        },
        parentExpanded: true,
        parentFolderKey: NO_FOLDER,
        parentSize: level1SetSize,
        rowIndex: result.length,
        vmChecked,
        vmData,
        vmIdx: idx,
        vmKey,
      });

      result.push(vmRow, concernsRow);
    }
  }

  return result;
};
