import { type Dispatch, type MutableRefObject, type SetStateAction, useMemo } from 'react';
import type { ProviderVmData } from 'src/utils/types';

import type { ProviderHost, VSphereResource } from '@forklift-ui/types';

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
  folderToVmKeys: Map<string, string[]>;
  groupVMCountByFolder: Map<string, number>;
  rows: RowNode[];
  selectedVmKeys: string[];
  setSelectedVmKeys: Dispatch<SetStateAction<string[]>>;
  setShowAll: Dispatch<SetStateAction<boolean>>;
  showAll: boolean;
};

type UseTreeRows = (args: {
  canSelect: boolean;
  controls?: UseTreeRowsControls;
  foldersDict: Record<string, VSphereResource>;
  hostsDict: Record<string, ProviderHost>;
  visibleVmIdsRef?: MutableRefObject<Set<string> | undefined>;
  vmDataArr: ProviderVmData[] | undefined;
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

    for (const [folderIdx, [folderName, vmIdsInFolder]] of realFolderEntries.entries()) {
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
