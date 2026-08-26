import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sCreate = jest.fn();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: (...args: unknown[]) => mockK8sCreate(...args),
}));

import { StorageMapModel } from '@forklift-ui/types';

import { copyStorageMap } from '../copyStorageMap';

describe('copyStorageMap - copy', () => {
  beforeEach(() => {
    mockK8sCreate.mockReset();
    mockK8sCreate.mockImplementation(async ({ data }) => data);
  });

  it('creates a plan-prefixed copy preserving labels and annotations', async () => {
    const existing = {
      apiVersion: 'forklift.konveyor.io/v1beta1',
      kind: 'StorageMap',
      metadata: {
        annotations: { a: '1' },
        labels: { l: '2' },
        name: 'existing-sm',
        namespace: 'old-ns',
      },
      spec: { map: [] },
    } as never;

    const result = await copyStorageMap(existing, 'my-plan', 'plan-ns');

    expect(mockK8sCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        metadata: {
          annotations: { a: '1' },
          labels: { l: '2' },
          name: 'my-plan-existing-sm',
          namespace: 'plan-ns',
        },
        spec: { map: [] },
      }),
      model: StorageMapModel,
    });
    expect(result.metadata?.name).toBe('my-plan-existing-sm');
  });

  it('omits labels and annotations when absent', async () => {
    const existing = {
      metadata: { name: 'sm' },
      spec: {},
    } as never;

    await copyStorageMap(existing, 'p', 'ns');

    const data = mockK8sCreate.mock.calls[0][0].data;
    expect(data.metadata.labels).toBeUndefined();
    expect(data.metadata.annotations).toBeUndefined();
  });
});
