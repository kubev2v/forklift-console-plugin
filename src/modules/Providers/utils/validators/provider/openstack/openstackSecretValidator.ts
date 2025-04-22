import type { IoK8sApiCoreV1Secret } from '@kubev2v/types';

import { missingKeysInSecretData } from '../../../helpers/missingKeysInSecretData';
import { safeBase64Decode } from '../../../helpers/safeBase64Decode';
import type { ValidationMsg } from '../../common';

import { openstackSecretFieldValidator } from './openstackSecretFieldValidator';

export const openstackSecretValidator = (secret: IoK8sApiCoreV1Secret): ValidationMsg => {
  const authType = safeBase64Decode(secret?.data?.authType) || 'password';

  // eslint-disable-next-line no-useless-assignment
  let requiredFields = [];
  // eslint-disable-next-line no-useless-assignment
  let validateFields = [];

  // guess authenticationType based on authType and username
  switch (authType) {
    case 'password':
      requiredFields = ['username', 'password', 'regionName', 'projectName', 'domainName'];
      validateFields = [
        'username',
        'password',
        'regionName',
        'projectName',
        'domainName',
        'insecureSkipVerify',
      ];
      break;
    case 'token':
      if (secret?.data?.username) {
        requiredFields = ['token', 'username', 'regionName', 'projectName', 'domainName'];
        validateFields = [
          'token',
          'username',
          'regionName',
          'projectName',
          'domainName',
          'insecureSkipVerify',
        ];
      } else {
        requiredFields = ['token', 'userID', 'projectID', 'regionName'];
        validateFields = ['token', 'userID', 'projectID', 'regionName', 'insecureSkipVerify'];
      }
      break;
    case 'applicationcredential':
      if (secret?.data?.username) {
        requiredFields = [
          'applicationCredentialName',
          'applicationCredentialSecret',
          'username',
          'regionName',
          'projectName',
          'domainName',
        ];
        validateFields = [
          'applicationCredentialName',
          'applicationCredentialSecret',
          'username',
          'regionName',
          'projectName',
          'domainName',
          'insecureSkipVerify',
        ];
      } else {
        requiredFields = [
          'applicationCredentialID',
          'applicationCredentialSecret',
          'regionName',
          'projectName',
        ];
        validateFields = [
          'applicationCredentialID',
          'applicationCredentialSecret',
          'regionName',
          'projectName',
          'insecureSkipVerify',
        ];
      }
      break;
    default:
      return { msg: 'invalid authType', type: 'error' };
  }

  const missingRequiredFields = missingKeysInSecretData(secret, requiredFields);

  if (missingRequiredFields.length > 0) {
    return { msg: `missing required fields [${missingRequiredFields.join(', ')}]`, type: 'error' };
  }

  // Add ca cert validation if not insecureSkipVerify
  const insecureSkipVerify = safeBase64Decode(secret?.data?.insecureSkipVerify);
  if (insecureSkipVerify !== 'true') {
    validateFields.push('cacert');
  }

  for (const id of validateFields) {
    const value = safeBase64Decode(secret?.data?.[id] || '');

    const validation = openstackSecretFieldValidator(id, value);

    if (validation.type === 'error') {
      return validation;
    }
  }

  return { type: 'default' };
};
