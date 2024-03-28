import { Base64 } from 'js-base64';

import { IoK8sApiCoreV1Secret } from '@kubev2v/types';

import { missingKeysInSecretData } from '../../../helpers';
import { ValidationMsg } from '../../common';

import { openshiftSecretFieldValidator } from './openshiftSecretFieldValidator';

export function openshiftSecretValidator(secret: IoK8sApiCoreV1Secret): ValidationMsg {
  const url = secret?.data?.url || '';
  const token = secret?.data?.token || '';

  // required fields
  const requiredFields = [];

  // Validate fields
  const validateFields = ['user', 'token', 'insecureSkipVerify'];

  // Add ca cert validation if not insecureSkipVerify
  const insecureSkipVerify = Base64.decode(secret?.data?.['insecureSkipVerify'] || '');
  if (insecureSkipVerify !== 'true') {
    validateFields.push('cacert');
    requiredFields.push('cacert');
  }

  const missingRequiredFields = missingKeysInSecretData(secret, requiredFields);
  if (missingRequiredFields.length > 0) {
    return { type: 'error', msg: `missing required fields [${missingRequiredFields.join(', ')}]` };
  }

  for (const id of validateFields) {
    const value = Base64.decode(secret?.data?.[id] || '');

    const validation = openshiftSecretFieldValidator(id, value);

    if (validation.type === 'error') {
      return validation;
    }
  }
  // Empty URL + token is valid as host providers
  if (url === '' && token === '') {
    return { type: 'default' };
  }

  // If we have url, token is required
  if (url !== '' && token === '') {
    return { type: 'error', msg: `Missing required fields [token]` };
  }

  // If we have token, url is required
  if (url === '' && token !== '') {
    return { type: 'error', msg: `Missing required fields [url]` };
  }

  return { type: 'default' };
}
