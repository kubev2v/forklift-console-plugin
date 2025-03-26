import { useMemo } from 'react';
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
    disabled: !provider,
  });

  const stableResponse = useMemo(() => (Array.isArray(namespaces) ? namespaces : []), [namespaces]);

  return [stableResponse, loading, error];
};
