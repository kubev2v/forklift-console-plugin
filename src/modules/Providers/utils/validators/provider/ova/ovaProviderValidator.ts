import type { V1beta1Provider } from '@kubev2v/types';

import { validateK8sName, validateNFSMount, type ValidationMsg } from '../../common';

export function ovaProviderValidator(provider: V1beta1Provider): ValidationMsg {
  const name = provider?.metadata?.name;
  const url = provider?.spec?.url || '';

  if (!validateK8sName(name)) {
    return { msg: 'invalid kubernetes resource name', type: 'error' };
  }

  if (!validateNFSMount(url)) {
    return { msg: 'invalid OVA mount endpoint', type: 'error' };
  }

  return { type: 'default' };
}
