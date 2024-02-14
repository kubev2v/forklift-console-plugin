import { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';

import { ValidationMsg } from '../common';

import { providerValidator } from './providerValidator';
import { secretValidator } from './secretValidator';

export function providerAndSecretValidator(
  provider: V1beta1Provider,
  secret: IoK8sApiCoreV1Secret,
): ValidationMsg {
  const providerValidation = providerValidator(provider);
  if (providerValidation) {
    return providerValidation;
  }

  const type = provider?.spec?.type || '';
  const secretValidation = secretValidator(type, secret);
  if (secretValidation) {
    return secretValidation;
  }

  return null;
}
