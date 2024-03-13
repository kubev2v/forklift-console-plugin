import { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';

import { ValidationMsg } from '../common';

import { providerValidator } from './providerValidator';
import { secretValidator } from './secretValidator';

export function providerAndSecretValidator(
  provider: V1beta1Provider,
  secret: IoK8sApiCoreV1Secret,
): ValidationMsg {
  const type = provider?.spec?.type || '';
  const subType = provider?.spec?.settings?.['sdkEndpoint'] || '';

  const secretValidation = secretValidator(type, subType, secret);
  const providerValidation = providerValidator(provider);

  // Test for validation errors
  if (providerValidation?.type === 'error') {
    return providerValidation;
  }

  if (secretValidation?.type === 'error') {
    return secretValidation;
  }

  // Test for validation warning
  if (providerValidation?.type === 'warning') {
    return providerValidation;
  }

  if (secretValidation?.type === 'warning') {
    return secretValidation;
  }

  // Return provider validation
  return providerValidation;
}
