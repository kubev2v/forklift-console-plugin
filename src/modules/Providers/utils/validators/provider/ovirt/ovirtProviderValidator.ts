import type { V1beta1Provider } from '@kubev2v/types';

import { validateK8sName, validateURL, type ValidationMsg } from '../../common';

export function ovirtProviderValidator(provider: V1beta1Provider): ValidationMsg {
  const name = provider?.metadata?.name;
  const url = provider?.spec?.url || '';

  if (!validateK8sName(name)) {
    return { msg: 'invalid kubernetes resource name', type: 'error' };
  }

  if (!validateURL(url)) {
    return { msg: 'invalid URL', type: 'error' };
  }

  return { type: 'default' };
}
