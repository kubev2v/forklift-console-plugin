import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: jest.fn(),
}));

import { StorageMapModel } from '@forklift-ui/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import { copyStorageMap } from '../copyStorageMap';

const mockK8sCreate = k8sCreate as jest.MockedFunction<typeof k8sCreate>;

describe('copyStorageMap - copy', () => {
  beforeEach(() => {
    mockK8sCreate.mockReset();
    mockK8sCreate.mockImplementation(({ data }) => Promise.resolve(data));
  });

  it('creates a plan-prefixed copy preserving labels and annotations', async () => {
    const existing = {
      apiVersion: 'forklift.konveyor.io/v1beta1',
      kind: 'StorageMap',
      metadata: {
        annotations: { a: '1' },
        labels: { label: '2' },
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
          labels: { label: '2' },
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

    const [firstCall] = mockK8sCreate.mock.calls;
    const [createArg] = firstCall as [
      { data: { metadata: { annotations?: unknown; labels?: unknown } } },
    ];
    const { data } = createArg;
    expect(data.metadata.labels).toBeUndefined();
    expect(data.metadata.annotations).toBeUndefined();
  });
});
