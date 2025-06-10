import type { Fields } from 'src/modules/Providers/views/details/components/CredentialsSection/components/list/Fields';

import type { IoK8sApiCoreV1Secret } from '@kubev2v/types';

export const getAuthTypeSecretFields = (
  secret: IoK8sApiCoreV1Secret,
  fields: Record<string, Fields>,
  decodedAuthType?: string,
): Fields => {
  switch (decodedAuthType) {
    case 'token':
      if (secret?.data?.username) {
        return fields.tokenWithUsernameSecretFields;
      }
      return fields.tokenWithUserIDSecretFields;
    case 'applicationcredential':
      if (secret?.data?.username) {
        return fields.applicationCredentialNameSecretFields;
      }
      return fields.applicationCredentialIdSecretFields;
    case 'password':
    case undefined:
    default:
      return fields.passwordSecretFields;
  }
};
