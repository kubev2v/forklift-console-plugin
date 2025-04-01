import {
  validateNoSpaces,
  validatePublicCert,
  validateUsernameAndDomain,
  type ValidationMsg,
} from '../../common';

/**
 * Validates form input fields based on their id.
 *
 * @param {string} id - The ID of the form field.
 * @param {string} value - The value of the form field.
 *
 * @return {Validation} - The validation state of the form field. Can be one of the following:
 * 'default' - The default state of the form field, used when the field is empty or a value hasn't been entered yet.
 * 'success' - The field's value has passed validation.
 * 'warning' - The field's value has passed validation but does not fit the standard format, it's the user's choice if to accept that value.
 * 'error' - The field's value has failed validation.
 */
export const ovirtSecretFieldValidator = (id: string, value: string): ValidationMsg => {
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
      msg: 'A username for connecting to the Red Hat Virtualization Manager (RHVM) API endpoint, for example: name@internal . [required]',
      type: 'default',
    };
  }

  if (value === '') {
    return {
      msg: 'User name is required, the user name usually include `@` char, for example: name@internal .',
      type: 'error',
    };
  }

  if (!noSpaces) {
    return { msg: 'Invalid username, spaces are not allowed', type: 'error' };
  }

  const hasAtChar = validateUsernameAndDomain(value);

  if (!hasAtChar) {
    return {
      msg: 'User name usually include `@` char, for example: name@internal .',
      type: 'warning',
    };
  }

  return {
    msg: 'A username for connecting to the Red Hat Virtualization Manager (RHVM) API endpoint, for example: name@internal .',
    type: 'success',
  };
};

const validatePassword = (value: string): ValidationMsg => {
  const valid = validateNoSpaces(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (value === undefined) {
    return {
      msg: 'User name password is required, user password for connecting to the Red Hat Virtualization Manager (RHVM) API endpoint.',
      type: 'default',
    };
  }

  if (value === '') {
    return {
      msg: 'User name password is required, user password for connecting to the Red Hat Virtualization Manager (RHVM) API endpoint.',
      type: 'error',
    };
  }

  if (valid) {
    return {
      msg: 'A user password for connecting to the Red Hat Virtualization Manager (RHVM) API endpoint.',
      type: 'success',
    };
  }

  return { msg: 'Invalid password, spaces are not allowed', type: 'error' };
};

const validateCacert = (value: string): ValidationMsg => {
  const valid = validatePublicCert(value);

  // For a newly opened form where the field is not set yet, set the validation type to default.
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
