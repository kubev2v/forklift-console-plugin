import { validateNoSpaces, validatePublicCert, type ValidationMsg } from '../../common';

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

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: 'A username for connecting to the OpenStack Identity (Keystone) endpoint. [required]',
      type: 'default',
    };
  }

  if (value === '') {
    return {
      msg: 'A username for connecting to the OpenStack Identity (Keystone) endpoint. [required]',
      type: 'error',
    };
  }

  if (valid) {
    return {
      msg: 'A username for connecting to the OpenStack Identity (Keystone) endpoint.',
      type: 'success',
    };
  }

  return { msg: 'Invalid username, spaces are not allowed', type: 'error' };
};

const validatePassword = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: 'A user password for connecting to the OpenStack Identity (Keystone) endpoint. [required]',
      type: 'default',
    };
  }

  if (value === '') {
    return {
      msg: 'A user password for connecting to the OpenStack Identity (Keystone) endpoint. [required]',
      type: 'error',
    };
  }

  if (valid) {
    return {
      msg: 'A user password for connecting to the OpenStack Identity (Keystone) endpoint.',
      type: 'success',
    };
  }

  return { msg: 'Invalid password, spaces are not allowed', type: 'error' };
};

const validateRegionName = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: 'OpenStack region name. [required]',
      type: 'default',
    };
  }

  if (value === '') {
    return {
      msg: 'OpenStack region name. [required]',
      type: 'error',
    };
  }

  if (valid) {
    return { msg: 'OpenStack region name.', type: 'success' };
  }

  return { msg: 'Invalid region, spaces are not allowed', type: 'error' };
};

const validateProjectName = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: 'OpenStack project name. [required]',
      type: 'default',
    };
  }

  if (value === '') {
    return {
      msg: 'OpenStack project name. [required]',
      type: 'error',
    };
  }

  if (valid) {
    return { msg: 'OpenStack project name.', type: 'success' };
  }

  return { msg: 'Invalid project name, spaces are not allowed', type: 'error' };
};

const validateDomainName = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: 'OpenStack domain name. [required]',
      type: 'default',
    };
  }

  if (value === '') {
    return {
      msg: 'OpenStack domain name. [required]',
      type: 'error',
    };
  }

  if (valid) {
    return { msg: 'OpenStack domain name.', type: 'success' };
  }

  return { msg: 'Invalid domain name, spaces are not allowed', type: 'error' };
};

const validateToken = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: 'OpenStack token for authentication using a user name. [required]',
      type: 'default',
    };
  }

  if (value === '') {
    return {
      msg: 'OpenStack token for authentication using a user name. [required]',
      type: 'error',
    };
  }

  if (valid) {
    return { msg: 'OpenStack token for authentication using a user name.', type: 'success' };
  }

  return { msg: 'Invalid token, spaces are not allowed', type: 'error' };
};

const validateUserID = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: 'A user ID for connecting to the OpenStack Identity (Keystone) endpoint. [required]',
      type: 'default',
    };
  }

  if (value === '') {
    return {
      msg: 'A user ID for connecting to the OpenStack Identity (Keystone) endpoint. [required]',
      type: 'error',
    };
  }

  if (valid) {
    return {
      msg: 'A user ID for connecting to the OpenStack Identity (Keystone) endpoint.',
      type: 'success',
    };
  }

  return { msg: 'Invalid user ID, spaces are not allowed', type: 'error' };
};

const validateProjectID = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: 'OpenStack project ID. [required]',
      type: 'default',
    };
  }

  if (value === '') {
    return {
      msg: 'OpenStack project ID. [required]',
      type: 'error',
    };
  }

  if (valid) {
    return { msg: 'OpenStack project ID.', type: 'success' };
  }

  return { msg: 'Invalid project ID, spaces are not allowed', type: 'error' };
};

const validateApplicationCredentialID = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: 'OpenStack application credential ID needed for the application credential authentication. [required]',
      type: 'default',
    };
  }

  if (value === '') {
    return {
      msg: 'OpenStack application credential ID needed for the application credential authentication. [required]',
      type: 'error',
    };
  }

  if (valid) {
    return {
      msg: 'OpenStack application credential ID needed for the application credential authentication.',
      type: 'success',
    };
  }

  return { msg: 'Invalid application ID, spaces are not allowed', type: 'error' };
};

const validateApplicationCredentialSecret = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: 'OpenStack application credential Secret needed for the application credential authentication. [required]',
      type: 'default',
    };
  }

  if (value === '') {
    return {
      msg: 'OpenStack application credential Secret needed for the application credential authentication. [required]',
      type: 'error',
    };
  }

  if (valid) {
    return {
      msg: 'OpenStack application credential Secret needed for the application credential authentication.',
      type: 'success',
    };
  }

  return { msg: 'Invalid application secret, spaces are not allowed', type: 'error' };
};

const validateApplicationCredentialName = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: 'OpenStack application credential name needed for application credential authentication. [required]',
      type: 'default',
    };
  }

  if (value === '') {
    return {
      msg: 'OpenStack application credential name needed for application credential authentication. [required]',
      type: 'error',
    };
  }

  if (valid) {
    return {
      msg: 'OpenStack application credential name needed for application credential authentication.',
      type: 'success',
    };
  }

  return { msg: 'Invalid application name, spaces are not allowed', type: 'error' };
};

const validateInsecureSkipVerify = (value: string): ValidationMsg => {
  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return { msg: 'Migrate without validating a CA certificate', type: 'default' };
  }

  const valid = ['true', 'false', ''].includes(value);

  if (valid) {
    return { msg: 'Migrate without validating a CA certificate', type: 'success' };
  }

  return { msg: 'Invalid Skip certificate validation value, must be true or false', type: 'error' };
};

const validateCacert = (value: string): ValidationMsg => {
  const valid = validatePublicCert(value);

  if (value === undefined || value === '') {
    return {
      msg: 'The Manager CA certificate unless it was replaced by a third-party certificate, in which case, enter the Manager Apache CA certificate.',
      type: 'default',
    };
  }

  if (valid) {
    return {
      msg: 'The Manager CA certificate unless it was replaced by a third-party certificate, in which case, enter the Manager Apache CA certificate.',
      type: 'success',
    };
  }

  return {
    msg: 'Invalid CA certificate, certificate must be in a valid PEM encoded X.509 format.',
    type: 'error',
  };
};
