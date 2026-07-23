import type { OpenShiftStorageClass } from '@forklift-ui/types';
import { mapTargetStorages } from '@utils/storage/mapTargetStorages';
import { StorageClassAnnotation } from '@utils/storage/types';

const makeStorage = (
  name: string,
  annotations: Record<string, string> = {},
  namespace?: string,
): OpenShiftStorageClass =>
  ({
    name,
    namespace,
    object: {
      metadata: { annotations },
      provisioner: 'test.csi/driver',
    },
    uid: `uid-${name}`,
  }) as OpenShiftStorageClass;

describe('mapTargetStorages', () => {
  it('places virt-default ahead of k8s-default and others', () => {
    const storages = [
      makeStorage('other-a'),
      makeStorage('k8s-default', { [StorageClassAnnotation.IsDefault]: 'true' }),
      makeStorage('other-b'),
      makeStorage('virt-default', {
        [StorageClassAnnotation.IsDefaultVirtClass]: 'true',
      }),
    ];

    const result = mapTargetStorages(storages, undefined);

    expect(result.map((storage) => storage.name)).toEqual([
      'virt-default',
      'k8s-default',
      'other-a',
      'other-b',
    ]);
    expect(result[0].isDefaultVirt).toBe(true);
    expect(result[1].isDefault).toBe(true);
  });

  it('places k8s-default first when no virt-default exists', () => {
    const storages = [
      makeStorage('other'),
      makeStorage('k8s-default', { [StorageClassAnnotation.IsDefault]: 'true' }),
    ];

    const result = mapTargetStorages(storages, undefined);

    expect(result.map((storage) => storage.name)).toEqual(['k8s-default', 'other']);
  });

  it('treats a class with both annotations as virt-default only', () => {
    const storages = [
      makeStorage('k8s-only', { [StorageClassAnnotation.IsDefault]: 'true' }),
      makeStorage('both', {
        [StorageClassAnnotation.IsDefault]: 'true',
        [StorageClassAnnotation.IsDefaultVirtClass]: 'true',
      }),
    ];

    const result = mapTargetStorages(storages, undefined);

    expect(result.map((storage) => storage.name)).toEqual(['both', 'k8s-only']);
    expect(result[0].isDefaultVirt).toBe(true);
    expect(result[0].isDefault).toBe(true);
  });

  it('filters namespaced storages that do not match the target project', () => {
    const storages = [
      makeStorage('in-project', {}, 'ns-a'),
      makeStorage('other-project', {}, 'ns-b'),
      makeStorage('cluster-scoped'),
    ];

    const result = mapTargetStorages(storages, 'ns-a');

    expect(result.map((storage) => storage.name)).toEqual(['in-project', 'cluster-scoped']);
  });

  it('returns an empty list when input is undefined', () => {
    expect(mapTargetStorages(undefined, 'ns-a')).toEqual([]);
  });
});
