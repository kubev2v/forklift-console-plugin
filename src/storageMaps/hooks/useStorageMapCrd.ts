import type { IoK8sApiextensionsApiserverPkgApisApiextensionsV1CustomResourceDefinition as CustomResourceDefinition } from '@forklift-ui/types';
import { useTypedK8sWatchResource } from '@utils/hooks/useTypedK8sWatchResource';

import { CrdGroupVersionKind, CrdK8sResourceName } from './constants';

type UseStorageMapCrdResult = {
  crd: CustomResourceDefinition | null;
  error: Error | null;
  loading: boolean;
};

export const useStorageMapCrd = (): UseStorageMapCrdResult => {
  const [crd, loaded, error] = useTypedK8sWatchResource<CustomResourceDefinition>({
    groupVersionKind: CrdGroupVersionKind,
    name: CrdK8sResourceName,
    namespaced: false,
  });

  return {
    crd: crd || null,
    error,
    loading: !loaded,
  };
};
