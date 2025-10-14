import type { V1beta1Provider } from '@kubev2v/types';
import { type ValidationMsg, ValidationState } from '@utils/validation/Validation';

import { validateK8sName, validateURL } from '../../common';

export const ovirtProviderValidator = (provider: V1beta1Provider): ValidationMsg => {
  const name = provider?.metadata?.name;
  const url = provider?.spec?.url ?? '';

  if (!validateK8sName(name)) {
    return { msg: 'invalid provider name', type: ValidationState.Error };
  }

  if (!validateURL(url)) {
    return { msg: 'invalid URL', type: ValidationState.Error };
  }

  return { type: ValidationState.Default };
};
