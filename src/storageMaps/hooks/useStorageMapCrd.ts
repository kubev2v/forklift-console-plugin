import type { IoK8sApiextensionsApiserverPkgApisApiextensionsV1CustomResourceDefinition as CustomResourceDefinition } from '@forklift-ui/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { toTypedWatchResult } from '@utils/hooks/toTypedWatchResult';

import { CrdGroupVersionKind, CrdK8sResourceName } from './constants';

type UseStorageMapCrdResult = {
  crd: CustomResourceDefinition | null;
  error: Error | null;
  loading: boolean;
};

export const useStorageMapCrd = (): UseStorageMapCrdResult => {
  const [crd, loaded, error] = toTypedWatchResult(
    useK8sWatchResource<CustomResourceDefinition>({
      groupVersionKind: CrdGroupVersionKind,
      name: CrdK8sResourceName,
      namespaced: false,
    }),
  );

  return {
    crd: crd || null,
    error,
    loading: !loaded,
  };
};
