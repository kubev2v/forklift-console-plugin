import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import { StorageMapFieldId, type StorageMapping } from 'src/storageMaps/utils/types';

import type { V1beta1Provider, V1beta1StorageMapSpecMapSource } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';

import { buildStorageMappings, getStorageMappingValues } from '../buildStorageMappings';

const makeProvider = (type: string): V1beta1Provider =>
  ({ spec: { type } }) as unknown as V1beta1Provider;

const makeMapping = (sourceName: string, targetName: string): StorageMapping => ({
  [StorageMapFieldId.SourceStorage]: { id: sourceName, name: sourceName },
  [StorageMapFieldId.TargetStorage]: { name: targetName },
});

describe('buildStorageMappings - EC2', () => {
  const ec2Provider = makeProvider(PROVIDER_TYPES.ec2);

  it('uses name-based source mapping for EC2 provider', () => {
    const mappings = [makeMapping('gp3', 'gp3-csi')];
    const result = buildStorageMappings(mappings, ec2Provider);

    expect(result).toHaveLength(1);
    expect(result[0].source).toEqual({ name: 'gp3' });
    expect(result[0].destination).toEqual({ storageClass: 'gp3-csi' });
  });

  it('does not include id in EC2 source mapping', () => {
    const mappings = [makeMapping('io1', 'io1-csi')];
    const result = buildStorageMappings(mappings, ec2Provider);

    expect(result[0].source).not.toHaveProperty('id');
  });

  it('does not include offload plugin for EC2', () => {
    const mappings = [makeMapping('gp2', 'standard')];
    const result = buildStorageMappings(mappings, ec2Provider);

    expect(result[0]).not.toHaveProperty('offloadPlugin');
  });

  it('skips mappings with empty source name', () => {
    const mappings = [makeMapping('', 'standard')];
    const result = buildStorageMappings(mappings, ec2Provider);

    expect(result).toHaveLength(0);
  });

  it('handles multiple EC2 volume type mappings', () => {
    const mappings = [makeMapping('gp3', 'gp3-csi'), makeMapping('io1', 'io1-csi')];
    const result = buildStorageMappings(mappings, ec2Provider);

    expect(result).toHaveLength(2);
    expect(result[0].source).toEqual({ name: 'gp3' });
    expect(result[1].source).toEqual({ name: 'io1' });
  });

  it('uses id-based mapping for non-EC2 provider (vsphere)', () => {
    const vsphereProvider = makeProvider(PROVIDER_TYPES.vsphere);
    const mappings = [makeMapping('datastore-1', 'thin')];
    const result = buildStorageMappings(mappings, vsphereProvider);

    expect(result[0].source).toEqual({ id: 'datastore-1' });
    expect(result[0].source).not.toHaveProperty('name');
  });
});

describe('getStorageMappingValues - EC2', () => {
  const ec2Provider = makeProvider(PROVIDER_TYPES.ec2);
  const emptyStorages = new Map();

  it('resolves EC2 source storage from spec name', () => {
    const specMappings = [
      {
        destination: { storageClass: 'gp3-csi' },
        source: { name: 'gp3' } as V1beta1StorageMapSpecMapSource,
      },
    ];
    const result = getStorageMappingValues(specMappings, ec2Provider, emptyStorages);

    expect(result).toHaveLength(1);
    expect(result[0][StorageMapFieldId.SourceStorage]).toEqual({ name: 'gp3' });
    expect(result[0][StorageMapFieldId.TargetStorage]).toEqual({ name: 'gp3-csi' });
  });

  it('returns empty array for undefined spec mappings', () => {
    const result = getStorageMappingValues(undefined, ec2Provider, emptyStorages);
    expect(result).toEqual([]);
  });
});
