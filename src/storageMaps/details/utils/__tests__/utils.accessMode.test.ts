import type { V1beta1StorageMap } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';
import type { AccessMode } from '@utils/storage/types';

import { transformFormValuesToK8sSpec, transformStorageMapToFormValues } from '../utils';

const makeStorageMap = (
  mappings: { accessMode?: AccessMode; storageClass: string; sourceId: string }[],
): V1beta1StorageMap =>
  ({
    spec: {
      map: mappings.map(({ accessMode, sourceId, storageClass }) => ({
        destination: {
          ...(accessMode && { accessMode }),
          storageClass,
        },
        source: { id: sourceId, name: `source-${sourceId}` },
      })),
      provider: {},
    },
  }) as unknown as V1beta1StorageMap;

describe('transformFormValuesToK8sSpec - accessMode', () => {
  const baseStorageMap = makeStorageMap([
    { accessMode: 'ReadWriteMany', sourceId: 'ds-1', storageClass: 'ceph-rbd' },
  ]);

  it('includes accessMode in destination when present in form values', () => {
    const formValues = {
      storageMap: [
        {
          accessMode: 'ReadWriteMany' as AccessMode,
          sourceStorage: { id: 'ds-1', name: 'source-ds-1' },
          targetStorage: { name: 'ceph-rbd' },
        },
      ],
    };

    const result = transformFormValuesToK8sSpec(formValues, baseStorageMap);

    expect(result?.spec?.map?.[0].destination).toEqual({
      accessMode: 'ReadWriteMany',
      storageClass: 'ceph-rbd',
    });
  });

  it('omits accessMode from destination when not set in form values', () => {
    const formValues = {
      storageMap: [
        {
          sourceStorage: { id: 'ds-1', name: 'source-ds-1' },
          targetStorage: { name: 'thin' },
        },
      ],
    };

    const result = transformFormValuesToK8sSpec(formValues, baseStorageMap);

    expect(result?.spec?.map?.[0].destination).toEqual({ storageClass: 'thin' });
    expect(result?.spec?.map?.[0].destination).not.toHaveProperty('accessMode');
  });
});

describe('transformStorageMapToFormValues - accessMode', () => {
  it('reads accessMode from K8s spec', () => {
    const storageMap = makeStorageMap([
      { accessMode: 'ReadWriteMany', sourceId: 'ds-1', storageClass: 'ceph-rbd' },
    ]);

    const result = transformStorageMapToFormValues(storageMap);

    expect(result.storageMap[0].accessMode).toBe('ReadWriteMany');
  });

  it('defaults to undefined when accessMode is absent from spec', () => {
    const storageMap = makeStorageMap([{ sourceId: 'ds-1', storageClass: 'thin' }]);

    const result = transformStorageMapToFormValues(storageMap);

    expect(result.storageMap[0].accessMode).toBeUndefined();
  });
});

describe('accessMode round-trip', () => {
  it('preserves ReadWriteMany through form -> K8s spec -> form', () => {
    const formValues = {
      storageMap: [
        {
          accessMode: 'ReadWriteMany' as AccessMode,
          sourceStorage: { id: 'ds-1', name: 'source-ds-1' },
          targetStorage: { name: 'ceph-rbd' },
        },
      ],
    };

    const baseStorageMap = makeStorageMap([{ sourceId: 'ds-1', storageClass: 'ceph-rbd' }]);

    const k8sResult = transformFormValuesToK8sSpec(formValues, baseStorageMap);
    const roundTripped = transformStorageMapToFormValues(k8sResult!);

    expect(roundTripped.storageMap[0].accessMode).toBe('ReadWriteMany');
  });

  it('preserves ReadOnlyMany through form -> K8s spec -> form', () => {
    const formValues = {
      storageMap: [
        {
          accessMode: 'ReadOnlyMany' as AccessMode,
          sourceStorage: { id: 'ds-1', name: 'source-ds-1' },
          targetStorage: { name: 'nfs-sc' },
        },
      ],
    };

    const baseStorageMap = makeStorageMap([{ sourceId: 'ds-1', storageClass: 'nfs-sc' }]);

    const k8sResult = transformFormValuesToK8sSpec(formValues, baseStorageMap);
    const roundTripped = transformStorageMapToFormValues(k8sResult!);

    expect(roundTripped.storageMap[0].accessMode).toBe('ReadOnlyMany');
  });
});
