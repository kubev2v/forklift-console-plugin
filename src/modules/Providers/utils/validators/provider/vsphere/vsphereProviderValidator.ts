import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';

import { validateK8sName, validateURL, type ValidationMsg } from '../../common';
import type { SecretSubType } from '../secretValidator';

import { validateVCenterURL } from './validateVCenterURL';
import { validateVDDKImage } from './validateVDDKImage';

export function vsphereProviderValidator(
  provider: V1beta1Provider,
  subType?: SecretSubType,
  secret?: IoK8sApiCoreV1Secret,
): ValidationMsg {
  const name = provider?.metadata?.name;
  const url = provider?.spec?.url || '';
  const vddkInitImage = provider?.spec?.settings?.vddkInitImage || '';
  const sdkEndpoint = provider?.spec?.settings?.sdkEndpoint || '';
  const emptyVddkInitImage =
    provider?.metadata?.annotations?.['forklift.konveyor.io/empty-vddk-init-image'];

  if (!validateK8sName(name)) {
    return { msg: 'invalid kubernetes resource name', type: 'error' };
  }

  if (
    subType === 'vcenter'
      ? validateVCenterURL(url, secret?.data?.insecureSkipVerify).type === 'error'
      : !validateURL(url)
  ) {
    return { msg: 'invalid URL', type: 'error' };
  }

  if (emptyVddkInitImage === 'yes' && vddkInitImage === '') {
    return {
      msg: 'The VDDK image is empty. It is strongly recommended to provide an image using the following format: <registry_route_or_server_path>/vddk:<tag> .',
      type: 'warning',
    };
  }

  const validateVDDK = validateVDDKImage(vddkInitImage);
  if (validateVDDK?.type === 'error') {
    return validateVDDK;
  }

  if (sdkEndpoint !== '' && !['vcenter', 'esxi'].includes(sdkEndpoint)) {
    return { msg: 'invalid sdkEndpoint, can be vcenter or esxi', type: 'error' };
  }

  return { type: 'default' };
}
