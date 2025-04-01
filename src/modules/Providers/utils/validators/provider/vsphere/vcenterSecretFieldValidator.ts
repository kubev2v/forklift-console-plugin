import {
  validateNoSpaces,
  validatePublicCert,
  validateUsernameAndDomain,
  ValidationMsg,
} from '../../common';

/**
 * Validates form input fields based on their id.
 *
 * @param {string} id - The ID of the form field.
 * @param {string} value - The value of the form field.
 *
 * @return {Validation} - The validation state of the form field. Can be one of the following:
 * 'default' - The default state of the form field, used when the field is empty or a value has not been entered yet.
 * 'success' - The field's value has passed validation.
 * 'error' - The field's value has failed validation.
 * 'warning' - The field's value has passed validation but does not fit the standard format, it's the user's choice if to accept that value.
 */
export const vcenterSecretFieldValidator = (id: string, value: string): ValidationMsg => {
  const trimmedValue = value?.trim();

  let validationState: ValidationMsg;

  switch (id) {
    case 'user':
      validationState = validateUser(trimmedValue);
      break;
    case 'password':
      validationState = validatePassword(trimmedValue);
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

const validateUser = (value: string): ValidationMsg => {
  const noSpaces = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      type: 'default',
      msg: 'A username and domain for the vCenter API endpoint, for example: user@vsphere.local. [required]',
    };
  }

  if (value === '') {
    return {
      type: 'error',
      msg: 'A username and domain for the vCenter API endpoint, for example: user@vsphere.local. [required]',
    };
  }

  if (!noSpaces) {
    return { type: 'error', msg: 'Invalid username, spaces are not allowed' };
  }

  const hasAtChar = validateUsernameAndDomain(value);

  if (!hasAtChar) {
    return {
      type: 'warning',
      msg: 'User name usually include the domain, for example: user@vsphere.local',
    };
  }

  return {
    type: 'success',
    msg: 'A username and domain for the vCenter API endpoint, for example: user@vsphere.local.',
  };
};

const validatePassword = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      type: 'default',
      msg: 'A user password for connecting to the vCenter API endpoint. [required]',
    };
  }

  if (value === '') {
    return {
      type: 'error',
      msg: 'A user password for connecting to the vCenter API endpoint. [required]',
    };
  }

  if (valid) {
    return { type: 'success', msg: 'A user password for connecting to the vCenter API endpoint.' };
  }

  return { type: 'error', msg: 'Invalid password, spaces are not allowed' };
};

const validateCacert = (value: string): ValidationMsg => {
  const valid = validatePublicCert(value);

  if (value === undefined || value === '') {
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

const validateInsecureSkipVerify = (value: string): ValidationMsg => {
  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return { type: 'default', msg: 'Migrate without validating a CA certificate' };
  }

  const valid = ['true', 'false', ''].includes(value);

  if (valid) {
    return { type: 'success', msg: 'Migrate without validating a CA certificate' };
  }

  return { type: 'error', msg: 'Invalid Skip certificate validation value, must be true or false' };
};
