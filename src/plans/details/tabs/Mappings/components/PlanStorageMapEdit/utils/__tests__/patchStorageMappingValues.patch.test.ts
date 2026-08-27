import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn((..._args: unknown[]) => Promise.resolve({}));
const mockTransform = jest.fn(() => ({ spec: { map: [{ source: { id: 's' } }] } }));

jest.mock('@openshift-console/dynamic-plugin-sdk', (): unknown => ({
  k8sPatch: (...args: unknown[]): unknown =>
    (mockK8sPatch as (...a: unknown[]) => unknown)(...args),
}));

jest.mock('src/storageMaps/details/utils/utils', (): unknown => ({
  transformFormValuesToK8sSpec: (...args: unknown[]): unknown =>
    (mockTransform as (...a: unknown[]) => unknown)(...args),
}));

import { StorageMapModel } from '@forklift-ui/types';
import { StorageMapFieldId } from '@utils/storage/types';

import { patchStorageMappingValues } from '../utils';

const nonEmptyRow = {
  [StorageMapFieldId.SourceStorage]: { id: 's', name: 's' },
  [StorageMapFieldId.TargetStorage]: { id: 't', name: 't' },
};
const emptyRow = {
  [StorageMapFieldId.SourceStorage]: { id: '', name: '' },
  [StorageMapFieldId.TargetStorage]: { id: '', name: '' },
};
const formValues = { storageMap: [nonEmptyRow, emptyRow] } as never;
const vsphereProvider = { spec: { type: 'vsphere' } } as never;

describe('patchStorageMappingValues - patch', () => {
  beforeEach(() => {
    mockK8sPatch.mockReset();
    mockK8sPatch.mockResolvedValue({});
    mockTransform.mockClear();
  });

  it('filters empty rows and ADDs when map is empty', async () => {
    const storageMap = { metadata: { name: 'sm' }, spec: { map: [] } } as never;

    await patchStorageMappingValues(formValues, storageMap, vsphereProvider);

    expect(mockTransform).toHaveBeenCalledWith(
      { storageMap: [nonEmptyRow] },
      storageMap,
      false,
    );
    expect(mockK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [{ op: 'add', path: '/spec/map', value: [{ source: { id: 's' } }] }],
        model: StorageMapModel,
        resource: storageMap,
      }),
    );
  });

  it('REPLACEs when spec.map is non-empty', async () => {
    const storageMap = {
      metadata: { name: 'sm' },
      spec: { map: [{ source: { id: 'old' } }] },
    } as never;

    await patchStorageMappingValues(formValues, storageMap, vsphereProvider);

    expect(mockK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [{ op: 'replace', path: '/spec/map', value: [{ source: { id: 's' } }] }],
        model: StorageMapModel,
        resource: storageMap,
      }),
    );
  });

  it('skips patch when transform returns undefined', async () => {
    mockTransform.mockReturnValueOnce(undefined as never);
    await patchStorageMappingValues({ storageMap: [] }, {} as never, {} as never);
    expect(mockK8sPatch).not.toHaveBeenCalled();
  });
});
