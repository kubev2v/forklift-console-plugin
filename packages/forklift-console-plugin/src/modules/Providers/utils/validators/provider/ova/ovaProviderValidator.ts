import { V1beta1Provider } from '@kubev2v/types';

import { validateK8sName, validateNFSMount, ValidationMsg } from '../../common';

export function ovaProviderValidator(provider: V1beta1Provider): ValidationMsg {
  const name = provider?.metadata?.name;
  const url = provider?.spec?.url || '';

  if (!validateK8sName(name)) {
    return { type: 'error', msg: 'invalid kubernetes resource name' };
  }

  if (!validateNFSMount(url)) {
    return { type: 'error', msg: 'invalid OVA mount endpoint' };
  }

  return { type: 'default' };
}
