import type {
  V1beta1Provider,
  V1beta1StorageMapSpecMap,
  V1beta1StorageMapSpecMapOffloadPluginVsphereXcopyConfig,
} from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';
import type { InventoryStorage } from '@utils/hooks/useStorages';
import { PROVIDER_TYPES } from '@utils/providers/constants';
import { StorageMapFieldId } from '@utils/storage/types';

import { getStorageMappingValues } from '../buildStorageMappings';

const makeProvider = (type: string): V1beta1Provider =>
  ({ spec: { type } }) as unknown as V1beta1Provider;

const makeSpecMapping = (
  sourceId: string,
  targetStorageClass: string,
  offload?: V1beta1StorageMapSpecMapOffloadPluginVsphereXcopyConfig,
): V1beta1StorageMapSpecMap => {
  const mapping: V1beta1StorageMapSpecMap = {
    destination: { storageClass: targetStorageClass },
    source: { id: sourceId },
  };

  if (offload) {
    mapping.offloadPlugin = {
      vsphereXcopyConfig: offload,
    };
  }

  return mapping;
};

const emptySourceStorages = new Map<string, InventoryStorage>();

describe('getStorageMappingValues', () => {
  describe('offload fields always present', () => {
    it('includes empty offload fields when no offloadPlugin in spec', () => {
      const vsphereProvider = makeProvider(PROVIDER_TYPES.vsphere);
      const specMappings = [makeSpecMapping('ds-1', 'ceph-rbd')];

      const result = getStorageMappingValues(specMappings, vsphereProvider, emptySourceStorages);

      expect(result).toHaveLength(1);
      expect(result[0][StorageMapFieldId.OffloadPlugin]).toBe('');
      expect(result[0][StorageMapFieldId.StorageSecret]).toBe('');
      expect(result[0][StorageMapFieldId.StorageProduct]).toBe('');
    });

    it('includes populated offload fields when offloadPlugin exists in spec', () => {
      const vsphereProvider = makeProvider(PROVIDER_TYPES.vsphere);
      const specMappings = [
        makeSpecMapping('ds-1', 'dell-powermax-csi', {
          secretRef: 'my-secret',
          storageVendorProduct: 'powermax',
        }),
      ];

      const result = getStorageMappingValues(specMappings, vsphereProvider, emptySourceStorages);

      expect(result).toHaveLength(1);
      expect(result[0][StorageMapFieldId.OffloadPlugin]).toBe('vsphereXcopyConfig');
      expect(result[0][StorageMapFieldId.StorageSecret]).toBe('my-secret');
      expect(result[0][StorageMapFieldId.StorageProduct]).toBe('powermax');
    });

    it('includes empty offload fields for non-vSphere providers', () => {
      const ovirtProvider = makeProvider(PROVIDER_TYPES.ovirt);
      const specMappings = [makeSpecMapping('sd-1', 'ceph-rbd')];

      const result = getStorageMappingValues(specMappings, ovirtProvider, emptySourceStorages);

      expect(result).toHaveLength(1);
      expect(result[0][StorageMapFieldId.OffloadPlugin]).toBe('');
      expect(result[0][StorageMapFieldId.StorageSecret]).toBe('');
      expect(result[0][StorageMapFieldId.StorageProduct]).toBe('');
    });

    it('includes empty offload fields for OpenStack providers', () => {
      const openstackProvider = makeProvider(PROVIDER_TYPES.openstack);
      const specMappings = [makeSpecMapping('vol-1', 'standard-csi')];

      const result = getStorageMappingValues(specMappings, openstackProvider, emptySourceStorages);

      expect(result).toHaveLength(1);
      expect(result[0][StorageMapFieldId.OffloadPlugin]).toBe('');
      expect(result[0][StorageMapFieldId.StorageSecret]).toBe('');
      expect(result[0][StorageMapFieldId.StorageProduct]).toBe('');
    });
  });

  describe('isDirty compatibility', () => {
    it('returns consistent shape regardless of offload presence', () => {
      const provider = makeProvider(PROVIDER_TYPES.vsphere);
      const withOffload = makeSpecMapping('ds-1', 'sc-1', {
        secretRef: 's',
        storageVendorProduct: 'ontap',
      });
      const withoutOffload = makeSpecMapping('ds-2', 'sc-2');

      const results = getStorageMappingValues(
        [withOffload, withoutOffload],
        provider,
        emptySourceStorages,
      );

      const keysWithOffload = Object.keys(results[0]).sort();
      const keysWithoutOffload = Object.keys(results[1]).sort();

      expect(keysWithOffload).toEqual(keysWithoutOffload);
    });
  });

  it('returns empty array when specMappings is undefined', () => {
    const provider = makeProvider(PROVIDER_TYPES.vsphere);
    expect(getStorageMappingValues(undefined, provider, emptySourceStorages)).toEqual([]);
  });
});
