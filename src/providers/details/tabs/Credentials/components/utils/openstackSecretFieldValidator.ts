import { validateNoSpaces } from 'src/modules/Providers/utils/validators/common';
import { type ValidationMsg, ValidationState } from 'src/providers/utils/types';

import { validateCacert } from './validateCacert';
import { validateInsecureSkipVerify } from './validateInsecureSkipVerify';

const validateUsername = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: 'A username for connecting to the OpenStack Identity (Keystone) endpoint. [required]',
      type: ValidationState.Default,
    };
  }

  if (value === '') {
    return {
      msg: 'A username for connecting to the OpenStack Identity (Keystone) endpoint. [required]',
      type: ValidationState.Error,
    };
  }

  if (valid) {
    return {
      msg: 'A username for connecting to the OpenStack Identity (Keystone) endpoint.',
      type: ValidationState.Success,
    };
  }

  return { msg: 'Invalid username, spaces are not allowed', type: ValidationState.Error };
};

const validatePassword = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: 'A user password for connecting to the OpenStack Identity (Keystone) endpoint. [required]',
      type: ValidationState.Default,
    };
  }

  if (value === '') {
    return {
      msg: 'A user password for connecting to the OpenStack Identity (Keystone) endpoint. [required]',
      type: ValidationState.Error,
    };
  }

  if (valid) {
    return {
      msg: 'A user password for connecting to the OpenStack Identity (Keystone) endpoint.',
      type: ValidationState.Success,
    };
  }

  return { msg: 'Invalid password, spaces are not allowed', type: ValidationState.Error };
};

const validateRegionName = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: 'OpenStack region name. [required]',
      type: ValidationState.Default,
    };
  }

  if (value === '') {
    return {
      msg: 'OpenStack region name. [required]',
      type: ValidationState.Error,
    };
  }

  if (valid) {
    return { msg: 'OpenStack region name.', type: ValidationState.Success };
  }

  return { msg: 'Invalid region, spaces are not allowed', type: ValidationState.Error };
};

const validateProjectName = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: 'OpenStack project name. [required]',
      type: ValidationState.Default,
    };
  }

  if (value === '') {
    return {
      msg: 'OpenStack project name. [required]',
      type: ValidationState.Error,
    };
  }

  if (valid) {
    return { msg: 'OpenStack project name.', type: ValidationState.Success };
  }

  return { msg: 'Invalid project name, spaces are not allowed', type: ValidationState.Error };
};

const validateDomainName = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: 'OpenStack domain name. [required]',
      type: ValidationState.Default,
    };
  }

  if (value === '') {
    return {
      msg: 'OpenStack domain name. [required]',
      type: ValidationState.Error,
    };
  }

  if (valid) {
    return { msg: 'OpenStack domain name.', type: ValidationState.Success };
  }

  return { msg: 'Invalid domain name, spaces are not allowed', type: ValidationState.Error };
};

const validateToken = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: 'OpenStack token for authentication using a user name. [required]',
      type: ValidationState.Default,
    };
  }

  if (value === '') {
    return {
      msg: 'OpenStack token for authentication using a user name. [required]',
      type: ValidationState.Error,
    };
  }

  if (valid) {
    return {
      msg: 'OpenStack token for authentication using a user name.',
      type: ValidationState.Success,
    };
  }

  return { msg: 'Invalid token, spaces are not allowed', type: ValidationState.Error };
};

const validateUserID = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: 'A user ID for connecting to the OpenStack Identity (Keystone) endpoint. [required]',
      type: ValidationState.Default,
    };
  }

  if (value === '') {
    return {
      msg: 'A user ID for connecting to the OpenStack Identity (Keystone) endpoint. [required]',
      type: ValidationState.Error,
    };
  }

  if (valid) {
    return {
      msg: 'A user ID for connecting to the OpenStack Identity (Keystone) endpoint.',
      type: ValidationState.Success,
    };
  }

  return { msg: 'Invalid user ID, spaces are not allowed', type: ValidationState.Error };
};

const validateProjectID = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: 'OpenStack project ID. [required]',
      type: ValidationState.Default,
    };
  }

  if (value === '') {
    return {
      msg: 'OpenStack project ID. [required]',
      type: ValidationState.Error,
    };
  }

  if (valid) {
    return { msg: 'OpenStack project ID.', type: ValidationState.Success };
  }

  return { msg: 'Invalid project ID, spaces are not allowed', type: ValidationState.Error };
};

const validateApplicationCredentialID = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: 'OpenStack application credential ID needed for the application credential authentication. [required]',
      type: ValidationState.Default,
    };
  }

  if (value === '') {
    return {
      msg: 'OpenStack application credential ID needed for the application credential authentication. [required]',
      type: ValidationState.Error,
    };
  }

  if (valid) {
    return {
      msg: 'OpenStack application credential ID needed for the application credential authentication.',
      type: ValidationState.Success,
    };
  }

  return { msg: 'Invalid application ID, spaces are not allowed', type: ValidationState.Error };
};

const validateApplicationCredentialSecret = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: 'OpenStack application credential Secret needed for the application credential authentication. [required]',
      type: ValidationState.Default,
    };
  }

  if (value === '') {
    return {
      msg: 'OpenStack application credential Secret needed for the application credential authentication. [required]',
      type: ValidationState.Error,
    };
  }

  if (valid) {
    return {
      msg: 'OpenStack application credential Secret needed for the application credential authentication.',
      type: ValidationState.Success,
    };
  }

  return { msg: 'Invalid application secret, spaces are not allowed', type: ValidationState.Error };
};

const validateApplicationCredentialName = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: 'OpenStack application credential name needed for application credential authentication. [required]',
      type: ValidationState.Default,
    };
  }

  if (value === '') {
    return {
      msg: 'OpenStack application credential name needed for application credential authentication. [required]',
      type: ValidationState.Error,
    };
  }

  if (valid) {
    return {
      msg: 'OpenStack application credential name needed for application credential authentication.',
      type: ValidationState.Success,
    };
  }

  return { msg: 'Invalid application name, spaces are not allowed', type: ValidationState.Error };
};

export const openstackSecretFieldValidator = (id: string, value: string): ValidationMsg => {
  const trimmedValue = value?.trim();

  switch (id) {
    case 'username':
      return validateUsername(trimmedValue);
    case 'password':
      return validatePassword(trimmedValue);
    case 'regionName':
      return validateRegionName(trimmedValue);
    case 'projectName':
      return validateProjectName(trimmedValue);
    case 'domainName':
      return validateDomainName(trimmedValue);
    case 'token':
      return validateToken(trimmedValue);
    case 'userID':
      return validateUserID(trimmedValue);
    case 'projectID':
      return validateProjectID(trimmedValue);
    case 'applicationCredentialID':
      return validateApplicationCredentialID(trimmedValue);
    case 'applicationCredentialSecret':
      return validateApplicationCredentialSecret(trimmedValue);
    case 'applicationCredentialName':
      return validateApplicationCredentialName(trimmedValue);
    case 'insecureSkipVerify':
      return validateInsecureSkipVerify(trimmedValue);
    case 'cacert':
      return validateCacert(trimmedValue);
    default:
      return { type: ValidationState.Default };
  }
};
