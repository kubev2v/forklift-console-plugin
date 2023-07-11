import { V1beta1Provider, V1Secret } from '@kubev2v/types';

import { providerValidator } from './provider/providerValidator';
import { secretValidator } from './secret/secretValidator';

export function providerAndSecretValidator(provider: V1beta1Provider, secret: V1Secret) {
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
