import { getVmPowerState } from 'src/providers/details/tabs/VirtualMachines/utils/helpers/getVmPowerState';
import type { ProviderVmData } from 'src/utils/types';

import type { ProviderHost, VSphereResource, VSphereVM } from '@kubev2v/types';

import { FOLDER_PREFIX, NO_FOLDER } from './constants';
import type { FolderKey, Indexes, VmKey, VmLookups } from './types';

export const buildIndexes = (
  vmDataArr: ProviderVmData[] | undefined,
  foldersDict: Record<string, VSphereResource>,
  hostsDict: Record<string, ProviderHost>,
): Indexes => {
  const vmByKey = new Map<VmKey, ProviderVmData>();
  const folderToVmKeys = new Map<FolderKey, VmKey[]>();
  const tokensByVmKey = new Map<VmKey, VmLookups>();

  if (!vmDataArr?.length) {
    return { folderToVmKeys, tokensByVmKey, vmByKey };
  }

  for (const vmData of vmDataArr) {
    const vm = vmData.vm as VSphereVM;
    const key: VmKey = vm?.id;
    const folder = foldersDict[vm.parent?.id];
    const folderName = folder?.name ?? NO_FOLDER;
    const host = hostsDict[vm.host] as { name: string } | undefined;
    const hostName = host?.name ?? '';
    const enhancedVmData: ProviderVmData = {
      ...vmData,
      folderName,
      hostName,
    };
    vmByKey.set(key, enhancedVmData);

    let list = folderToVmKeys.get(folderName);
    if (!list) {
      list = [];
      folderToVmKeys.set(folderName, list);
    }
    list.push(key);

    tokensByVmKey.set(key, {
      concerns: vm.concerns || [],
      host: hostName.toLowerCase(),
      name: vm?.name?.toLowerCase() ?? '',
      path: vm.path,
      power: getVmPowerState(vmData.vm) ?? '',
    });
  }

  for (const [_, keys] of folderToVmKeys) {
    keys.sort((first, second) => {
      const ta = tokensByVmKey.get(first)!;
      const tb = tokensByVmKey.get(second)!;

      return ta.name!.localeCompare(tb.name!);
    });
  }

  return {
    folderToVmKeys,
    tokensByVmKey,
    vmByKey,
  };
};

export const isFolderChecked = (
  vmIdsInFolder: string[],
  selectedSet: Set<string>,
): boolean | null => {
  const total = vmIdsInFolder.length;
  if (total === 0) return false;
  let selected = 0;

  for (const id of vmIdsInFolder) {
    if (selectedSet.has(id)) {
      selected += 1;
      if (selected === total) return true;
    }
  }
  return selected > 0 ? null : false;
};

export const getFolderNameFromKey = (key: string): string =>
  key.startsWith(FOLDER_PREFIX) ? key.slice(FOLDER_PREFIX.length) : key;
