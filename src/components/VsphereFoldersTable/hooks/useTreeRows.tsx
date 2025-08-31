import { type Dispatch, type SetStateAction, useMemo } from 'react';
import type { VmData } from 'src/modules/Providers/views/details/tabs/VirtualMachines/components/VMCellProps';

import type { ProviderHost, VSphereResource } from '@kubev2v/types';
import { FolderIcon, FolderOpenIcon, VirtualMachineIcon } from '@patternfly/react-icons';

import { ROW_TYPE, type RowNode } from '../utils/types';

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
};

type UseTreeRows = (args: {
  canSelect: boolean;
  controls?: UseTreeRowsControls;
  foldersDict: Record<string, VSphereResource>;
  hostsDict: Record<string, ProviderHost>;
  vmDataArr: VmData[] | undefined;
}) => UseTreeRowsReturnValue;

export const useTreeRows: UseTreeRows = ({
  canSelect,
  controls,
  foldersDict,
  hostsDict,
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

  const groupVMCountByFolder = useMemo(
    () =>
      new Map<string, number>(
        Array.from(folderToVmKeys, ([folderName, ids]) => [folderName, ids.length]),
      ),
    [folderToVmKeys],
  );

  const slug = useSlug();

  const rows = useMemo(() => {
    const result: RowNode[] = [];
    const folderEntries = Array.from(folderToVmKeys.entries());

    const isVmSelected = (id: string) => selectedSet.has(id);

    folderEntries.forEach(([folderName, vmIdsInFolder], folderIdx) => {
      const isExpanded = expandedFolders.has(folderName);
      const folderKey = `folder-${folderName}`;

      const folderChecked = isFolderChecked(vmIdsInFolder, selectedSet);

      result.push({
        folderName,
        isHidden: false,
        isSelected: folderChecked !== false, // folderChecked can be true/false/null where null represent partial selected.
        key: folderKey,
        treeRow: {
          ...(canSelect
            ? {
                onCheckChange: onCheckChange(vmIdsInFolder),
              }
            : {}),
          onCollapse: () => {
            toggleSet(setExpandedFolders, folderName);
          },
          props: {
            'aria-level': 1,
            'aria-posinset': folderIdx + 1,
            'aria-setsize': folderEntries.length,
            icon: isExpanded ? <FolderOpenIcon /> : <FolderIcon />,
            isExpanded,
            ...(canSelect
              ? {
                  checkboxId: `checkbox_id_folder_${slug(folderName)}`,
                  isChecked: folderChecked,
                }
              : {}),
          },
          rowIndex: result.length,
        },
        type: ROW_TYPE.Folder,
      });

      groupVMCountByFolder.set(folderName, vmIdsInFolder.length);

      vmIdsInFolder.forEach((vmKey, vmIdx) => {
        const isVmExpanded = expandedVMs.has(vmKey);
        const isHidden = !isExpanded;
        const vmChecked = isVmSelected(vmKey);
        const vmData = vmByKey.get(vmKey)!;

        result.push({
          isHidden,
          isSelected: vmChecked,
          key: `vm-${vmKey}`,
          parentFolderKey: folderKey,
          treeRow: {
            ...(canSelect
              ? {
                  onCheckChange: onCheckChange(vmKey),
                }
              : {}),
            onCollapse: () => {
              toggleSet(setExpandedVMs, vmKey);
            },
            props: {
              'aria-level': 2,
              'aria-posinset': vmIdx + 1,
              'aria-setsize': vmIdsInFolder.length,
              icon: <VirtualMachineIcon />,
              isExpanded: isVmExpanded,
              isHidden,
              ...(canSelect
                ? { checkboxId: `checkbox_id_vm_${slug(vmKey)}`, isChecked: vmChecked }
                : {}),
            },
            rowIndex: result.length,
          },
          type: ROW_TYPE.Vm,
          vmData,
        });

        result.push({
          isHidden: !isVmExpanded || isHidden,
          isSelected: vmChecked,
          key: `concerns-${vmKey}`,
          parentFolderKey: folderKey,
          type: ROW_TYPE.Concerns,
          vmData,
        });
      });
    });

    return result;
  }, [
    folderToVmKeys,
    selectedSet,
    expandedFolders,
    canSelect,
    onCheckChange,
    slug,
    groupVMCountByFolder,
    toggleSet,
    setExpandedFolders,
    expandedVMs,
    vmByKey,
    setExpandedVMs,
  ]);

  return {
    groupVMCountByFolder,
    rows,
    selectedVmKeys,
    setSelectedVmKeys,
    setShowAll,
    showAll,
  };
};
