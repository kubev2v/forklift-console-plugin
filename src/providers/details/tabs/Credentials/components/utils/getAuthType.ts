import { OpenstackAuthType } from 'src/providers/utils/constants';

export const getAuthType = (
  authType: string | undefined,
  username: string | undefined,
): OpenstackAuthType => {
  switch (authType) {
    case 'token':
      if (username) {
        return OpenstackAuthType.TokenWithUsernameSecretFields;
      }
      return OpenstackAuthType.TokenWithUserIDSecretFields;
    case 'applicationcredential':
      if (username) {
        return OpenstackAuthType.ApplicationCredentialNameSecretFields;
      }
      return OpenstackAuthType.ApplicationCredentialIdSecretFields;
    case 'password':
    case undefined:
    default:
      return OpenstackAuthType.PasswordSecretFields;
  }
};
