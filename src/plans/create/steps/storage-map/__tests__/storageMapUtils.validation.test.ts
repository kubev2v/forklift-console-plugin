import { describe, expect, it } from '@jest/globals';

import { CreatePlanStorageMapFieldId } from '../constants';
import { isSoleMappingOfUsedSource, validatePlanStorageMaps } from '../utils';

const mapping = (id: string) =>
  ({
    [CreatePlanStorageMapFieldId.SourceStorage]: { id, name: id },
    [CreatePlanStorageMapFieldId.TargetStorage]: { id: 't', name: 't' },
  }) as never;

describe('storageMap utils - validation', () => {
  it('isSoleMappingOfUsedSource is true only for unique used sources', () => {
    const mappings = [mapping('a'), mapping('a'), mapping('b')];
    const used = [{ id: 'a', name: 'a' }, { id: 'b', name: 'b' }];

    expect(isSoleMappingOfUsedSource(0, mappings, used)).toBe(false);
    expect(isSoleMappingOfUsedSource(2, mappings, used)).toBe(true);
    expect(isSoleMappingOfUsedSource(0, mappings, [{ id: 'z', name: 'z' }])).toBe(false);
    expect(isSoleMappingOfUsedSource(0, [{ [CreatePlanStorageMapFieldId.SourceStorage]: {} } as never], used)).toBe(
      false,
    );
  });

  it('validatePlanStorageMaps requires used sources unless openshift or iscsi', () => {
    const used = [{ id: 'a', name: 'a' }];
    expect(validatePlanStorageMaps([], used)).toMatch(/require a mapping/i);
    expect(validatePlanStorageMaps([mapping('a')], used)).toBeUndefined();
    expect(validatePlanStorageMaps([], used, true)).toBeUndefined();
    expect(validatePlanStorageMaps([], used, false, true)).toBeUndefined();
  });
});
