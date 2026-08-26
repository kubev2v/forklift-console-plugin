import { describe, expect, it } from '@jest/globals';
import { StorageMapFieldId } from '@utils/storage/types';

import { validateStorageMaps } from '../utils';

const mapping = (source: string, target: string) =>
  ({
    [StorageMapFieldId.SourceStorage]: { name: source },
    [StorageMapFieldId.TargetStorage]: { name: target },
  }) as never;

describe('validateStorageMaps - validation', () => {
  it('rejects non-arrays and empty single row', () => {
    expect(validateStorageMaps(undefined as never)).toMatch(/Invalid mappings/i);
    expect(validateStorageMaps([mapping('', '')])).toMatch(/source and target storage/i);
  });

  it('rejects incomplete rows', () => {
    expect(validateStorageMaps([mapping('s', '')])).toMatch(/Each row must have both/i);
  });

  it('accepts complete rows', () => {
    expect(validateStorageMaps([mapping('s', 't')])).toBeUndefined();
  });
});
