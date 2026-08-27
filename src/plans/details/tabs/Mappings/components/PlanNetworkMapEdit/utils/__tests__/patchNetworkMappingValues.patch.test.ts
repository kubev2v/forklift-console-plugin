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

import { NetworkMapModel, type V1beta1NetworkMap, type V1beta1Provider } from '@forklift-ui/types';

import { patchNetworkMappingValues } from '../utils';

import type { PlanNetworkEditFormValues } from '../types';

const provider = { metadata: { name: 'src' } } as unknown as V1beta1Provider;
const formData = { networkMap: [{ source: { name: 'net' } }] } as unknown as PlanNetworkEditFormValues;

describe('patchNetworkMappingValues - patch', () => {
  beforeEach(() => {
    mockK8sPatch.mockReset();
    mockK8sPatch.mockResolvedValue({});
    mockBuildNetworkMappings.mockClear();
  });

  it('ADDs map when empty', async () => {
    const emptyMap = { metadata: { name: 'nm' }, spec: { map: [] } } as unknown as V1beta1NetworkMap;

    await patchNetworkMappingValues(formData, emptyMap, provider);

    expect(mockBuildNetworkMappings).toHaveBeenCalledWith(formData.networkMap, provider);
    expect(mockK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [{ op: 'add', path: '/spec/map', value: [{ source: { id: '1' } }] }],
        model: NetworkMapModel,
        resource: emptyMap,
      }),
    );
  });

  it('REPLACEs map when present', async () => {
    const existing = {
      metadata: { name: 'nm' },
      spec: { map: [{ source: {} }] },
    } as unknown as V1beta1NetworkMap;

    await patchNetworkMappingValues(formData, existing, provider);

    expect(mockBuildNetworkMappings).toHaveBeenCalledWith(formData.networkMap, provider);
    expect(mockK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [{ op: 'replace', path: '/spec/map', value: [{ source: { id: '1' } }] }],
        model: NetworkMapModel,
        resource: existing,
      }),
    );
  });
});
