import { V1beta1Provider } from '@kubev2v/types';

import { validateK8sName, validateURL, ValidationMsg } from '../../common';

import { validateVDDKImage } from './validateVDDKImage';

export function vsphereProviderValidator(provider: V1beta1Provider): ValidationMsg {
  const name = provider?.metadata?.name;
  const url = provider?.spec?.url || '';
  const vddkInitImage = provider?.spec?.settings?.['vddkInitImage'] || '';
  const sdkEndpoint = provider?.spec?.settings?.['sdkEndpoint'] || '';
  const emptyVddkInitImage =
    provider?.metadata?.annotations?.['forklift.konveyor.io/empty-vddk-init-image'];

  if (!validateK8sName(name)) {
    return { type: 'error', msg: 'invalided kubernetes resource name' };
  }

  if (!validateURL(url)) {
    return { type: 'error', msg: 'invalided URL' };
  }

  if (emptyVddkInitImage === 'yes' && vddkInitImage === '') {
    return {
      msg: 'The VDDK image is empty, it is recommended to provide an image, for example: quay.io/kubev2v/vddk:latest .',
      type: 'warning',
    };
  }

  const validateVDDK = validateVDDKImage(vddkInitImage);
  if (validateVDDK?.type === 'error') {
    return validateVDDK;
  }

  if (sdkEndpoint !== '' && !['vcenter', 'esxi'].includes(sdkEndpoint)) {
    return { type: 'error', msg: 'invalided sdkEndpoint, can be vcenter or esxi' };
  }

  return { type: 'default' };
}
