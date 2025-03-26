import { useEffect, useRef, useState } from 'react';

import { ProviderModelGroupVersionKind, V1beta1Provider } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

export const useProviderType = (name: string, namespace: string): string | undefined => {
  const [type, setType] = useState<string | undefined>();
  const currentType = useRef<string | undefined>();

  const [provider, loaded, error] = useK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    namespaced: true,
    name,
    namespace,
  });

  useEffect(() => {
    if (loaded && !error && provider?.spec?.type) {
      if (provider.spec.type !== currentType.current) {
        setType(provider.spec.type);
        currentType.current = provider.spec.type;
      }
    } else if (currentType.current !== undefined) {
      setType(undefined);
      currentType.current = undefined;
    }
  }, [loaded, error, provider]);

  return type;
};
