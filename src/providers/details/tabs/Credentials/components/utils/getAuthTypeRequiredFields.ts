import type { IoK8sApiCoreV1Secret } from '@kubev2v/types';

export const getAuthTypeRequiredFields = (secret: IoK8sApiCoreV1Secret, authType: string) => {
  switch (authType) {
    case 'password':
      return ['username', 'password', 'regionName', 'projectName', 'domainName'];
    case 'token':
      if (secret?.data?.username) {
        return ['token', 'username', 'regionName', 'projectName', 'domainName'];
      }
      return ['token', 'userID', 'projectID', 'regionName'];

    case 'applicationcredential':
      if (secret?.data?.username) {
        return [
          'applicationCredentialName',
          'applicationCredentialSecret',
          'username',
          'regionName',
          'projectName',
          'domainName',
        ];
      }
      return [
        'applicationCredentialID',
        'applicationCredentialSecret',
        'regionName',
        'projectName',
      ];

    default:
      return [];
  }
};
