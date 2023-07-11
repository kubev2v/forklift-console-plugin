import { Validation } from '../../types';
import { validateNoSpaces, validatePublicCert } from '../common';

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
export const ovirtSecretFieldValidator = (id: string, value: string) => {
  const trimmedValue = value.trim();

  let validationState: Validation;

  switch (id) {
    case 'user':
      validationState = validateUser(trimmedValue) ? 'success' : 'error';
      break;
    case 'password':
      validationState = validatePassword(trimmedValue) ? 'success' : 'error';
      break;
    case 'insecureSkipVerify':
      validationState = 'default';
      break;
    case 'cacert':
      validationState = validateCacert(trimmedValue);
      break;
    default:
      validationState = 'default';
      break;
  }

  return validationState;
};

const validateUser = (value: string) => {
  return validateNoSpaces(value);
};

const validatePassword = (value: string) => {
  return validateNoSpaces(value);
};

const validateCacert = (value: string) => {
  if (value === '') {
    return 'default';
  } else if (validatePublicCert(value)) {
    return 'success';
  } else {
    return 'error';
  }
};
