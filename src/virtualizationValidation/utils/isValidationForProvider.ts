import type { V1beta1Provider } from '@forklift-ui/types';
import { getName, getNamespace } from '@utils/crds/common/selectors';

import type { VirtualizationValidation } from '../types';

export const isValidationForProvider = (
  validation: VirtualizationValidation,
  provider: V1beta1Provider | undefined,
): boolean => {
  const providerName = getName(provider);
  const providerNamespace = getNamespace(provider);
  const reference = validation.spec?.providerRef;

  return (
    Boolean(providerName) &&
    reference !== undefined &&
    reference.name === providerName &&
    (reference.namespace === undefined || reference.namespace === providerNamespace)
  );
};
