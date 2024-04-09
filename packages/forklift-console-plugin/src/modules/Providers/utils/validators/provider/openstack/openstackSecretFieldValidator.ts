import { validateNoSpaces, validatePublicCert, ValidationMsg } from '../../common';

/**
 * Validates form input fields based on their id.
 *
 * @param {string} id - The ID of the form field.
 * @param {string} value - The value of the form field.
 *
 * @return {Validation} - The validation state of the form field. Can be one of the following:
 * 'default' - The default state of the form field, used when the field is empty or a value hasn't been entered yet.
 * 'success' - The field's value has passed validation.
 * 'error' - The field's value has failed validation.
 */
export const openstackSecretFieldValidator = (id: string, value: string): ValidationMsg => {
  const trimmedValue = value?.trim();

  let validationState: ValidationMsg;

  switch (id) {
    case 'username':
      validationState = validateUsername(trimmedValue);
      break;
    case 'password':
      validationState = validatePassword(trimmedValue);
      break;
    case 'regionName':
      validationState = validateRegionName(trimmedValue);
      break;
    case 'projectName':
      validationState = validateProjectName(trimmedValue);
      break;
    case 'domainName':
      validationState = validateDomainName(trimmedValue);
      break;
    case 'token':
      validationState = validateToken(trimmedValue);
      break;
    case 'userID':
      validationState = validateUserID(trimmedValue);
      break;
    case 'projectID':
      validationState = validateProjectID(trimmedValue);
      break;
    case 'applicationCredentialID':
      validationState = validateApplicationCredentialID(trimmedValue);
      break;
    case 'applicationCredentialSecret':
      validationState = validateApplicationCredentialSecret(trimmedValue);
      break;
    case 'applicationCredentialName':
      validationState = validateApplicationCredentialName(trimmedValue);
      break;
    case 'insecureSkipVerify':
      validationState = validateInsecureSkipVerify(trimmedValue);
      break;
    case 'cacert':
      validationState = validateCacert(trimmedValue);
      break;
    default:
      validationState = { type: 'default' };
      break;
  }

  return validationState;
};

const validateUsername = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  if (value === '') {
    return {
      type: 'error',
      msg: 'A username for connecting to the OpenStack Identity (Keystone) endpoint. [required]',
    };
  }

  if (valid) {
    return {
      type: 'success',
      msg: 'A username for connecting to the OpenStack Identity (Keystone) endpoint.',
    };
  }

  return { type: 'error', msg: 'Invalid username, spaces are not allowed' };
};

const validatePassword = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  if (value === '') {
    return {
      type: 'error',
      msg: 'A user password for connecting to the OpenStack Identity (Keystone) endpoint. [required]',
    };
  }

  if (valid) {
    return {
      type: 'success',
      msg: 'A user password for connecting to the OpenStack Identity (Keystone) endpoint.',
    };
  }

  return { type: 'error', msg: 'Invalid password, spaces are not allowed' };
};

const validateRegionName = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  if (value === '') {
    return {
      type: 'error',
      msg: 'OpenStack region name. [required]',
    };
  }

  if (valid) {
    return { type: 'success', msg: 'OpenStack region name.' };
  }

  return { type: 'error', msg: 'Invalid region, spaces are not allowed' };
};

const validateProjectName = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  if (value === '') {
    return {
      type: 'error',
      msg: 'OpenStack project name. [required]',
    };
  }

  if (valid) {
    return { type: 'success', msg: 'OpenStack project name.' };
  }

  return { type: 'error', msg: 'Invalid project name, spaces are not allowed' };
};

const validateDomainName = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  if (value === '') {
    return {
      type: 'error',
      msg: 'OpenStack domain name. [required]',
    };
  }

  if (valid) {
    return { type: 'success', msg: 'OpenStack domain name.' };
  }

  return { type: 'error', msg: 'Invalid domain name, spaces are not allowed' };
};

const validateToken = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  if (value === '') {
    return {
      type: 'error',
      msg: 'OpenStack token for authentication using a user name. [required]',
    };
  }

  if (valid) {
    return { type: 'success', msg: 'OpenStack token for authentication using a user name.' };
  }

  return { type: 'error', msg: 'Invalid token, spaces are not allowed' };
};

const validateUserID = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  if (value === '') {
    return {
      type: 'error',
      msg: 'A user ID for connecting to the OpenStack Identity (Keystone) endpoint. [required]',
    };
  }

  if (valid) {
    return {
      type: 'success',
      msg: 'A user ID for connecting to the OpenStack Identity (Keystone) endpoint.',
    };
  }

  return { type: 'error', msg: 'Invalid user ID, spaces are not allowed' };
};

const validateProjectID = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  if (value === '') {
    return {
      type: 'error',
      msg: 'OpenStack project ID. [required]',
    };
  }

  if (valid) {
    return { type: 'success', msg: 'OpenStack project ID.' };
  }

  return { type: 'error', msg: 'Invalid project ID, spaces are not allowed' };
};

const validateApplicationCredentialID = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  if (value === '') {
    return {
      type: 'error',
      msg: 'OpenStack application credential ID needed for the application credential authentication. [required]',
    };
  }

  if (valid) {
    return {
      type: 'success',
      msg: 'OpenStack application credential ID needed for the application credential authentication.',
    };
  }

  return { type: 'error', msg: 'Invalid application ID, spaces are not allowed' };
};

const validateApplicationCredentialSecret = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  if (value === '') {
    return {
      type: 'error',
      msg: 'OpenStack application credential Secret needed for the application credential authentication. [required]',
    };
  }

  if (valid) {
    return {
      type: 'success',
      msg: 'OpenStack application credential Secret needed for the application credential authentication.',
    };
  }

  return { type: 'error', msg: 'Invalid application secret, spaces are not allowed' };
};

const validateApplicationCredentialName = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  if (value === '') {
    return {
      type: 'error',
      msg: 'OpenStack application credential name needed for application credential authentication. [required]',
    };
  }

  if (valid) {
    return {
      type: 'success',
      msg: 'OpenStack application credential name needed for application credential authentication.',
    };
  }

  return { type: 'error', msg: 'Invalid application name, spaces are not allowed' };
};

const validateInsecureSkipVerify = (value: string): ValidationMsg => {
  const valid = ['true', 'false', ''].includes(value);

  if (valid) {
    return { type: 'success', msg: 'Migrate without validating a CA certificate' };
  }

  return { type: 'error', msg: 'Invalid skip verify flag, must be true or false' };
};

const validateCacert = (value: string): ValidationMsg => {
  const valid = validatePublicCert(value);

  if (value === '') {
    return {
      type: 'default',
      msg: 'The Manager CA certificate unless it was replaced by a third-party certificate, in which case, enter the Manager Apache CA certificate.',
    };
  }

  if (valid) {
    return {
      type: 'success',
      msg: 'The Manager CA certificate unless it was replaced by a third-party certificate, in which case, enter the Manager Apache CA certificate.',
    };
  }

  return {
    type: 'error',
    msg: 'Invalid CA certificate, certificate must be in a valid PEM encoded X.509 format.',
  };
};
