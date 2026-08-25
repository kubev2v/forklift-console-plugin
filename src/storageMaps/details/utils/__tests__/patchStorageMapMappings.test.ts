import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { StorageMapModel, type V1beta1StorageMap } from '@forklift-ui/types';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn<() => Promise<unknown>>();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: jest.fn((...args: unknown[]) => mockK8sPatch(...args)),
}));

import { patchStorageMapMappings } from '../patchStorageMapMappings';

const makeStorageMap = (map: unknown[] | undefined): V1beta1StorageMap =>
  ({
    metadata: { name: 'test-map', namespace: 'openshift-mtv' },
    spec: {
      map,
      provider: {},
    },
  }) as unknown as V1beta1StorageMap;

describe('patchStorageMapMappings', () => {
  beforeEach(() => {
    mockK8sPatch.mockReset();
    mockK8sPatch.mockResolvedValue({});
  });

  it('returns early without patching when transform yields nothing', async () => {
    const storageMap = { metadata: { name: 'test-map' } } as V1beta1StorageMap;

    await patchStorageMapMappings(
      {
        storageMap: [
          {
            sourceStorage: { id: 'ds-1', name: 'source-ds-1' },
            targetStorage: { name: 'thin' },
          },
        ],
      },
      storageMap,
      undefined,
    );

    expect(mockK8sPatch).not.toHaveBeenCalled();
  });

  it('filters incomplete rows and uses ADD when map is empty', async () => {
    const storageMap = makeStorageMap([]);

    await patchStorageMapMappings(
      {
        storageMap: [
          {
            sourceStorage: { id: 'ds-1', name: 'source-ds-1' },
            targetStorage: { name: 'thin' },
          },
          {
            sourceStorage: { name: '' },
            targetStorage: { name: '' },
          },
        ],
      },
      storageMap,
      undefined,
    );

    expect(mockK8sPatch).toHaveBeenCalledWith({
      data: [
        {
          op: ADD,
          path: '/spec/map',
          value: [
            {
              destination: { storageClass: 'thin' },
              source: { id: 'ds-1', name: 'source-ds-1' },
            },
          ],
        },
      ],
      model: StorageMapModel,
      resource: storageMap,
    });
  });

  it('uses REPLACE when existing map is non-empty', async () => {
    const storageMap = makeStorageMap([
      {
        destination: { storageClass: 'old' },
        source: { id: 'ds-1', name: 'source-ds-1' },
      },
    ]);

    await patchStorageMapMappings(
      {
        storageMap: [
          {
            sourceStorage: { id: 'ds-1', name: 'source-ds-1' },
            targetStorage: { name: 'thin' },
          },
        ],
      },
      storageMap,
      undefined,
    );

    expect(mockK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [expect.objectContaining({ op: REPLACE, path: '/spec/map' })],
      }),
    );
  });
});
