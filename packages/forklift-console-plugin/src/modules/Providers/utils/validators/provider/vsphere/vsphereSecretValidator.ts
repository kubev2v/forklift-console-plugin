import { Base64 } from 'js-base64';

import { V1Secret } from '@kubev2v/types';

import { missingKeysInSecretData } from '../../../helpers';
import { ValidationMsg } from '../../common';

import { vsphereSecretFieldValidator } from './vsphereSecretFieldValidator';

export function vsphereSecretValidator(secret: V1Secret): ValidationMsg {
  const requiredFields = ['user', 'password'];
  const validateFields = ['user', 'password', 'insecureSkipVerify', 'cacert'];

  const missingRequiredFields = missingKeysInSecretData(secret, requiredFields);
  if (missingRequiredFields.length > 0) {
    return { type: 'error', msg: `missing required fields [${missingRequiredFields.join(', ')}]` };
  }

  for (const id of validateFields) {
    const value = Base64.decode(secret?.data?.[id] || '');

    const validation = vsphereSecretFieldValidator(id, value);

    if (validation.type === 'error') {
      return validation;
    }
  }

  return { type: 'default' };
}
