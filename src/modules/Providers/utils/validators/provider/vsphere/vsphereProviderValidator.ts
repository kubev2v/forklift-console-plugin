import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';
import { type ValidationMsg, ValidationState } from '@utils/validation/Validation';

import { validateK8sName, validateURL } from '../../common';
import type { SecretSubType } from '../secretValidator';

import { validateVCenterURL } from './validateVCenterURL';
import { validateVDDKImage } from './validateVDDKImage';

export const vsphereProviderValidator = (
  provider: V1beta1Provider,
  subType?: SecretSubType,
  secret?: IoK8sApiCoreV1Secret,
): ValidationMsg => {
  const name = provider?.metadata?.name;
  const url = provider?.spec?.url ?? '';
  const vddkInitImage = provider?.spec?.settings?.vddkInitImage ?? '';
  const sdkEndpoint = provider?.spec?.settings?.sdkEndpoint ?? '';
  const emptyVddkInitImage =
    provider?.metadata?.annotations?.['forklift.konveyor.io/empty-vddk-init-image'];

  if (!validateK8sName(name)) {
    return { msg: 'invalid provider name', type: ValidationState.Error };
  }

  if (
    subType === 'vcenter'
      ? validateVCenterURL(url, secret?.data?.insecureSkipVerify).type === ValidationState.Error
      : !validateURL(url)
  ) {
    return { msg: 'invalid URL', type: ValidationState.Error };
  }

  if (emptyVddkInitImage === 'yes' && vddkInitImage === '') {
    return {
      msg: 'The VDDK image is empty. It is strongly recommended to provide an image using the following format: <registry_route_or_server_path>/vddk:<tag> .',
      type: ValidationState.Warning,
    };
  }

  const validateVDDK = validateVDDKImage(vddkInitImage);
  if (validateVDDK?.type === ValidationState.Error) {
    return validateVDDK;
  }

  if (sdkEndpoint !== '' && !['vcenter', 'esxi'].includes(sdkEndpoint)) {
    return { msg: 'invalid sdkEndpoint, can be vcenter or esxi', type: ValidationState.Error };
  }

  return { type: ValidationState.Default };
};
