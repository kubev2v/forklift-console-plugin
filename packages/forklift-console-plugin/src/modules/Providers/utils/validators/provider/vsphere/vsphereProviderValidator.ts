import { V1beta1Provider } from '@kubev2v/types';

import { validateContainerImage, validateK8sName, validateURL, ValidationMsg } from '../../common';

export function vsphereProviderValidator(provider: V1beta1Provider): ValidationMsg {
  const name = provider?.metadata?.name;
  const url = provider?.spec?.url || '';
  const vddkInitImage = provider?.spec?.settings?.['vddkInitImage'] || '';
  const sdkEndpoint = provider?.spec?.settings?.['sdkEndpoint'] || '';

  if (!validateK8sName(name)) {
    return { type: 'error', msg: 'invalided kubernetes resource name' };
  }

  if (!validateURL(url)) {
    return { type: 'error', msg: 'invalided URL' };
  }

  if (vddkInitImage !== '' && !validateContainerImage(vddkInitImage)) {
    return { type: 'error', msg: 'invalided VDDK init image' };
  }

  if (sdkEndpoint !== '' && !['vcenter', 'esxi'].includes(sdkEndpoint)) {
    return { type: 'error', msg: 'invalided sdkEndpoint, can be vcenter or esxi' };
  }

  return null;
}
