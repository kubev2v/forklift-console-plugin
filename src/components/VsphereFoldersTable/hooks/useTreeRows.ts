import { type Dispatch, type MutableRefObject, type SetStateAction, useMemo } from 'react';
import type { VmData } from 'src/modules/Providers/views/details/tabs/VirtualMachines/components/VMCellProps';

import type { ProviderHost, VSphereResource } from '@kubev2v/types';

import type { RowNode } from '../utils/types';

import { NO_FOLDER } from './utils/constants';
import {
  makeFolderRow,
  makeVmAndConcernsRows,
  partitionFolderEntries,
} from './utils/treeRowBuilders';
import type { UseTreeRowsControls } from './utils/types';
import { buildIndexes, isFolderChecked } from './utils/utils';
import useSelectedTreeRows from './useSelectedTreeRows';
import { useSlug } from './useSlug';
import useToggleTreeRows from './useToggleTreeRows';
type UseTreeRowsReturnValue = {
  rows: RowNode[];
  groupVMCountByFolder: Map<string, number>;
  selectedVmKeys: string[];
  setSelectedVmKeys: Dispatch<SetStateAction<string[]>>;
  showAll: boolean;
  setShowAll: Dispatch<SetStateAction<boolean>>;
  folderToVmKeys: Map<string, string[]>;
};

type UseTreeRows = (args: {
  canSelect: boolean;
  controls?: UseTreeRowsControls;
  foldersDict: Record<string, VSphereResource>;
  hostsDict: Record<string, ProviderHost>;
  vmDataArr: VmData[] | undefined;
  visibleVmIdsRef?: MutableRefObject<Set<string> | undefined>;
}) => UseTreeRowsReturnValue;

export const useTreeRows: UseTreeRows = ({
  canSelect,
  controls,
  foldersDict,
  hostsDict,
  visibleVmIdsRef,
  vmDataArr,
}) => {
  const { expandedFolders, expandedVMs, setExpandedFolders, setExpandedVMs, toggleSet } =
    useToggleTreeRows();
  const { onCheckChange, selectedSet, selectedVmKeys, setSelectedVmKeys, setShowAll, showAll } =
    useSelectedTreeRows(controls);

  const { folderToVmKeys, vmByKey } = useMemo(
    () => buildIndexes(vmDataArr, foldersDict, hostsDict),
    [vmDataArr, foldersDict, hostsDict],
  );

  const { level1SetSize, realFolderEntries, rootVmKeys } = useMemo(
    () => partitionFolderEntries(folderToVmKeys),
    [folderToVmKeys],
  );

  const groupVMCountByFolder = useMemo(
    () => new Map<string, number>(realFolderEntries.map(([name, ids]) => [name, ids.length])),
    [realFolderEntries],
  );

  const slug = useSlug();

  const rows = useMemo(() => {
    const isVmSelected = (id: string) => selectedSet.has(id);
    const result: RowNode[] = [];

    realFolderEntries.forEach(([folderName, vmIdsInFolder], folderIdx) => {
      const isExpanded = expandedFolders.has(folderName);

      const getVisibleVmsInFolder = () => {
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
          ? (_event, isChecked) => {
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

      vmIdsInFolder.forEach((vmKey, vmIdx) => {
        const vmChecked = isVmSelected(vmKey);
        const isVmExpanded = expandedVMs.has(vmKey);
        const vmData = vmByKey.get(vmKey);

        if (!vmData) return;

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
      });
    });

    rootVmKeys.forEach((vmKey, idx) => {
      const vmChecked = isVmSelected(vmKey);
      const isVmExpanded = expandedVMs.has(vmKey);
      const vmData = vmByKey.get(vmKey);

      if (!vmData) return;

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
    });

    return result;
  }, [
    realFolderEntries,
    rootVmKeys,
    level1SetSize,
    selectedSet,
    expandedFolders,
    canSelect,
    onCheckChange,
    slug,
    toggleSet,
    setExpandedFolders,
    expandedVMs,
    vmByKey,
    setExpandedVMs,
    visibleVmIdsRef,
  ]);

  return {
    folderToVmKeys,
    groupVMCountByFolder,
    rows,
    selectedVmKeys,
    setSelectedVmKeys,
    setShowAll,
    showAll,
  };
};
