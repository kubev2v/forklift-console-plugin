import { V1beta1Provider } from '@kubev2v/types';
import { IoK8sApiCoreV1Secret } from '@kubev2v/types';

import { validateK8sName, validateURL, ValidationMsg } from '../../common';
import { SecretSubType } from '../secretValidator';

import { validateVCenterURL } from './validateVCenterURL';
import { validateVDDKImage } from './validateVDDKImage';

export function vsphereProviderValidator(
  provider: V1beta1Provider,
  subType?: SecretSubType,
  secret?: IoK8sApiCoreV1Secret,
): ValidationMsg {
  const name = provider?.metadata?.name;
  const url = provider?.spec?.url || '';
  const vddkInitImage = provider?.spec?.settings?.['vddkInitImage'] || '';
  const sdkEndpoint = provider?.spec?.settings?.['sdkEndpoint'] || '';
  const emptyVddkInitImage =
    provider?.metadata?.annotations?.['forklift.konveyor.io/empty-vddk-init-image'];

  if (!validateK8sName(name)) {
    return { type: 'error', msg: 'invalid kubernetes resource name' };
  }

  if (
    subType === 'vcenter'
      ? validateVCenterURL(url, secret?.data?.insecureSkipVerify).type === 'error'
      : !validateURL(url)
  ) {
    return { type: 'error', msg: 'invalid URL' };
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
    return { type: 'error', msg: 'invalid sdkEndpoint, can be vcenter or esxi' };
  }

  return { type: 'default' };
}
