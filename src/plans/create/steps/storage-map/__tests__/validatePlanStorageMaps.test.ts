import { OffloadPlugin } from 'src/storageMaps/utils/types';

import { describe, expect, it } from '@jest/globals';
import { StorageMapFieldId, type StorageMapping } from '@utils/storage/types';

import { validatePlanStorageMaps } from '../utils';

const mapping = (sourceId: string, targetName = 'sc-default'): StorageMapping => ({
  [StorageMapFieldId.SourceStorage]: { id: sourceId, name: `storage-${sourceId}` },
  [StorageMapFieldId.TargetStorage]: { name: targetName },
});

describe('validatePlanStorageMaps', () => {
  const usedSources = [
    { id: 'ds-1', name: 'datastore-1' },
    { id: 'ds-2', name: 'datastore-2' },
  ];

  it('returns undefined when all used storages are mapped', () => {
    const values = [mapping('ds-1'), mapping('ds-2')];
    expect(validatePlanStorageMaps(values, usedSources)).toBeUndefined();
  });

  it('returns error when a used storage is missing a mapping', () => {
    const values = [mapping('ds-1')];
    expect(validatePlanStorageMaps(values, usedSources)).toMatch(/require a mapping/i);
  });

  it('returns error when mappings are empty and sources are used', () => {
    expect(validatePlanStorageMaps([], usedSources)).toMatch(/require a mapping/i);
  });

  it('skips source validation when isOpenshift is true', () => {
    const values = [mapping('ds-1')];
    expect(validatePlanStorageMaps(values, usedSources, true)).toBeUndefined();
  });

  it('skips source validation when isIscsi is true', () => {
    const values = [mapping('ds-1')];
    expect(validatePlanStorageMaps(values, usedSources, false, true)).toBeUndefined();
  });

  it('still validates when isIscsi is false', () => {
    const values = [mapping('ds-1')];
    expect(validatePlanStorageMaps(values, usedSources, false, false)).toBeDefined();
  });

  it('returns error when offload fields are only partially set', () => {
    const values: StorageMapping[] = [
      {
        ...mapping('ds-1'),
        [StorageMapFieldId.OffloadPlugin]: OffloadPlugin.CsiVolumeImport,
      },
      mapping('ds-2'),
    ];

    expect(validatePlanStorageMaps(values, usedSources)).toMatch(/must be set/i);
  });
});
