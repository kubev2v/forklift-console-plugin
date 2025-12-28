import { OpenstackAuthType } from 'src/providers/utils/constants';

import {
  openstackApplicationCredentialIdFields,
  openstackApplicationCredentialNameFields,
  openstackPasswordFields,
  openstackTokenWithUserIdFields,
  openstackTokenWithUsernameFields,
} from './credentialsFields';
import type { Fields } from './types';

export const getOpenstackFieldsByAuthType = (decodedAuthType: string | undefined): Fields => {
  switch (decodedAuthType) {
    case OpenstackAuthType.TokenWithUsername:
      return openstackTokenWithUsernameFields;
    case OpenstackAuthType.TokenWithUserId:
      return openstackTokenWithUserIdFields;
    case OpenstackAuthType.ApplicationCredentialName:
      return openstackApplicationCredentialNameFields;
    case OpenstackAuthType.ApplicationCredentialId:
      return openstackApplicationCredentialIdFields;
    case OpenstackAuthType.Password:
    case undefined:
    default:
      return openstackPasswordFields;
  }
};
