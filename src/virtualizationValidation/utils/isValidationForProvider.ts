import type { V1beta1Provider } from '@forklift-ui/types';
import { getName, getNamespace } from '@utils/crds/common/selectors';

import { PROVIDER_NAME_LABEL, PROVIDER_UID_LABEL } from '../models';
import type { VirtualizationValidation } from '../types';

export const isValidationForProvider = (
  validation: VirtualizationValidation,
  provider: V1beta1Provider | undefined,
): boolean => {
  const providerName = getName(provider);
  const providerNamespace = getNamespace(provider);
  const labels = validation.metadata?.labels;
  const providerUID = provider?.metadata?.uid;

  return (
    Boolean(providerName) &&
    Boolean(providerNamespace) &&
    (providerUID
      ? labels?.[PROVIDER_UID_LABEL] === providerUID
      : labels?.[PROVIDER_NAME_LABEL] === providerName)
  );
};
