import { useMemo } from 'react';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type {
  IoK8sApiCoreV1PersistentVolumeClaim,
  OpenshiftVM,
  ProviderVirtualMachine,
  V1beta1Provider,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { PersistentVolumeClaimModelGroupVersionKind } from '@utils/crds/common/models';
import { isEmpty } from '@utils/helpers';

/**
 * Extracts storage class names from OpenShift VMs by examining:
 * 1. PVC-backed volumes - fetches PVCs to get their storage classes
 * 2. DataVolume-backed volumes - fetches underlying PVCs created by DataVolumes
 */
export const useOpenshiftStorageClasses = (
  provider: V1beta1Provider | undefined,
  vms: ProviderVirtualMachine[],
) => {
  const isOpenshiftProvider = provider?.spec?.type === PROVIDER_TYPES.openshift;

  const vmNamespaces = useMemo(() => {
    if (!isOpenshiftProvider || isEmpty(vms)) {
      return [];
    }

    const namespaces = new Set(
      vms.map((vm) => (vm as OpenshiftVM)?.object?.metadata?.namespace).filter(Boolean),
    );

    return Array.from(namespaces);
  }, [isOpenshiftProvider, vms]);

  const [allPvcs = [], pvcsLoaded, pvcsError] = useK8sWatchResource<
    IoK8sApiCoreV1PersistentVolumeClaim[]
  >(
    isOpenshiftProvider && !isEmpty(vmNamespaces)
      ? {
          groupVersionKind: PersistentVolumeClaimModelGroupVersionKind,
          isList: true,
          namespaced: false,
        }
      : null,
  );

  const usedStorageClasses = useMemo(() => {
    if (!isOpenshiftProvider || isEmpty(vms) || !pvcsLoaded || pvcsError) {
      return new Set<string>();
    }

    const pvcMapper: Record<string, Record<string, IoK8sApiCoreV1PersistentVolumeClaim>> = {};

    allPvcs.forEach((pvc) => {
      const namespace = pvc.metadata?.namespace;
      const name = pvc.metadata?.name;

      if (namespace && name) {
        if (!pvcMapper[namespace]) {
          pvcMapper[namespace] = {};
        }

        pvcMapper[namespace][name] = pvc;
      }
    });

    const storageClassNames = new Set<string>();

    vms.forEach((vm) => {
      const openshiftVM = vm as OpenshiftVM;
      const vmSpec = openshiftVM?.object?.spec;
      const namespace = openshiftVM?.object?.metadata?.namespace;
      const volumes = vmSpec?.template?.spec?.volumes;

      if (namespace && volumes) {
        volumes.forEach((volume) => {
          // PVC-backed volumes
          const claimName = volume?.persistentVolumeClaim?.claimName;
          if (claimName) {
            const pvc = pvcMapper[namespace]?.[claimName];
            if (pvc?.spec?.storageClassName) {
              storageClassNames.add(pvc.spec.storageClassName);
            }
          }

          // DataVolume-backed volumes
          const dataVolumeName = volume?.dataVolume?.name;
          if (dataVolumeName) {
            const pvc = pvcMapper[namespace]?.[dataVolumeName];
            if (pvc?.spec?.storageClassName) {
              storageClassNames.add(pvc.spec.storageClassName);
            }
          }
        });
      }
    });

    return storageClassNames;
  }, [isOpenshiftProvider, vms, allPvcs, pvcsLoaded, pvcsError]);

  return {
    error: pvcsError,
    loading: !isEmpty(vmNamespaces) && !pvcsLoaded,
    usedStorageClasses,
  };
};
