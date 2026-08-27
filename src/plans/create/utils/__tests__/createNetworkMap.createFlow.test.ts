import { NetworkMapModel } from '@forklift-ui/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import { MULTUS, POD } from '@utils/constants';

import { createNetworkMap } from '../createNetworkMap';

import {
  baseParams,
  createdNetworkMap,
  emptySourceMapping,
  multusMapping,
  podTargetMapping,
  vsphereProvider,
} from './createNetworkMap.fixtures';

jest.mock('@openshift-console/dynamic-plugin-sdk', (): unknown => ({
  k8sCreate: jest.fn(),
}));

const mockCreate = k8sCreate as jest.MockedFunction<typeof k8sCreate>;

describe('createNetworkMap - create flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate.mockResolvedValue(createdNetworkMap);
  });

  it('skips mappings without a source name and still creates', async () => {
    await createNetworkMap({
      ...baseParams,
      mappings: [emptySourceMapping, multusMapping],
    });

    const data = mockCreate.mock.calls[0][0].data as {
      spec: { map: unknown[] };
    };
    expect(data.spec.map).toHaveLength(1);
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ model: NetworkMapModel }));
  });

  it('sets generateName when name is omitted', async () => {
    await createNetworkMap({
      ...baseParams,
      mappings: [multusMapping],
      name: undefined,
    });

    const data = mockCreate.mock.calls[0][0].data as {
      metadata: { generateName?: string; name?: string };
    };
    expect(data.metadata.name).toBeUndefined();
    expect(data.metadata.generateName).toBe(`${vsphereProvider.metadata?.name}-`);
  });

  it('tracks start/success events with network types', async () => {
    const trackEvent = jest.fn();

    await createNetworkMap({
      ...baseParams,
      mappings: [multusMapping, podTargetMapping],
      trackEvent,
    });

    expect(trackEvent).toHaveBeenNthCalledWith(
      1,
      'Network map create started',
      expect.objectContaining({
        mappingCount: 2,
        networkTypes: [MULTUS, POD],
        sourceProviderType: 'vsphere',
      }),
    );
    expect(trackEvent).toHaveBeenNthCalledWith(
      2,
      'Network map created',
      expect.objectContaining({ networkMapName: 'net-map-1' }),
    );
  });

  it('tracks failure and rethrows when k8sCreate rejects', async () => {
    const trackEvent = jest.fn();
    mockCreate.mockRejectedValue(new Error('create failed'));

    await expect(
      createNetworkMap({ ...baseParams, mappings: [multusMapping], trackEvent }),
    ).rejects.toThrow('create failed');

    expect(trackEvent).toHaveBeenCalledWith(
      'Network map create failed',
      expect.objectContaining({ error: 'create failed' }),
    );
  });

  it('handles undefined mappings as empty map', async () => {
    await createNetworkMap({ ...baseParams, mappings: undefined as never });

    const data = mockCreate.mock.calls[0][0].data as { spec: { map: unknown[] } };
    expect(data.spec.map).toEqual([]);
  });
});
