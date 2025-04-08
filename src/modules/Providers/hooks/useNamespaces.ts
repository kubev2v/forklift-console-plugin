import { useMemo } from 'react';

import type { OpenShiftNamespace, V1beta1Provider } from '@kubev2v/types';

import useProviderInventory from './useProviderInventory';

export const useNamespaces = (
  provider: V1beta1Provider | undefined,
): [OpenShiftNamespace[], boolean, Error | null] => {
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
