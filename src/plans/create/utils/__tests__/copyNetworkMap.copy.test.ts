import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: jest.fn(),
}));

import { NetworkMapModel } from '@forklift-ui/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import { copyNetworkMap } from '../copyNetworkMap';

const mockK8sCreate = k8sCreate as jest.Mock;

describe('copyNetworkMap - copy', () => {
  beforeEach(() => {
    mockK8sCreate.mockReset();
    mockK8sCreate.mockImplementation(({ data }: { data: unknown }) => Promise.resolve(data));
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
