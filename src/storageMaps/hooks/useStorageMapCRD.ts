import type { IoK8sApiextensionsApiserverPkgApisApiextensionsV1CustomResourceDefinition as CustomResourceDefinition } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type UseStorageMapCRDResult = {
  crd: CustomResourceDefinition | null;
  loading: boolean;
  error: Error | null;
};

export const useStorageMapCRD = (): UseStorageMapCRDResult => {
  const [crd, loaded, error] = useK8sWatchResource<CustomResourceDefinition>({
    groupVersionKind: {
      group: 'apiextensions.k8s.io',
      kind: 'CustomResourceDefinition',
      version: 'v1',
    },
    name: 'storagemaps.forklift.konveyor.io',
    namespaced: false,
  });

  return {
    crd: crd || null,
    error,
    loading: !loaded,
  };
};
