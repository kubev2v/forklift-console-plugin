import { OpenstackSecretFieldsId } from 'src/providers/utils/constants';

import type { IoK8sApiCoreV1Secret } from '@kubev2v/types';

export const getAuthTypeRequiredFields = (
  secret: IoK8sApiCoreV1Secret,
  authType: string,
): OpenstackSecretFieldsId[] => {
  switch (authType) {
    case 'password':
      return [
        OpenstackSecretFieldsId.Username,
        OpenstackSecretFieldsId.Password,
        OpenstackSecretFieldsId.RegionName,
        OpenstackSecretFieldsId.ProjectName,
        OpenstackSecretFieldsId.DomainName,
      ];
    case 'token':
      if (secret?.data?.username) {
        return [
          OpenstackSecretFieldsId.Token,
          OpenstackSecretFieldsId.Username,
          OpenstackSecretFieldsId.RegionName,
          OpenstackSecretFieldsId.ProjectName,
          OpenstackSecretFieldsId.DomainName,
        ];
      }
      return [
        OpenstackSecretFieldsId.Token,
        OpenstackSecretFieldsId.UserId,
        OpenstackSecretFieldsId.ProjectId,
        OpenstackSecretFieldsId.RegionName,
      ];

    case 'applicationcredential':
      if (secret?.data?.username) {
        return [
          OpenstackSecretFieldsId.ApplicationCredentialName,
          OpenstackSecretFieldsId.ApplicationCredentialSecret,
          OpenstackSecretFieldsId.Username,
          OpenstackSecretFieldsId.RegionName,
          OpenstackSecretFieldsId.ProjectName,
          OpenstackSecretFieldsId.DomainName,
        ];
      }
      return [
        OpenstackSecretFieldsId.ApplicationCredentialId,
        OpenstackSecretFieldsId.ApplicationCredentialSecret,
        OpenstackSecretFieldsId.RegionName,
        OpenstackSecretFieldsId.ProjectName,
      ];

    default:
      return [];
  }
};
