import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sCreate = jest.fn();
const mockBuild = jest.fn(() => [{ source: { id: '1' }, destination: { type: 'pod' } }]);

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: (...args: unknown[]) => mockK8sCreate(...args),
}));

jest.mock('../buildNetworkMappings', () => ({
  buildNetworkMappings: (...args: unknown[]) => mockBuild(...args),
}));

import { NetworkMapModel } from '@forklift-ui/types';

import { createNetworkMap } from '../createNetworkMap';

describe('createNetworkMap - create', () => {
  beforeEach(() => {
    mockK8sCreate.mockReset();
    mockK8sCreate.mockImplementation(async ({ data }) => data);
  });

  it('creates a network map and tracks start event', async () => {
    const trackEvent = jest.fn();
    const sourceProvider = {
      metadata: { name: 'src', namespace: 'ns', uid: '1' },
      spec: { type: 'vsphere' },
    } as never;
    const targetProvider = {
      metadata: { name: 'dst', namespace: 'ns', uid: '2' },
      spec: { type: 'openshift' },
    } as never;

    const result = await createNetworkMap({
      mappings: [{ sourceNetwork: { name: 's' }, targetNetwork: { name: 't' } }] as never,
      name: 'nm-1',
      project: 'ns',
      sourceProvider,
      targetProvider,
      trackEvent,
    });

    expect(trackEvent).toHaveBeenCalledWith(
      'Network map create started',
      expect.objectContaining({ mappingCount: 1, namespace: 'ns' }),
    );
    expect(mockK8sCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          kind: 'NetworkMap',
          metadata: expect.objectContaining({ name: 'nm-1', namespace: 'ns' }),
        }),
        model: NetworkMapModel,
      }),
    );
    expect(result.metadata?.name).toBe('nm-1');
  });
});
