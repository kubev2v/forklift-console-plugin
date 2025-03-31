import { Base64 } from 'js-base64';

import type { IoK8sApiCoreV1Secret } from '@kubev2v/types';

import { missingKeysInSecretData } from '../../../helpers';
import type { ValidationMsg } from '../../common';

import { esxiSecretFieldValidator } from './esxiSecretFieldValidator';

export function esxiSecretValidator(secret: IoK8sApiCoreV1Secret): ValidationMsg {
  const requiredFields = ['user', 'password'];
  const validateFields = ['user', 'password', 'insecureSkipVerify'];

  // Add ca cert validation if not insecureSkipVerify
  const insecureSkipVerify = Base64.decode(secret?.data?.insecureSkipVerify || '');
  if (insecureSkipVerify !== 'true') {
    validateFields.push('cacert');
  }

  const missingRequiredFields = missingKeysInSecretData(secret, requiredFields);
  if (missingRequiredFields.length > 0) {
    return { msg: `missing required fields [${missingRequiredFields.join(', ')}]`, type: 'error' };
  }

  for (const id of validateFields) {
    const value = Base64.decode(secret?.data?.[id] || '');

    const validation = esxiSecretFieldValidator(id, value);

    if (validation.type === 'error') {
      return validation;
    }
  }

  return { type: 'default' };
}
