import { OpenstackSecretFieldsId } from 'src/providers/utils/constants';

import { type ValidationMsg, ValidationState } from '@utils/validation/Validation';

import {
  validateApplicationCredentialID,
  validateApplicationCredentialName,
  validateApplicationCredentialSecret,
  validateDomainName,
  validatePassword,
  validateProjectID,
  validateProjectName,
  validateRegionName,
  validateToken,
  validateUserID,
  validateUsername,
} from './openstackSecretFieldValidators';
import { validateCacert } from './validateCacert';
import { validateInsecureSkipVerify } from './validateInsecureSkipVerify';

export const openstackSecretFieldValidator = (
  id: OpenstackSecretFieldsId,
  value: string,
): ValidationMsg => {
  const trimmedValue = value?.trim();

  switch (id) {
    case OpenstackSecretFieldsId.Username:
      return validateUsername(trimmedValue);
    case OpenstackSecretFieldsId.Password:
      return validatePassword(trimmedValue);
    case OpenstackSecretFieldsId.RegionName:
      return validateRegionName(trimmedValue);
    case OpenstackSecretFieldsId.ProjectName:
      return validateProjectName(trimmedValue);
    case OpenstackSecretFieldsId.DomainName:
      return validateDomainName(trimmedValue);
    case OpenstackSecretFieldsId.Token:
      return validateToken(trimmedValue);
    case OpenstackSecretFieldsId.UserId:
      return validateUserID(trimmedValue);
    case OpenstackSecretFieldsId.ProjectId:
      return validateProjectID(trimmedValue);
    case OpenstackSecretFieldsId.ApplicationCredentialId:
      return validateApplicationCredentialID(trimmedValue);
    case OpenstackSecretFieldsId.ApplicationCredentialSecret:
      return validateApplicationCredentialSecret(trimmedValue);
    case OpenstackSecretFieldsId.ApplicationCredentialName:
      return validateApplicationCredentialName(trimmedValue);
    case OpenstackSecretFieldsId.InsecureSkipVerify:
      return validateInsecureSkipVerify(trimmedValue);
    case OpenstackSecretFieldsId.CaCert:
      return validateCacert(trimmedValue);
    case OpenstackSecretFieldsId.AuthType:
    default:
      return { type: ValidationState.Default };
  }
};
