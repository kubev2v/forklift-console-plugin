import { validateNoSpaces } from 'src/modules/Providers/utils/validators/common';
import { OpenstackSecretFieldsId } from 'src/providers/utils/constants';

import { t } from '@utils/i18n';
import { type ValidationMsg, ValidationState } from '@utils/validation/Validation';

import { validateCacert } from './validateCacert';
import { validateInsecureSkipVerify } from './validateInsecureSkipVerify';

const validateUsername = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: t(`A username for connecting to the OpenStack Identity (Keystone) endpoint. [required]`),
      type: ValidationState.Default,
    };
  }

  if (value === '') {
    return {
      msg: t(`A username for connecting to the OpenStack Identity (Keystone) endpoint. [required]`),
      type: ValidationState.Error,
    };
  }

  if (valid) {
    return {
      msg: t(`A username for connecting to the OpenStack Identity (Keystone) endpoint.`),
      type: ValidationState.Success,
    };
  }

  return { msg: t(`Invalid username, spaces are not allowed`), type: ValidationState.Error };
};

const validatePassword = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: t(
        `A user password for connecting to the OpenStack Identity (Keystone) endpoint. [required]`,
      ),
      type: ValidationState.Default,
    };
  }

  if (value === '') {
    return {
      msg: t(
        `A user password for connecting to the OpenStack Identity (Keystone) endpoint. [required]`,
      ),
      type: ValidationState.Error,
    };
  }

  if (valid) {
    return {
      msg: t(`A user password for connecting to the OpenStack Identity (Keystone) endpoint.`),
      type: ValidationState.Success,
    };
  }

  return { msg: t(`Invalid password, spaces are not allowed`), type: ValidationState.Error };
};

const validateRegionName = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: t(`OpenStack region name. [required]`),
      type: ValidationState.Default,
    };
  }

  if (value === '') {
    return {
      msg: t(`OpenStack region name. [required]`),
      type: ValidationState.Error,
    };
  }

  return valid
    ? { msg: t(`OpenStack region name.`), type: ValidationState.Success }
    : { msg: t(`Invalid region, spaces are not allowed`), type: ValidationState.Error };
};

const validateProjectName = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: t(`OpenStack project name. [required]`),
      type: ValidationState.Default,
    };
  }

  if (value === '') {
    return {
      msg: t(`OpenStack project name. [required]`),
      type: ValidationState.Error,
    };
  }

  if (valid) {
    return { msg: t(`OpenStack project name.`), type: ValidationState.Success };
  }

  return { msg: t(`Invalid project name, spaces are not allowed`), type: ValidationState.Error };
};

const validateDomainName = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: t(`OpenStack domain name. [required]`),
      type: ValidationState.Default,
    };
  }

  if (value === '') {
    return {
      msg: t(`OpenStack domain name. [required]`),
      type: ValidationState.Error,
    };
  }

  if (valid) {
    return { msg: t(`OpenStack domain name.`), type: ValidationState.Success };
  }

  return { msg: t(`Invalid domain name, spaces are not allowed`), type: ValidationState.Error };
};

const validateToken = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: t(`OpenStack token for authentication using a user name. [required]`),
      type: ValidationState.Default,
    };
  }

  if (value === '') {
    return {
      msg: t(`OpenStack token for authentication using a user name. [required]`),
      type: ValidationState.Error,
    };
  }

  if (valid) {
    return {
      msg: t(`OpenStack token for authentication using a user name.`),
      type: ValidationState.Success,
    };
  }

  return { msg: t(`Invalid token, spaces are not allowed`), type: ValidationState.Error };
};

const validateUserID = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: t(`A user ID for connecting to the OpenStack Identity (Keystone) endpoint. [required]`),
      type: ValidationState.Default,
    };
  }

  if (value === '') {
    return {
      msg: t(`A user ID for connecting to the OpenStack Identity (Keystone) endpoint. [required]`),
      type: ValidationState.Error,
    };
  }

  if (valid) {
    return {
      msg: t(`A user ID for connecting to the OpenStack Identity (Keystone) endpoint.`),
      type: ValidationState.Success,
    };
  }

  return { msg: t(`Invalid user ID, spaces are not allowed`), type: ValidationState.Error };
};

const validateProjectID = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: t(`OpenStack project ID. [required]`),
      type: ValidationState.Default,
    };
  }

  if (value === '') {
    return {
      msg: t(`OpenStack project ID. [required]`),
      type: ValidationState.Error,
    };
  }

  if (valid) {
    return { msg: t(`OpenStack project ID.`), type: ValidationState.Success };
  }

  return { msg: t(`Invalid project ID, spaces are not allowed`), type: ValidationState.Error };
};

const validateApplicationCredentialID = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: t(
        `OpenStack application credential ID needed for the application credential authentication. [required]`,
      ),
      type: ValidationState.Default,
    };
  }

  if (value === '') {
    return {
      msg: t(
        `OpenStack application credential ID needed for the application credential authentication. [required]`,
      ),
      type: ValidationState.Error,
    };
  }

  if (valid) {
    return {
      msg: t(
        `OpenStack application credential ID needed for the application credential authentication.`,
      ),
      type: ValidationState.Success,
    };
  }

  return { msg: t(`Invalid application ID, spaces are not allowed`), type: ValidationState.Error };
};

const validateApplicationCredentialSecret = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: t(
        `OpenStack application credential Secret needed for the application credential authentication. [required]`,
      ),
      type: ValidationState.Default,
    };
  }

  if (value === '') {
    return {
      msg: t(
        `OpenStack application credential Secret needed for the application credential authentication. [required]`,
      ),
      type: ValidationState.Error,
    };
  }

  if (valid) {
    return {
      msg: t(
        `OpenStack application credential Secret needed for the application credential authentication.`,
      ),
      type: ValidationState.Success,
    };
  }

  return {
    msg: t(`Invalid application secret, spaces are not allowed`),
    type: ValidationState.Error,
  };
};

const validateApplicationCredentialName = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: t(
        `OpenStack application credential name needed for application credential authentication. [required]`,
      ),
      type: ValidationState.Default,
    };
  }

  if (value === '') {
    return {
      msg: t(
        `OpenStack application credential name needed for application credential authentication. [required]`,
      ),
      type: ValidationState.Error,
    };
  }

  if (valid) {
    return {
      msg: t(
        `OpenStack application credential name needed for application credential authentication.`,
      ),
      type: ValidationState.Success,
    };
  }

  return {
    msg: t(`Invalid application name, spaces are not allowed`),
    type: ValidationState.Error,
  };
};

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
