import { useMemo } from 'react';
import { useProviderInventory } from 'src/modules/Providers/hooks';

import type { OpenShiftNamespace, V1beta1Provider } from '@kubev2v/types';

export const useNamespaces = (
  provider: V1beta1Provider,
): [OpenShiftNamespace[], boolean, Error] => {
  const {
    error,
    inventory: namespaces,
    loading,
  } = useProviderInventory<OpenShiftNamespace[]>({
    disabled: !provider,
    provider,
    subPath: 'namespaces',
  });

  const stableResponse = useMemo(() => (Array.isArray(namespaces) ? namespaces : []), [namespaces]);

  return [stableResponse, loading, error];
};
