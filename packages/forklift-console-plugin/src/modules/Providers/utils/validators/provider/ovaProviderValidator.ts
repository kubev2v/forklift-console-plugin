import { V1beta1Provider } from '@kubev2v/types';

import { validateK8sName } from '../common';

export function ovaProviderValidator(provider: V1beta1Provider) {
  const name = provider?.metadata?.name;

  if (!validateK8sName(name)) {
    return new Error('invalided kubernetes resource name');
  }

  return null;
}
