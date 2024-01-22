import { useProviderInventory } from 'src/modules/Providers/hooks';

import { OpenShiftNamespace, V1beta1Provider } from '@kubev2v/types';

export const useNamespaces = (
  provider: V1beta1Provider,
): [OpenShiftNamespace[], boolean, Error] => {
  const {
    inventory: namespaces,
    loading,
    error,
  } = useProviderInventory<OpenShiftNamespace[]>({
    provider,
    subPath: 'namespaces',
  });

  return [!loading && !error && Array.isArray(namespaces) ? namespaces : [], loading, error];
};
