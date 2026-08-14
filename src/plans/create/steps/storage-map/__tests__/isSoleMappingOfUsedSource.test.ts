import { describe, expect, it } from '@jest/globals';
import { StorageMapFieldId, type StorageMapping } from '@utils/storage/types';
import type { MappingValue } from '@utils/types';

import { isSoleMappingOfUsedSource } from '../utils';

const usedSources: MappingValue[] = [
  { id: 'ds-used', name: 'ds-used' },
  { id: 'ds-other-used', name: 'ds-other-used' },
];

const mapping = (sourceId: string, targetName = 'sc-1'): StorageMapping => ({
  [StorageMapFieldId.SourceStorage]: { id: sourceId, name: sourceId },
  [StorageMapFieldId.TargetStorage]: { name: targetName },
});

describe('isSoleMappingOfUsedSource', () => {
  it('returns true when the row is the only mapping for a used source', () => {
    const storageMappings = [mapping('ds-used'), mapping('ds-other-used')];

    expect(isSoleMappingOfUsedSource(0, storageMappings, usedSources)).toBe(true);
    expect(isSoleMappingOfUsedSource(1, storageMappings, usedSources)).toBe(true);
  });

  it('returns false when another row still covers the used source', () => {
    const storageMappings = [
      mapping('ds-used', 'sc-1'),
      mapping('ds-used', 'sc-2'),
      mapping('ds-other-used'),
    ];

    expect(isSoleMappingOfUsedSource(0, storageMappings, usedSources)).toBe(false);
    expect(isSoleMappingOfUsedSource(1, storageMappings, usedSources)).toBe(false);
    expect(isSoleMappingOfUsedSource(2, storageMappings, usedSources)).toBe(true);
  });

  it('returns false for unused / empty source rows', () => {
    const storageMappings = [mapping('ds-unused'), mapping('')];

    expect(isSoleMappingOfUsedSource(0, storageMappings, usedSources)).toBe(false);
    expect(isSoleMappingOfUsedSource(1, storageMappings, usedSources)).toBe(false);
  });
});
