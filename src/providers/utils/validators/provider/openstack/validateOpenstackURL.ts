import { validateURL } from 'src/utils/validation/common';

import { type ValidationMsg, ValidationState } from '@utils/validation/Validation';

export const validateOpenstackURL = (url: string | number | undefined): ValidationMsg => {
  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (url === undefined) {
    return {
      msg: 'The URL is required, URL of the OpenStack Identity (Keystone) API endpoint, for example: https://identity_service.com:5000/v3 .',
      type: ValidationState.Default,
    };
  }

  // Sanity check
  if (typeof url !== 'string') {
    return { msg: 'URL is not a string', type: ValidationState.Error };
  }

  const trimmedUrl: string = url.trim();
  const isValidURL = validateURL(trimmedUrl);

  if (trimmedUrl === '') {
    return {
      msg: 'The URL is required, URL of the OpenStack Identity (Keystone) API endpoint, for example: https://identity_service.com:5000/v3 .',
      type: ValidationState.Error,
    };
  }

  if (!isValidURL) {
    return {
      msg: 'The URL is invalid. URL should include the schema and path, for example: https://identity_service.com:5000/v3 .',
      type: ValidationState.Error,
    };
  }

  if (!trimmedUrl.endsWith('v3'))
    return {
      msg: 'The URL does not end with a /v3 path, for example a URL with v3 path: https://identity_service.com:5000/v3 .',
      type: ValidationState.Warning,
    };

  return {
    msg: 'The URL of the OpenStack Identity (Keystone) API endpoint, for example: https://identity_service.com:5000/v3 .',
    type: ValidationState.Success,
  };
};
