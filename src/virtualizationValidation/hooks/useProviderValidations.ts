import type { V1beta1Provider } from '@forklift-ui/types';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';

import { VirtualizationValidationModelGroupVersionKind } from '../models';
import type { VirtualizationValidation } from '../types';
import { isValidationForProvider } from '../utils/isValidationForProvider';

type UseProviderValidationsResult = {
  error: Error | null;
  loaded: boolean;
  validations: VirtualizationValidation[];
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

  const validations = allValidations
    .filter((validation) => isValidationForProvider(validation, provider))
    .sort((left, right) => {
      const leftTime = left.metadata?.creationTimestamp ?? '';
      const rightTime = right.metadata?.creationTimestamp ?? '';

      return rightTime.localeCompare(leftTime);
    });

  return { error, loaded, validations };
};
