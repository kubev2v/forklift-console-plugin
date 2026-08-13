import { OffloadPlugin } from 'src/storageMaps/utils/types';

import type { V1beta1StorageMap } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';
import { mockI18n } from '@test-utils/mockI18n';
import { StorageMapFieldId } from '@utils/storage/types';

import {
  transformFormValuesToK8sSpec,
  transformStorageMapToFormValues,
  validateUpdatedStorageMaps,
} from '../utils';

mockI18n();

const baseStorageMap = {
  spec: {
    map: [
      {
        destination: { storageClass: 'hpe-3par' },
        source: { id: 'ds-1', name: 'eco-iscsi-ds1' },
      },
    ],
    provider: {},
  },
} as unknown as V1beta1StorageMap;

describe('transformFormValuesToK8sSpec - offload plugins', () => {
  it('writes csiVolumeImport when CSI plugin is selected', () => {
    const formValues = {
      storageMap: [
        {
          [StorageMapFieldId.OffloadPlugin]: OffloadPlugin.CsiVolumeImport,
          [StorageMapFieldId.SourceStorage]: { id: 'ds-1', name: 'eco-iscsi-ds1' },
          [StorageMapFieldId.StorageProduct]: 'primera3par',
          [StorageMapFieldId.StorageSecret]: 'hpe-3par-secret',
          [StorageMapFieldId.TargetStorage]: { name: 'hpe-3par' },
        },
      ],
    };

    const result = transformFormValuesToK8sSpec(formValues, baseStorageMap);

    expect(result?.spec?.map?.[0].offloadPlugin).toEqual({
      csiVolumeImport: {
        secretRef: 'hpe-3par-secret',
        storageVendorProduct: 'primera3par',
      },
    });
    expect(result?.spec?.map?.[0].offloadPlugin).not.toHaveProperty('vsphereXcopyConfig');
  });

  it('writes vsphereXcopyConfig when XCOPY plugin is selected', () => {
    const formValues = {
      storageMap: [
        {
          [StorageMapFieldId.DedicatedMigrationHosts]: ['esxi-1'],
          [StorageMapFieldId.OffloadPlugin]: OffloadPlugin.VSphereXcopyConfig,
          [StorageMapFieldId.SourceStorage]: { id: 'ds-1', name: 'eco-iscsi-ds1' },
          [StorageMapFieldId.StorageProduct]: 'ontap',
          [StorageMapFieldId.StorageSecret]: 'netapp-secret',
          [StorageMapFieldId.TargetStorage]: { name: 'hpe-3par' },
        },
      ],
    };

    const result = transformFormValuesToK8sSpec(formValues, baseStorageMap);

    expect(result?.spec?.map?.[0].offloadPlugin).toEqual({
      vsphereXcopyConfig: {
        dedicatedMigrationHosts: ['esxi-1'],
        secretRef: 'netapp-secret',
        storageVendorProduct: 'ontap',
      },
    });
  });

  it('omits offloadPlugin for CSI + disallowed product (validation must reject before Save)', () => {
    const formValues = {
      storageMap: [
        {
          [StorageMapFieldId.OffloadPlugin]: OffloadPlugin.CsiVolumeImport,
          [StorageMapFieldId.SourceStorage]: { id: 'ds-1', name: 'eco-iscsi-ds1' },
          [StorageMapFieldId.StorageProduct]: 'ontap',
          [StorageMapFieldId.StorageSecret]: 'netapp-secret',
          [StorageMapFieldId.TargetStorage]: { name: 'hpe-3par' },
        },
      ],
    };

    expect(validateUpdatedStorageMaps(formValues.storageMap)).toBe(
      'Selected storage product is not supported for this offload plugin',
    );

    const result = transformFormValuesToK8sSpec(formValues, baseStorageMap);

    expect(result?.spec?.map?.[0].offloadPlugin).toBeUndefined();
  });
});

describe('transformStorageMapToFormValues - offload plugins', () => {
  it('reads csiVolumeImport from K8s spec into form fields', () => {
    const storageMap = {
      spec: {
        map: [
          {
            destination: { storageClass: 'hpe-3par' },
            offloadPlugin: {
              csiVolumeImport: {
                secretRef: 'hpe-3par-secret',
                storageVendorProduct: 'primera3par',
              },
            },
            source: { id: 'ds-1', name: 'eco-iscsi-ds1' },
          },
        ],
        provider: {},
      },
    } as unknown as V1beta1StorageMap;

    const result = transformStorageMapToFormValues(storageMap);

    expect(result.storageMap[0][StorageMapFieldId.OffloadPlugin]).toBe(
      OffloadPlugin.CsiVolumeImport,
    );
    expect(result.storageMap[0][StorageMapFieldId.StorageSecret]).toBe('hpe-3par-secret');
    expect(result.storageMap[0][StorageMapFieldId.StorageProduct]).toBe('primera3par');
    expect(result.storageMap[0][StorageMapFieldId.DedicatedMigrationHosts]).toEqual([]);
  });
});

describe('offload plugin round-trip', () => {
  it('preserves csiVolumeImport through form -> K8s spec -> form', () => {
    const formValues = {
      storageMap: [
        {
          [StorageMapFieldId.DedicatedMigrationHosts]: [],
          [StorageMapFieldId.OffloadPlugin]: OffloadPlugin.CsiVolumeImport,
          [StorageMapFieldId.SourceStorage]: { id: 'ds-1', name: 'eco-iscsi-ds1' },
          [StorageMapFieldId.StorageProduct]: 'primera3par',
          [StorageMapFieldId.StorageSecret]: 'hpe-3par-secret',
          [StorageMapFieldId.TargetStorage]: { name: 'hpe-3par' },
        },
      ],
    };

    const k8sResult = transformFormValuesToK8sSpec(formValues, baseStorageMap);
    if (!k8sResult) {
      throw new Error('Expected k8sResult to be defined');
    }

    const roundTripped = transformStorageMapToFormValues(k8sResult);

    expect(roundTripped.storageMap[0][StorageMapFieldId.OffloadPlugin]).toBe(
      OffloadPlugin.CsiVolumeImport,
    );
    expect(roundTripped.storageMap[0][StorageMapFieldId.StorageSecret]).toBe('hpe-3par-secret');
    expect(roundTripped.storageMap[0][StorageMapFieldId.StorageProduct]).toBe('primera3par');
  });
});
