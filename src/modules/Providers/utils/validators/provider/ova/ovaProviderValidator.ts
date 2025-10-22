import type { V1beta1Provider } from '@kubev2v/types';
import { type ValidationMsg, ValidationState } from '@utils/validation/Validation';

import { validateK8sName, validateNFSMount } from '../../common';

export const ovaProviderValidator = (provider: V1beta1Provider): ValidationMsg => {
  const name = provider?.metadata?.name;
  const url = provider?.spec?.url ?? '';

  if (!validateK8sName(name)) {
    return { msg: 'invalid provider name', type: ValidationState.Error };
  }

  if (!validateNFSMount(url)) {
    return { msg: 'invalid OVA mount endpoint', type: ValidationState.Error };
  }

  return { type: ValidationState.Default };
};
