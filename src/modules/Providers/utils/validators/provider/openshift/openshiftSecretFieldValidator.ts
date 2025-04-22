import { validateK8sToken, validatePublicCert, type ValidationMsg } from '../../common';

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
  const trimmedValue = value?.trim();

  let validationMsg: ValidationMsg;

  switch (id) {
    case 'token':
      validationMsg = validateToken(trimmedValue);
      break;
    case 'insecureSkipVerify':
      validationMsg = validateInsecureSkipVerify(trimmedValue);
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

  if (value === undefined || value === '') {
    return {
      msg: 'A service account token, optional, used for authenticating the the connection to the API server.',
      type: 'default',
    };
  }

  if (valid) {
    return {
      msg: 'A service account token, optional, used for authenticating the the connection to the API server.',
      type: 'success',
    };
  }

  return {
    msg: 'Invalid token, a valid Kubernetes service account token is required',
    type: 'error',
  };
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
