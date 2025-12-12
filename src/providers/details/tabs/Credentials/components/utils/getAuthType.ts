import { OpenstackAuthType } from 'src/providers/utils/constants';

export const getAuthType = (
  authType: string | undefined,
  username: string | undefined,
): OpenstackAuthType => {
  switch (authType) {
    case 'token':
      if (username) {
        return OpenstackAuthType.TokenWithUsername;
      }
      return OpenstackAuthType.TokenWithUserId;
    case 'applicationcredential':
      if (username) {
        return OpenstackAuthType.ApplicationCredentialName;
      }
      return OpenstackAuthType.ApplicationCredentialId;
    case 'password':
    case undefined:
    default:
      return OpenstackAuthType.Password;
  }
};
