import { validateURL, ValidationMsg } from '../../common';

export const validateOpenstackURL = (url: string | number): ValidationMsg => {
  // Sanity check
  if (typeof url !== 'string') {
    return { type: 'error', msg: 'URL is not a string' };
  }

  const trimmedUrl: string = url.toString().trim();
  const isValidURL = validateURL(trimmedUrl);

  if (!isValidURL) {
    return {
      type: 'error',
      msg: 'The URL is invalid. URL should include the schema and path, for example: https://identity_service.com:5000/v3 .',
    };
  }

  if (!trimmedUrl.endsWith('v3') && !trimmedUrl.endsWith('v3/'))
    return {
      msg: 'The URL does not end with a /v3 path, for example a URL with v3 path: https://identity_service.com:5000/v3 .',
      type: 'warning',
    };

  return {
    type: 'success',
    msg: 'The URL of the OpenStack Identity (Keystone) API endpoint, for example: https://identity_service.com:5000/v3 .',
  };
};
