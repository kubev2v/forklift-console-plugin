import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sCreate = jest.fn();
const builtMap = [{ destination: { type: 'pod' }, source: { id: '1' } }];
const mockBuild = jest.fn((..._args: unknown[]) => builtMap);

jest.mock('@openshift-console/dynamic-plugin-sdk', (): unknown => ({
  k8sCreate: (...args: unknown[]): unknown =>
    (mockK8sCreate as (...a: unknown[]) => unknown)(...args),
}));

jest.mock('../buildNetworkMappings', (): unknown => ({
  buildNetworkMappings: (...args: unknown[]): unknown =>
    (mockBuild as (...a: unknown[]) => unknown)(...args),
}));

import { NetworkMapModel } from '@forklift-ui/types';

import { createNetworkMap } from '../createNetworkMap';

describe('createNetworkMap - create', () => {
  beforeEach(() => {
    mockBuild.mockClear();
    mockK8sCreate.mockReset();
    mockK8sCreate.mockImplementation((...args: unknown[]) => {
      const [{ data }] = args as [{ data: unknown }];
      return Promise.resolve(data);
    });
  });

  it('creates a network map with mappings and telemetry', async () => {
    const trackEvent = jest.fn();
    const mappings = [{ sourceNetwork: { name: 's' }, targetNetwork: { name: 't' } }] as never;
    const sourceProvider = {
      metadata: { name: 'src', namespace: 'ns', uid: '1' },
      spec: { type: 'vsphere' },
    } as never;
    const targetProvider = {
      metadata: { name: 'dst', namespace: 'ns', uid: '2' },
      spec: { type: 'openshift' },
    } as never;

    const result = await createNetworkMap({
      mappings,
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
    expect(mockBuild).toHaveBeenCalledWith(mappings, sourceProvider);
    expect(mockK8sCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          kind: 'NetworkMap',
          metadata: expect.objectContaining({ name: 'nm-1', namespace: 'ns' }),
          spec: expect.objectContaining({
            map: builtMap,
            provider: expect.objectContaining({
              destination: expect.objectContaining({ name: 'dst', uid: '2' }),
              source: expect.objectContaining({ name: 'src', uid: '1' }),
            }),
          }),
        }),
        model: NetworkMapModel,
      }),
    );
    expect(trackEvent).toHaveBeenCalledWith(
      'Network map created',
      expect.objectContaining({ mappingCount: 1, networkMapName: 'nm-1' }),
    );
    expect(result.metadata?.name).toBe('nm-1');
  });
});
