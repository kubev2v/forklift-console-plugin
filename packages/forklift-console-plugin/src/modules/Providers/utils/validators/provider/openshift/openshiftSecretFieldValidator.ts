import { validateK8sToken, validatePublicCert, ValidationMsg } from '../../common';

/**
 * Validates form input fields based on their id.
 *
 * @param {string} id - The ID of the form field.
 * @param {string} value - The value of the form field.
 *
 * @return {ValidationMsg} - The validation state of the form field.
 *
 * Validation type be one of the following:
 *  'default' - The default state of the form field, used when the field is empty or a value hasn't been entered yet.
 *  'success' - The field's value has passed validation.
 *  'error' - The field's value has failed validation.
 *
 * Validation msg and description should add information about the validation type.
 */
export const openshiftSecretFieldValidator = (id: string, value: string): ValidationMsg => {
  const trimmedValue = value.trim();

  let validationMsg: ValidationMsg;

  switch (id) {
    case 'token':
      validationMsg = validateToken(trimmedValue);
      break;
    case 'insecureSkipVerify':
      validationMsg = { type: 'default', msg: 'Migrate without validating a CA certificate' };
      break;
    case 'cacert':
      validationMsg = validateCacert(trimmedValue);
      break;
    default:
      validationMsg = { type: 'default' };
      break;
  }

  return validationMsg;
};

const validateToken = (value: string): ValidationMsg => {
  const valid = validateK8sToken(value);

  if (value === '') {
    return {
      type: 'default',
      msg: 'A service account token, required for authenticating the the connection to the API server.',
    };
  }

  if (valid) {
    return {
      type: 'success',
      msg: 'A service account token, required for authenticating the the connection to the API server.',
    };
  }

  return {
    type: 'error',
    msg: 'Invalid token, a valid Kubernetes service account token is required',
  };
};

const validateCacert = (value: string): ValidationMsg => {
  const valid = validatePublicCert(value);

  if (value === '') {
    return {
      type: 'default',
      msg: 'The Manager CA certificate unless it was replaced by a third-party certificate, in which case enter the Manager Apache CA certificate.',
    };
  }

  if (valid) {
    return {
      type: 'success',
      msg: 'The Manager CA certificate unless it was replaced by a third-party certificate, in which case enter the Manager Apache CA certificate.',
    };
  }

  return {
    type: 'error',
    msg: 'Invalid CA certificate, certificate must be in a valid PEM encoded X.509 format.',
  };
};
