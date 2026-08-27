import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: jest.fn(),
}));

import { NetworkMapModel } from '@forklift-ui/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import { copyNetworkMap } from '../copyNetworkMap';

const mockK8sCreate = k8sCreate as unknown as jest.Mock;

describe('copyNetworkMap - copy', () => {
  beforeEach(() => {
    mockK8sCreate.mockReset();
    mockK8sCreate.mockImplementation((...args: unknown[]) => {
      const [{ data }] = args as [{ data: Record<string, unknown> }];
      return Promise.resolve(data);
    });
  });

  it('creates a plan-prefixed network map copy', async () => {
    const existing = {
      apiVersion: 'forklift.konveyor.io/v1beta1',
      kind: 'NetworkMap',
      metadata: { annotations: { a: '1' }, labels: { x: 'y' }, name: 'nm' },
      spec: { map: [{ destination: {}, source: {} }] },
    } as never;

    await copyNetworkMap(existing, 'plan-a', 'ns-1');

    expect(mockK8sCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        metadata: expect.objectContaining({
          annotations: { a: '1' },
          labels: { x: 'y' },
          name: 'plan-a-nm',
          namespace: 'ns-1',
        }),
        spec: { map: [{ destination: {}, source: {} }] },
      }),
      model: NetworkMapModel,
    });
  });

  it('omits labels and annotations when absent', async () => {
    const existing = {
      metadata: { name: 'nm' },
      spec: {},
    } as never;

    await copyNetworkMap(existing, 'p', 'ns');

    const [firstCall] = mockK8sCreate.mock.calls;
    const [createArg] = firstCall as [
      { data: { metadata: { annotations?: unknown; labels?: unknown }; spec: unknown } },
    ];
    const { data } = createArg;
    expect(data.metadata.labels).toBeUndefined();
    expect(data.metadata.annotations).toBeUndefined();
    expect(data.spec).toEqual({});
  });
});
