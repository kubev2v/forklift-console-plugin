import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn();
const mockTransform = jest.fn(() => ({ spec: { map: [{ source: { id: 's' } }] } }));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]) => mockK8sPatch(...args),
}));

jest.mock('src/storageMaps/details/utils/utils', () => ({
  transformFormValuesToK8sSpec: (...args: unknown[]) => mockTransform(...args),
}));

import { StorageMapModel } from '@forklift-ui/types';
import { StorageMapFieldId } from '@utils/storage/types';

import { patchStorageMappingValues } from '../utils';

describe('patchStorageMappingValues - patch', () => {
  beforeEach(() => {
    mockK8sPatch.mockReset();
    mockK8sPatch.mockResolvedValue({});
    mockTransform.mockClear();
  });

  it('filters empty rows and patches storage map', async () => {
    const storageMap = { metadata: { name: 'sm' }, spec: { map: [] } } as never;
    const formValues = {
      storageMap: [
        {
          [StorageMapFieldId.SourceStorage]: { id: 's', name: 's' },
          [StorageMapFieldId.TargetStorage]: { id: 't', name: 't' },
        },
        {
          [StorageMapFieldId.SourceStorage]: { id: '', name: '' },
          [StorageMapFieldId.TargetStorage]: { id: '', name: '' },
        },
      ],
    } as never;

    await patchStorageMappingValues(formValues, storageMap, {
      spec: { type: 'vsphere' },
    } as never);

    expect(mockTransform).toHaveBeenCalled();
    expect(mockK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [{ op: 'add', path: '/spec/map', value: [{ source: { id: 's' } }] }],
        model: StorageMapModel,
        resource: storageMap,
      }),
    );
  });

  it('skips patch when transform returns undefined', async () => {
    mockTransform.mockReturnValueOnce(undefined);
    await patchStorageMappingValues({ storageMap: [] } as never, {} as never, {} as never);
    expect(mockK8sPatch).not.toHaveBeenCalled();
  });
});
