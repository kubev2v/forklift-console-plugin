import type { V1beta1Provider, V1beta1StorageMapSpecMapSource } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';
import { PROVIDER_TYPES } from '@utils/providers/constants';
import { type AccessMode, StorageMapFieldId, type StorageMapping } from '@utils/storage/types';

import { buildStorageMappings, getStorageMappingValues } from '../buildStorageMappings';

const makeProvider = (type: string): V1beta1Provider =>
  ({ spec: { type } }) as unknown as V1beta1Provider;

const makeMapping = (
  sourceName: string,
  targetName: string,
  accessMode?: AccessMode,
): StorageMapping => ({
  [StorageMapFieldId.SourceStorage]: { id: sourceName, name: sourceName },
  [StorageMapFieldId.TargetStorage]: { name: targetName },
  ...(accessMode !== undefined && { [StorageMapFieldId.AccessMode]: accessMode }),
});

const vsphereProvider = makeProvider(PROVIDER_TYPES.vsphere);

describe('buildStorageMappings - accessMode', () => {
  it('includes accessMode in destination when ReadWriteMany is specified', () => {
    const mappings = [makeMapping('datastore-1', 'ceph-rbd', 'ReadWriteMany')];
    const result = buildStorageMappings(mappings, vsphereProvider);

    expect(result[0].destination).toEqual({
      accessMode: 'ReadWriteMany',
      storageClass: 'ceph-rbd',
    });
  });

  it('includes accessMode in destination when ReadOnlyMany is specified', () => {
    const mappings = [makeMapping('datastore-1', 'nfs-sc', 'ReadOnlyMany')];
    const result = buildStorageMappings(mappings, vsphereProvider);

    expect(result[0].destination).toEqual({
      accessMode: 'ReadOnlyMany',
      storageClass: 'nfs-sc',
    });
  });

  it('includes ReadWriteOnce in destination when specified explicitly', () => {
    const mappings = [makeMapping('datastore-1', 'thin', 'ReadWriteOnce')];
    const result = buildStorageMappings(mappings, vsphereProvider);

    expect(result[0].destination).toEqual({
      accessMode: 'ReadWriteOnce',
      storageClass: 'thin',
    });
  });

  it('omits accessMode from destination when not specified in mapping', () => {
    const mappings = [makeMapping('datastore-1', 'thin')];
    const result = buildStorageMappings(mappings, vsphereProvider);

    expect(result[0].destination).toEqual({ storageClass: 'thin' });
    expect(result[0].destination).not.toHaveProperty('accessMode');
  });

  it('passes accessMode through for OpenShift provider', () => {
    const openShiftProvider = makeProvider(PROVIDER_TYPES.openshift);
    const mappings = [makeMapping('/pvc-1', 'ceph-rbd', 'ReadWriteMany')];
    const result = buildStorageMappings(mappings, openShiftProvider);

    expect(result[0].destination).toEqual({
      accessMode: 'ReadWriteMany',
      storageClass: 'ceph-rbd',
    });
  });
});

describe('getStorageMappingValues - accessMode', () => {
  const emptyStorages = new Map();

  it('reads ReadWriteMany from destination spec', () => {
    const specMappings = [
      {
        destination: { accessMode: 'ReadWriteMany' as AccessMode, storageClass: 'ceph-rbd' },
        source: { id: 'datastore-1' } as V1beta1StorageMapSpecMapSource,
      },
    ];
    const result = getStorageMappingValues(specMappings, vsphereProvider, emptyStorages);

    expect(result[0][StorageMapFieldId.AccessMode]).toBe('ReadWriteMany');
  });

  it('reads ReadOnlyMany from destination spec', () => {
    const specMappings = [
      {
        destination: { accessMode: 'ReadOnlyMany' as AccessMode, storageClass: 'nfs-sc' },
        source: { id: 'datastore-1' } as V1beta1StorageMapSpecMapSource,
      },
    ];
    const result = getStorageMappingValues(specMappings, vsphereProvider, emptyStorages);

    expect(result[0][StorageMapFieldId.AccessMode]).toBe('ReadOnlyMany');
  });

  it('defaults to undefined when accessMode is absent from spec', () => {
    const specMappings = [
      {
        destination: { storageClass: 'thin' },
        source: { id: 'datastore-1' } as V1beta1StorageMapSpecMapSource,
      },
    ];
    const result = getStorageMappingValues(specMappings, vsphereProvider, emptyStorages);

    expect(result[0][StorageMapFieldId.AccessMode]).toBeUndefined();
  });
});
