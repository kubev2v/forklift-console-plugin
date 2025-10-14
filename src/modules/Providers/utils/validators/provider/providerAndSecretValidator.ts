import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';
import { type ValidationMsg, ValidationState } from '@utils/validation/Validation';

import { providerValidator } from './providerValidator';
import { secretValidator } from './secretValidator';

export const providerAndSecretValidator = (
  provider: V1beta1Provider,
  secret: IoK8sApiCoreV1Secret,
): ValidationMsg => {
  const subTypeString = provider?.spec?.settings?.sdkEndpoint ?? '';
  const subType = subTypeString === 'esxi' ? 'esxi' : 'vcenter';

  const secretValidation = secretValidator(provider, secret);
  const providerValidation = providerValidator(provider, subType, secret);

  // Test for validation errors
  if (providerValidation?.type === ValidationState.Error) {
    return providerValidation;
  }

  if (secretValidation?.type === ValidationState.Error) {
    return secretValidation;
  }

  // Test for validation warning
  if (providerValidation?.type === ValidationState.Warning) {
    return providerValidation;
  }

  if (secretValidation?.type === ValidationState.Warning) {
    return secretValidation;
  }

  // Return provider validation
  return providerValidation;
};
