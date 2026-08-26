import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sCreate = jest.fn();
const mockBuild = jest.fn(() => [{ source: { id: '1' }, destination: { storageClass: 'sc' } }]);

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: (...args: unknown[]) => mockK8sCreate(...args),
}));

jest.mock('../buildStorageMappings', () => ({
  buildStorageMappings: (...args: unknown[]) => mockBuild(...args),
}));

import { StorageMapModel } from '@forklift-ui/types';

import { createStorageMap } from '../createStorageMap';

describe('createStorageMap - create', () => {
  beforeEach(() => {
    mockK8sCreate.mockReset();
    mockK8sCreate.mockImplementation(async ({ data }) => data);
  });

  it('creates a storage map resource', async () => {
    const result = await createStorageMap({
      mappings: [] as never,
      name: 'sm-1',
      project: 'ns',
      sourceProvider: {
        metadata: { name: 'src', namespace: 'ns', uid: '1' },
        spec: { type: 'vsphere' },
      } as never,
      targetProvider: {
        metadata: { name: 'dst', namespace: 'ns', uid: '2' },
        spec: { type: 'openshift' },
      } as never,
    });

    expect(mockK8sCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          kind: 'StorageMap',
          metadata: expect.objectContaining({ name: 'sm-1', namespace: 'ns' }),
        }),
        model: StorageMapModel,
      }),
    );
    expect(result.kind).toBe('StorageMap');
  });
});
