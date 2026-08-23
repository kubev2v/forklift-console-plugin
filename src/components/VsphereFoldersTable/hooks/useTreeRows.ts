import { type Dispatch, type MutableRefObject, type SetStateAction, useMemo } from 'react';
import type { ProviderVmData } from 'src/utils/types';

import type { ProviderHost, VSphereResource } from '@forklift-ui/types';

import type { RowNode } from '../utils/types';

import { buildTreeRows } from './utils/buildTreeRows';
import { partitionFolderEntries } from './utils/treeRowBuilders';
import type { UseTreeRowsControls } from './utils/types';
import { buildIndexes } from './utils/utils';
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

  const rows = useMemo(
    () =>
      buildTreeRows({
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
      }),
    [
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
    ],
  );

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
