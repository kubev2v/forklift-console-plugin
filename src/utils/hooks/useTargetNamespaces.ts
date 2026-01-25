import type { OpenShiftNamespace, V1beta1Provider } from '@kubev2v/types';

import useProviderInventory from './useProviderInventory';

export const useTargetNamespaces = (
  targetProvider: V1beta1Provider | undefined,
):
  | [namespaces: string[], loaded: true, error: null]
  | [namespaces: never[], loaded: boolean, error: Error | null] => {
  const {
    error,
    inventory: namespaces,
    loading,
  } = useProviderInventory<OpenShiftNamespace[]>({
    provider: targetProvider,
    subPath: 'namespaces?detail=4',
  });

  if (loading) {
    return [[], false, null];
  }

  if (error) {
    return [[], true, error];
  }

  const targetNamespaces =
    namespaces && Array.isArray(namespaces)
      ? namespaces?.map((ns) => ns.object.metadata?.name ?? '')
      : [];

  return [targetNamespaces, true, null];
};
