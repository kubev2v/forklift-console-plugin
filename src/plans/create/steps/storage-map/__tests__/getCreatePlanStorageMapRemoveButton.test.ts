import { describe, expect, it } from '@jest/globals';
import { StorageMapFieldId, type StorageMapping } from '@utils/storage/types';
import type { MappingValue } from '@utils/types';

import { getCreatePlanStorageMapRemoveButton } from '../getCreatePlanStorageMapRemoveButton';

const usedSources: MappingValue[] = [{ id: 'ds-used', name: 'ds-used' }];

const mapping = (sourceId: string, targetName = 'sc-1'): StorageMapping => ({
  [StorageMapFieldId.SourceStorage]: { id: sourceId, name: sourceId },
  [StorageMapFieldId.TargetStorage]: { name: targetName },
});

describe('getCreatePlanStorageMapRemoveButton', () => {
  it('disables remove and explains why when the row is the only mapping for a used source', () => {
    const storageMappings = [mapping('ds-used'), mapping('ds-other')];
    const remove = jest.fn();
    const button = getCreatePlanStorageMapRemoveButton({
      remove,
      storageMappingFieldsLength: storageMappings.length,
      storageMappings,
      t: (key) => key,
      usedSourceStorages: usedSources,
    });

    expect(button.isDisabled(0)).toBe(true);
    expect(button.tooltip(0)).toBe(
      'Cannot remove the only mapping for a storage used by the selected VMs.',
    );

    button.onClick(0);
    expect(remove).not.toHaveBeenCalled();
  });

  it('allows remove when another row still covers the used source', () => {
    const storageMappings = [mapping('ds-used', 'sc-1'), mapping('ds-used', 'sc-2')];
    const remove = jest.fn();
    const button = getCreatePlanStorageMapRemoveButton({
      remove,
      storageMappingFieldsLength: storageMappings.length,
      storageMappings,
      t: (key) => key,
      usedSourceStorages: usedSources,
    });

    expect(button.isDisabled(0)).toBe(false);
    expect(button.tooltip(0)).toBeUndefined();

    button.onClick(0);
    expect(remove).toHaveBeenCalledWith(0);
  });
});
