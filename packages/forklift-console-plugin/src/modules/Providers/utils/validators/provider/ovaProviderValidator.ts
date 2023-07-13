import { V1beta1Provider } from '@kubev2v/types';

import { validateK8sName, validateNFSMount } from '../common';

export function ovaProviderValidator(provider: V1beta1Provider) {
  const name = provider?.metadata?.name;
  const url = provider?.spec?.url || '';

  if (!validateK8sName(name)) {
    return new Error('invalided kubernetes resource name');
  }

  if (!validateNFSMount(url)) {
    return new Error('invalided OVA mount end point');
  }

  return null;
}
