import { V1beta1Provider } from '@kubev2v/types';

import { validateK8sName, validateURL } from '../common';

export function ovirtProviderValidator(provider: V1beta1Provider) {
  const name = provider?.metadata?.name;
  const url = provider?.spec?.url || '';

  if (!validateK8sName(name)) {
    return new Error('invalided kubernetes resource name');
  }

  if (!validateURL(url)) {
    return new Error('invalided URL');
  }

  return null;
}
