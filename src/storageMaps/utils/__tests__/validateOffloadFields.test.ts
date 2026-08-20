import { OffloadPlugin } from 'src/storageMaps/utils/types';
import { validateOffloadFields } from 'src/storageMaps/utils/validateOffloadFields';

import { describe, expect, it } from '@jest/globals';
import { mockI18n } from '@test-utils/mockI18n';
import { StorageMapFieldId, type StorageMapping } from '@utils/storage/types';

mockI18n();

const baseMapping: StorageMapping = {
  [StorageMapFieldId.SourceStorage]: { id: 'ds-1', name: 'datastore-1' },
  [StorageMapFieldId.TargetStorage]: { name: 'sc-1' },
};

describe('validateOffloadFields', () => {
  it('returns undefined when all offload fields are empty', () => {
    expect(validateOffloadFields(baseMapping)).toBeUndefined();
  });

  it('returns an error when offload fields are partially filled', () => {
    expect(
      validateOffloadFields({
        ...baseMapping,
        [StorageMapFieldId.OffloadPlugin]: OffloadPlugin.CsiVolumeImport,
      }),
    ).toEqual(expect.stringContaining('must be set'));
  });

  it('returns undefined for valid CSI + primera3par', () => {
    expect(
      validateOffloadFields({
        ...baseMapping,
        [StorageMapFieldId.OffloadPlugin]: OffloadPlugin.CsiVolumeImport,
        [StorageMapFieldId.StorageProduct]: 'primera3par',
        [StorageMapFieldId.StorageSecret]: 'hpe-secret',
      }),
    ).toBeUndefined();
  });

  it('rejects CSI with a disallowed storage product', () => {
    expect(
      validateOffloadFields({
        ...baseMapping,
        [StorageMapFieldId.OffloadPlugin]: OffloadPlugin.CsiVolumeImport,
        [StorageMapFieldId.StorageProduct]: 'ontap',
        [StorageMapFieldId.StorageSecret]: 'netapp-secret',
      }),
    ).toBe('Selected storage product is not supported for this offload plugin');
  });

  it('rejects an unknown offload plugin when all fields are set', () => {
    expect(
      validateOffloadFields({
        ...baseMapping,
        [StorageMapFieldId.OffloadPlugin]: 'unknownPlugin',
        [StorageMapFieldId.StorageProduct]: 'primera3par',
        [StorageMapFieldId.StorageSecret]: 'hpe-secret',
      }),
    ).toBe('Selected offload plugin is not supported');
  });
});
