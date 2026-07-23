import {
  getNetAppShiftLabels,
  isNetAppShiftStorageClassAnnotations,
  NETAPP_SHIFT_STORAGE_CLASS_TYPE_VALUE,
} from '@utils/storage/netAppShift';
import {
  StorageClassAnnotation,
  StorageMapFieldId,
  type TargetStorage,
} from '@utils/storage/types';

describe('isNetAppShiftStorageClassAnnotations', () => {
  it('is true when annotation is shift', () => {
    expect(
      isNetAppShiftStorageClassAnnotations({
        [StorageClassAnnotation.NetAppShiftStorageClassType]: 'shift',
      }),
    ).toBe(true);
  });

  it('is false when annotation is missing or not shift', () => {
    expect(isNetAppShiftStorageClassAnnotations(undefined)).toBe(false);
    expect(
      isNetAppShiftStorageClassAnnotations({
        [StorageClassAnnotation.NetAppShiftStorageClassType]: 'other',
      }),
    ).toBe(false);
  });
});

describe('getNetAppShiftLabels', () => {
  const shiftStorage: TargetStorage = {
    id: 'sc-1',
    isDefault: false,
    isDefaultVirt: false,
    isNetAppShift: true,
    name: 'netapp-sc',
  };

  const regularStorage: TargetStorage = {
    id: 'sc-2',
    isDefault: true,
    isDefaultVirt: false,
    name: 'standard-sc',
  };

  it('returns labels when a mapped target has isNetAppShift', () => {
    const mappings = [
      {
        [StorageMapFieldId.SourceStorage]: { name: 'src' },
        [StorageMapFieldId.TargetStorage]: { name: 'netapp-sc' },
      },
    ];

    expect(getNetAppShiftLabels(mappings, [shiftStorage, regularStorage])).toEqual({
      [StorageClassAnnotation.NetAppShiftStorageClassType]: NETAPP_SHIFT_STORAGE_CLASS_TYPE_VALUE,
    });
  });

  it('returns undefined when no mapped target has isNetAppShift', () => {
    const mappings = [
      {
        [StorageMapFieldId.SourceStorage]: { name: 'src' },
        [StorageMapFieldId.TargetStorage]: { name: 'standard-sc' },
      },
    ];

    expect(getNetAppShiftLabels(mappings, [shiftStorage, regularStorage])).toBeUndefined();
  });

  it('returns undefined for empty mappings', () => {
    expect(getNetAppShiftLabels([], [shiftStorage])).toBeUndefined();
  });
});
