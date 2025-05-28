import type { IoK8sApiCoreV1Secret } from '@kubev2v/types';

export const getAuthTypeValidateFields = (secret: IoK8sApiCoreV1Secret, authType: string) => {
  switch (authType) {
    case 'password':
      return [
        'username',
        'password',
        'regionName',
        'projectName',
        'domainName',
        'insecureSkipVerify',
      ];
    case 'token':
      if (secret?.data?.username) {
        return [
          'token',
          'username',
          'regionName',
          'projectName',
          'domainName',
          'insecureSkipVerify',
        ];
      }
      return ['token', 'userID', 'projectID', 'regionName', 'insecureSkipVerify'];

    case 'applicationcredential':
      if (secret?.data?.username) {
        return [
          'applicationCredentialName',
          'applicationCredentialSecret',
          'username',
          'regionName',
          'projectName',
          'domainName',
          'insecureSkipVerify',
        ];
      }
      return [
        'applicationCredentialID',
        'applicationCredentialSecret',
        'regionName',
        'projectName',
        'insecureSkipVerify',
      ];

    default:
      return [];
  }
};
