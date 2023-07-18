import { Validation } from '../../types';
import { validateK8sToken } from '../common';

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
export const openshiftSecretFieldValidator = (id: string, value: string) => {
  const trimmedValue = value.trim();

  let validationState: Validation;

  switch (id) {
    case 'token':
      validationState = trimmedValue === '' || validateK8sToken(trimmedValue) ? 'success' : 'error';
      break;
    default:
      validationState = 'default';
      break;
  }

  return validationState;
};
