import type { V1beta1Provider } from '@forklift-ui/types';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';

import { VirtualizationValidationModelGroupVersionKind } from '../models';
import type { VirtualizationValidation } from '../types';
import { isValidationForProvider } from '../utils/isValidationForProvider';

type UseProviderValidationsResult = {
  error: Error | null;
  loaded: boolean;
  validation: VirtualizationValidation | undefined;
};

export const useProviderValidations = (
  provider: V1beta1Provider | undefined,
  namespace: string,
): UseProviderValidationsResult => {
  const [allValidations, loaded, error] = useK8sWatchResource<VirtualizationValidation[]>({
    groupVersionKind: VirtualizationValidationModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: true,
  });

  const validation = allValidations.find((item) => isValidationForProvider(item, provider));

  return { error, loaded, validation };
};
