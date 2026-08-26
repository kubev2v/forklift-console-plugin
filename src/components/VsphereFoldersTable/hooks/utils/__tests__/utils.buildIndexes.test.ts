import type { ProviderVmData } from 'src/utils/types';

import { FOLDER_PREFIX, NO_FOLDER } from '../constants';
import { buildIndexes, getFolderNameFromKey, isFolderChecked } from '../utils';

const makeVmData = (
  id: string,
  name: string,
  parentId: string,
  hostId: string,
): ProviderVmData => ({
  name,
  namespace: 'ns',
  vm: {
    concerns: [{ category: 'Warning', label: 'warn' }],
    host: hostId,
    id,
    name,
    parent: { id: parentId, kind: 'Folder' },
    path: `/dc/${name}`,
    powerState: 'poweredOn',
    providerType: 'vsphere',
  } as never,
});

describe('utils - buildIndexes', () => {
  const foldersDict = {
    'folder-1': { id: 'folder-1', name: 'Prod', path: '/Prod' },
  } as never;
  const hostsDict = {
    'host-1': { id: 'host-1', name: 'esxi-1' },
  } as never;

  it('returns empty indexes for undefined or empty vm arrays', () => {
    expect(buildIndexes(undefined, foldersDict, hostsDict).vmByKey.size).toBe(0);
    expect(buildIndexes([], foldersDict, hostsDict).folderToVmKeys.size).toBe(0);
  });

  it('indexes vms by folder and host and sorts by name', () => {
    const vms = [
      makeVmData('2', 'bravo', 'folder-1', 'host-1'),
      makeVmData('1', 'alpha', 'folder-1', 'host-1'),
      makeVmData('3', 'root-vm', 'missing', 'missing-host'),
    ];

    const { folderToVmKeys, tokensByVmKey, vmByKey } = buildIndexes(vms, foldersDict, hostsDict);

    expect(folderToVmKeys.get('Prod')).toEqual(['1', '2']);
    expect(folderToVmKeys.get(NO_FOLDER)).toEqual(['3']);
    expect(vmByKey.get('1')?.hostName).toBe('esxi-1');
    expect(vmByKey.get('1')?.folderName).toBe('Prod');
    expect(vmByKey.get('3')?.folderName).toBe(NO_FOLDER);
    expect(vmByKey.get('3')?.hostName).toBe('');
    expect(tokensByVmKey.get('1')).toMatchObject({
      host: 'esxi-1',
      name: 'alpha',
      path: '/dc/alpha',
      power: 'on',
    });
  });

  it('isFolderChecked returns false, true, or indeterminate', () => {
    const selected = new Set(['a', 'b']);
    expect(isFolderChecked([], selected)).toBe(false);
    expect(isFolderChecked(['a', 'b'], selected)).toBe(true);
    expect(isFolderChecked(['a', 'c'], selected)).toBeNull();
    expect(isFolderChecked(['c'], selected)).toBe(false);
  });

  it('getFolderNameFromKey strips folder prefix', () => {
    expect(getFolderNameFromKey(`${FOLDER_PREFIX}Prod`)).toBe('Prod');
    expect(getFolderNameFromKey('Prod')).toBe('Prod');
    expect(getFolderNameFromKey(FOLDER_PREFIX)).toBe('');
  });
});
