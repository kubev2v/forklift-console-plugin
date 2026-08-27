import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn((..._args: unknown[]) => Promise.resolve({}));
const mockBuildNetworkMappings = jest.fn(() => [{ source: { id: '1' } }]);

jest.mock('@openshift-console/dynamic-plugin-sdk', (): unknown => ({
  k8sPatch: (...args: unknown[]): unknown =>
    (mockK8sPatch as (...a: unknown[]) => unknown)(...args),
}));

jest.mock('src/networkMaps/create/utils/buildNetworkMappings', (): unknown => ({
  buildNetworkMappings: (...args: unknown[]): unknown =>
    (mockBuildNetworkMappings as (...a: unknown[]) => unknown)(...args),
}));

import { NetworkMapModel } from '@forklift-ui/types';

import { patchNetworkMappingValues } from '../utils';

describe('patchNetworkMappingValues - patch', () => {
  beforeEach(() => {
    mockK8sPatch.mockReset();
    mockK8sPatch.mockResolvedValue({});
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
    expect(
      (mockK8sPatch.mock.calls[1] as unknown as [{ data: { op: string }[] }])[0].data[0].op,
    ).toBe('replace');
  });
});
