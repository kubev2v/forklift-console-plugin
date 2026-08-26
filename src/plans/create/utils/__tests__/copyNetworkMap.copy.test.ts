import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sCreate = jest.fn();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: (...args: unknown[]) => mockK8sCreate(...args),
}));

import { NetworkMapModel } from '@forklift-ui/types';

import { copyNetworkMap } from '../copyNetworkMap';

describe('copyNetworkMap - copy', () => {
  beforeEach(() => {
    mockK8sCreate.mockReset();
    mockK8sCreate.mockImplementation(async ({ data }) => data);
  });

  it('creates a plan-prefixed network map copy', async () => {
    const existing = {
      apiVersion: 'forklift.konveyor.io/v1beta1',
      kind: 'NetworkMap',
      metadata: { labels: { x: 'y' }, name: 'nm' },
      spec: { map: [{ destination: {}, source: {} }] },
    } as never;

    await copyNetworkMap(existing, 'plan-a', 'ns-1');

    expect(mockK8sCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        metadata: expect.objectContaining({
          labels: { x: 'y' },
          name: 'plan-a-nm',
          namespace: 'ns-1',
        }),
      }),
      model: NetworkMapModel,
    });
  });
});
