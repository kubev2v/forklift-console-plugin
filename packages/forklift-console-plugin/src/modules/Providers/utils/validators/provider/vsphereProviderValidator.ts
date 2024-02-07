import { V1beta1Provider } from '@kubev2v/types';

import { validateContainerImage, validateK8sName, validateURL } from '../common';

export function vsphereProviderValidator(provider: V1beta1Provider) {
  const name = provider?.metadata?.name;
  const url = provider?.spec?.url || '';
  const vddkInitImage = provider?.spec?.settings?.['vddkInitImage'] || '';
  const sdkEndpoint = provider?.spec?.settings?.['sdkEndpoint'] || '';

  if (!validateK8sName(name)) {
    return new Error('invalided kubernetes resource name');
  }

  if (!validateURL(url)) {
    return new Error('invalided URL');
  }

  if (vddkInitImage !== '' && !validateContainerImage(vddkInitImage)) {
    return new Error('invalided VDDK init image');
  }

  if (sdkEndpoint !== '' && !['vcenter', 'esxi'].includes(sdkEndpoint)) {
    return new Error('invalided sdkEndpoint, can be vcenter or esxi');
  }

  return null;
}
