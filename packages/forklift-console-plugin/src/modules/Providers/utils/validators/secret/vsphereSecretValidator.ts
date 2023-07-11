import { Base64 } from 'js-base64';

import { V1Secret } from '@kubev2v/types';

import { missingKeysInSecretData } from '../../helpers';
import { vsphereSecretFieldValidator } from '../secret-fields';

export function vsphereSecretValidator(secret: V1Secret) {
  const requiredFields = ['user', 'password', 'thumbprint'];
  const validateFields = ['user', 'password', 'thumbprint'];

  const missingRequiredFields = missingKeysInSecretData(secret, requiredFields);
  if (missingRequiredFields.length > 0) {
    return new Error(`missing required fields [${missingRequiredFields.join(', ')}]`);
  }

  for (const id of validateFields) {
    const value = Base64.decode(secret?.data?.[id] || '');

    if (vsphereSecretFieldValidator(id, value) === 'error') {
      return new Error(`invalid ${id}`);
    }
  }

  return null;
}
