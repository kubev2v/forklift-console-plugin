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
export const openstackSecretFieldValidator = (id: string, value: string) => {
  const trimmedValue = value.trim();

  let validationState: Validation;

  switch (id) {
    case 'username':
      validationState = validateUsername(trimmedValue) ? 'success' : 'error';
      break;
    case 'password':
      validationState = validatePassword(trimmedValue) ? 'success' : 'error';
      break;
    case 'regionName':
      validationState = validateRegionName(trimmedValue) ? 'success' : 'error';
      break;
    case 'projectName':
      validationState = validateProjectName(trimmedValue) ? 'success' : 'error';
      break;
    case 'domainName':
      validationState = validateDomainName(trimmedValue) ? 'success' : 'error';
      break;
    case 'token':
      validationState = validateToken(trimmedValue) ? 'success' : 'error';
      break;
    case 'userID':
      validationState = validateUserID(trimmedValue) ? 'success' : 'error';
      break;
    case 'projectID':
      validationState = validateProjectID(trimmedValue) ? 'success' : 'error';
      break;
    case 'applicationCredentialID':
      validationState = validateApplicationCredentialID(trimmedValue) ? 'success' : 'error';
      break;
    case 'applicationCredentialSecret':
      validationState = validateApplicationCredentialSecret(trimmedValue) ? 'success' : 'error';
      break;
    case 'applicationCredentialName':
      validationState = validateApplicationCredentialName(trimmedValue) ? 'success' : 'error';
      break;
    case 'insecureSkipVerify':
      validationState = validateInsecureSkipVerify(trimmedValue) ? 'success' : 'error';
      break;
    case 'cacert':
      validationState = validateCacert(trimmedValue) ? 'success' : 'error';
      break;
    default:
      validationState = 'default';
      break;
  }

  return validationState;
};

const validateUsername = (value: string) => {
  return validateNoSpaces(value);
};

const validatePassword = (value: string) => {
  return validateNoSpaces(value);
};

const validateRegionName = (value: string) => {
  return validateNoSpaces(value);
};

const validateProjectName = (value: string) => {
  return validateNoSpaces(value);
};

const validateDomainName = (value: string) => {
  return validateNoSpaces(value);
};

const validateToken = (value: string) => {
  return validateNoSpaces(value);
};

const validateUserID = (value: string) => {
  return validateNoSpaces(value);
};

const validateProjectID = (value: string) => {
  return validateNoSpaces(value);
};

const validateApplicationCredentialID = (value: string) => {
  return validateNoSpaces(value);
};

const validateApplicationCredentialSecret = (value: string) => {
  return validateNoSpaces(value);
};

const validateApplicationCredentialName = (value: string) => {
  return validateNoSpaces(value);
};

const validateInsecureSkipVerify = (value: string) => {
  return ['true', 'false', ''].includes(value);
};

const validateCacert = (value: string) => {
  return value === '' || validatePublicCert(value);
};
