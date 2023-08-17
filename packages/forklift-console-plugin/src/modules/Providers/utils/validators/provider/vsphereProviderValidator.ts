import { V1beta1Provider } from '@kubev2v/types';

import { validateContainerImage, validateK8sName, validateURL } from '../common';

export function vsphereProviderValidator(provider: V1beta1Provider) {
  const name = provider?.metadata?.name;
  const url = provider?.spec?.url || '';
  const vddkInitImage = provider?.spec?.settings?.['vddkInitImage'] || '';

  if (!validateK8sName(name)) {
    return new Error('invalided kubernetes resource name');
  }

  if (!validateURL(url)) {
    return new Error('invalided URL');
  }

  if (vddkInitImage !== '' && !validateContainerImage(vddkInitImage)) {
    return new Error('invalided VDDK init image');
  }

  return null;
}
