import { OffloadPlugin, StorageMapFieldId, type StorageMapping } from 'src/storageMaps/utils/types';

import { validateStorageMaps } from '../utils';

const validMapping = (overrides?: Partial<StorageMapping>): StorageMapping => ({
  [StorageMapFieldId.SourceStorage]: { name: 'datastore-1' },
  [StorageMapFieldId.TargetStorage]: { name: 'sc-standard' },
  ...overrides,
});

describe('validateStorageMaps', () => {
  it('returns undefined for a valid mapping without offload fields', () => {
    expect(validateStorageMaps([validMapping()])).toBeUndefined();
  });

  it('returns undefined when all three offload fields are filled', () => {
    expect(
      validateStorageMaps([
        validMapping({
          [StorageMapFieldId.OffloadPlugin]: OffloadPlugin.VSphereXcopyConfig,
          [StorageMapFieldId.StorageSecret]: 'my-secret',
          [StorageMapFieldId.StorageProduct]: 'ontap',
        }),
      ]),
    ).toBeUndefined();
  });

  it('returns an error when only the offload plugin is set', () => {
    expect(
      validateStorageMaps([
        validMapping({
          [StorageMapFieldId.OffloadPlugin]: OffloadPlugin.VSphereXcopyConfig,
        }),
      ]),
    ).toBeDefined();
  });

  it('returns an error when plugin and secret are set but product is missing', () => {
    expect(
      validateStorageMaps([
        validMapping({
          [StorageMapFieldId.OffloadPlugin]: OffloadPlugin.VSphereXcopyConfig,
          [StorageMapFieldId.StorageSecret]: 'my-secret',
        }),
      ]),
    ).toBeDefined();
  });

  it('returns an error when only the storage product is set', () => {
    expect(
      validateStorageMaps([
        validMapping({
          [StorageMapFieldId.StorageProduct]: 'ontap',
        }),
      ]),
    ).toBeDefined();
  });

  it('returns an error for partial offload in any row of a multi-row mapping', () => {
    expect(
      validateStorageMaps([
        validMapping(),
        validMapping({
          [StorageMapFieldId.OffloadPlugin]: OffloadPlugin.VSphereXcopyConfig,
        }),
      ]),
    ).toBeDefined();
  });

  it('returns undefined when multiple rows all have complete offload', () => {
    const fullOffload: Partial<StorageMapping> = {
      [StorageMapFieldId.OffloadPlugin]: OffloadPlugin.VSphereXcopyConfig,
      [StorageMapFieldId.StorageSecret]: 'my-secret',
      [StorageMapFieldId.StorageProduct]: 'ontap',
    };

    expect(
      validateStorageMaps([
        validMapping(fullOffload),
        validMapping({
          ...fullOffload,
          [StorageMapFieldId.SourceStorage]: { name: 'datastore-2' },
        }),
      ]),
    ).toBeUndefined();
  });
});
