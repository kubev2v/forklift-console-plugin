import { describe, expect, it } from '@jest/globals';
import { StorageMapFieldId } from '@utils/storage/types';

import { getStorageMapFieldId } from '../getStorageMapFieldId';

describe('getStorageMapFieldId - ids', () => {
  it('builds nested storage map field ids', () => {
    expect(getStorageMapFieldId(StorageMapFieldId.SourceStorage, 1)).toBe(
      `${StorageMapFieldId.StorageMap}.1.${StorageMapFieldId.SourceStorage}`,
    );
  });
});
