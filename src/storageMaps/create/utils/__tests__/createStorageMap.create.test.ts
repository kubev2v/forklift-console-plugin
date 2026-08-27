import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sCreate = jest.fn();
const builtMap = [{ destination: { storageClass: 'sc' }, source: { id: '1' } }];
const mockBuild = jest.fn((..._args: unknown[]) => builtMap);

jest.mock('@openshift-console/dynamic-plugin-sdk', (): unknown => ({
  k8sCreate: (...args: unknown[]): unknown =>
    (mockK8sCreate as (...a: unknown[]) => unknown)(...args),
}));

jest.mock('../buildStorageMappings', (): unknown => ({
  buildStorageMappings: (...args: unknown[]): unknown =>
    (mockBuild as (...a: unknown[]) => unknown)(...args),
}));

import { StorageMapModel } from '@forklift-ui/types';
import { TELEMETRY_EVENTS } from '@utils/analytics/constants';
import { StorageMapFieldId } from '@utils/storage/types';

import { createStorageMap } from '../createStorageMap';

describe('createStorageMap - create', () => {
  beforeEach(() => {
    mockBuild.mockClear();
    mockK8sCreate.mockReset();
    mockK8sCreate.mockImplementation((...args: unknown[]) => {
      const [{ data }] = args as [{ data: unknown }];
      return Promise.resolve(data);
    });
  });

  it('creates a storage map with mappings and telemetry', async () => {
    const trackEvent = jest.fn();
    const mappings = [
      {
        [StorageMapFieldId.SourceStorage]: { name: 'ds-1' },
        [StorageMapFieldId.TargetStorage]: { name: 'sc' },
      },
    ] as never;
    const sourceProvider = {
      metadata: { name: 'src', namespace: 'ns', uid: '1' },
      spec: { type: 'vsphere' },
    } as never;
    const targetProvider = {
      metadata: { name: 'dst', namespace: 'ns', uid: '2' },
      spec: { type: 'openshift' },
    } as never;

    const result = await createStorageMap({
      mappings,
      name: 'sm-1',
      project: 'ns',
      sourceProvider,
      targetProvider,
      trackEvent,
    });

    expect(trackEvent).toHaveBeenCalledWith(
      TELEMETRY_EVENTS.STORAGE_MAP_CREATE_STARTED,
      expect.objectContaining({ mappingCount: 1, namespace: 'ns' }),
    );
    expect(mockBuild).toHaveBeenCalledWith(mappings, sourceProvider);
    expect(mockK8sCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          kind: 'StorageMap',
          metadata: expect.objectContaining({ name: 'sm-1', namespace: 'ns' }),
          spec: expect.objectContaining({
            map: builtMap,
            provider: expect.objectContaining({
              destination: expect.objectContaining({ name: 'dst', uid: '2' }),
              source: expect.objectContaining({ name: 'src', uid: '1' }),
            }),
          }),
        }),
        model: StorageMapModel,
      }),
    );
    expect(trackEvent).toHaveBeenCalledWith(
      TELEMETRY_EVENTS.STORAGE_MAP_CREATE_COMPLETED,
      expect.objectContaining({ mappingCount: 1, storageMapName: 'sm-1' }),
    );
    expect(result.kind).toBe('StorageMap');
  });
});
