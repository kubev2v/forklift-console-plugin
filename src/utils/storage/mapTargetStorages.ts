import type { OpenShiftStorageClass } from '@forklift-ui/types';
import { isNetAppShiftStorageClassAnnotations } from '@utils/storage/netAppShift';
import { StorageClassAnnotation, type TargetStorage } from '@utils/storage/types';

/**
 * Maps OpenShift StorageClasses to TargetStorage entries, ordered so that
 * KubeVirt virt-default classes come first, then k8s default, then others.
 */
export const mapTargetStorages = (
  availableTargetStorages: OpenShiftStorageClass[] | undefined,
  targetProject: string | undefined,
): TargetStorage[] => {
  const virtDefaults: TargetStorage[] = [];
  const k8sDefaults: TargetStorage[] = [];
  const others: TargetStorage[] = [];

  for (const storage of availableTargetStorages ?? []) {
    if (storage.namespace === targetProject || !storage.namespace) {
      const scAnnotations = storage.object?.metadata?.annotations;
      const isDefault = scAnnotations?.[StorageClassAnnotation.IsDefault] === 'true';
      const isDefaultVirt = scAnnotations?.[StorageClassAnnotation.IsDefaultVirtClass] === 'true';

      const targetStorage: TargetStorage = {
        id: storage.uid,
        isDefault,
        isDefaultVirt,
        isNetAppShift: isNetAppShiftStorageClassAnnotations(scAnnotations),
        name: storage.name,
        provisioner: storage.object?.provisioner,
      };

      if (isDefaultVirt) {
        virtDefaults.push(targetStorage);
      } else if (isDefault) {
        k8sDefaults.push(targetStorage);
      } else {
        others.push(targetStorage);
      }
    }
  }

  return [...virtDefaults, ...k8sDefaults, ...others];
};
