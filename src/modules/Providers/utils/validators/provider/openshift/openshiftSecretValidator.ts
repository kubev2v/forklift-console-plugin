import { Base64 } from 'js-base64';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';

import { validateUrlAndTokenExistence } from '../../../helpers/validateUrlAndTokenExistence';
import type { ValidationMsg } from '../../common';

import { openshiftSecretFieldValidator } from './openshiftSecretFieldValidator';

export const openshiftSecretValidator = (
  provider: V1beta1Provider,
  secret: IoK8sApiCoreV1Secret,
): ValidationMsg => {
  const url = provider?.spec?.url ?? '';
  const token = secret?.data?.token ?? '';

  const validation: ValidationMsg = validateUrlAndTokenExistence(url, token);
  if (validation) return validation;

  // Validate fields
  const validateFields = ['user', 'token', 'insecureSkipVerify'];

  // Add ca cert validation if not insecureSkipVerify
  const insecureSkipVerify = Base64.decode(secret?.data?.insecureSkipVerify || '');
  if (insecureSkipVerify !== 'true') {
    validateFields.push('cacert');
  }

  for (const id of validateFields) {
    const value = Base64.decode(secret?.data?.[id] || '');

    const validation = openshiftSecretFieldValidator(id, value);

    if (validation.type === 'error') {
      return validation;
    }
  }

  return { type: 'default' };
};
