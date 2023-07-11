import { V1Secret } from '@kubev2v/types';

import { missingKeysInSecretData, safeBase64Decode } from '../../helpers';
import { openstackSecretFieldValidator } from '../secret-fields';

export function openstackSecretValidator(secret: V1Secret) {
  const authType = safeBase64Decode(secret?.data?.['authType']) || 'password';

  let requiredFields = [];
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
        'cacert',
        'insecureSkipVerify',
      ];
      break;
    case 'token':
      if (secret?.data?.['username']) {
        requiredFields = ['token', 'username', 'projectName', 'userDomainName'];
        validateFields = [
          'token',
          'username',
          'projectName',
          'userDomainName',
          'cacert',
          'insecureSkipVerify',
        ];
      } else {
        requiredFields = ['token', 'userID', 'projectID'];
        validateFields = ['token', 'userID', 'projectID', 'cacert', 'insecureSkipVerify'];
      }
      break;
    case 'applicationcredential':
      if (secret?.data?.['username']) {
        requiredFields = [
          'applicationCredentialName',
          'applicationCredentialSecret',
          'username',
          'domainName',
        ];
        validateFields = [
          'applicationCredentialName',
          'applicationCredentialSecret',
          'username',
          'domainName',
          'cacert',
          'insecureSkipVerify',
        ];
      } else {
        requiredFields = ['applicationCredentialID', 'applicationCredentialSecret'];
        validateFields = [
          'applicationCredentialID',
          'applicationCredentialSecret',
          'cacert',
          'insecureSkipVerify',
        ];
      }
      break;
    default:
      return new Error(`invalid authType`);
  }

  const missingRequiredFields = missingKeysInSecretData(secret, requiredFields);
  if (missingRequiredFields.length > 0) {
    return new Error(`missing required fields [${missingRequiredFields.join(', ')}]`);
  }

  for (const id of validateFields) {
    const value = safeBase64Decode(secret?.data?.[id] || '');

    if (openstackSecretFieldValidator(id, value) === 'error') {
      return new Error(`invalid ${id}`);
    }
  }

  return null;
}
