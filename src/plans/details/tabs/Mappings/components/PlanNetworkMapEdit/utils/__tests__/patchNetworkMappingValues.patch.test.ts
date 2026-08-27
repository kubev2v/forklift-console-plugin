import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn();
const mockBuildNetworkMappings = jest.fn(() => [{ source: { id: '1' } }]);

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]): unknown => mockK8sPatch(...args),
}));

jest.mock('src/networkMaps/create/utils/buildNetworkMappings', () => ({
  buildNetworkMappings: (...args: unknown[]): unknown => mockBuildNetworkMappings(...args),
}));

import { NetworkMapModel } from '@forklift-ui/types';

import { patchNetworkMappingValues } from '../utils';

describe('patchNetworkMappingValues - patch', () => {
  beforeEach(() => {
    mockK8sPatch.mockReset();
    mockK8sPatch.mockResolvedValue(undefined as never);
    mockBuildNetworkMappings.mockClear();
  });

  it('ADDs map when empty and REPLACEs when present', async () => {
    const emptyMap = { metadata: { name: 'nm' }, spec: { map: [] } } as never;
    const provider = { metadata: { name: 'src' } } as never;
    const formData = { networkMap: [] } as never;

    await patchNetworkMappingValues(formData, emptyMap, provider);

    expect(mockK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [{ op: 'add', path: '/spec/map', value: [{ source: { id: '1' } }] }],
        model: NetworkMapModel,
        resource: emptyMap,
      }),
    );

    const existing = { metadata: { name: 'nm' }, spec: { map: [{ source: {} }] } } as never;
    await patchNetworkMappingValues(formData, existing, provider);
    expect(mockK8sPatch.mock.calls[1][0].data[0].op).toBe('replace');
  });
});
