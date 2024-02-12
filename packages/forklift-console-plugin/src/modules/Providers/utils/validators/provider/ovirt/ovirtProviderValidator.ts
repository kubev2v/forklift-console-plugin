import { V1beta1Provider } from '@kubev2v/types';

import { validateK8sName, validateURL, ValidationMsg } from '../../common';

export function ovirtProviderValidator(provider: V1beta1Provider): ValidationMsg {
  const name = provider?.metadata?.name;
  const url = provider?.spec?.url || '';

  if (!validateK8sName(name)) {
    return { type: 'error', msg: 'invalided kubernetes resource name' };
  }

  if (!validateURL(url)) {
    return { type: 'error', msg: 'invalided URL' };
  }

  return { type: 'default' };
}
