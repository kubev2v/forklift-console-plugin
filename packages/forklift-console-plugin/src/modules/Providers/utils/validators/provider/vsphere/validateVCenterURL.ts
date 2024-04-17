import { validateURL, ValidationMsg } from '../../common';

export const validateVCenterURL = (url: string | number): ValidationMsg => {
  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (url === undefined) {
    return {
      type: 'default',
      msg: 'The URL is required, URL of the vCenter API endpoint for example: https://host-example.com/sdk .',
    };
  }

  // Sanity check
  if (typeof url !== 'string') {
    return { type: 'error', msg: 'URL is not a string' };
  }

  const trimmedUrl: string = url.trim();
  const isValidURL = validateURL(trimmedUrl);

  if (trimmedUrl === '') {
    return {
      type: 'error',
      msg: 'The URL is required, URL of the vCenter API endpoint for example: https://host-example.com/sdk .',
    };
  }

  if (!isValidURL) {
    return {
      type: 'error',
      msg: 'The URL is invalid. URL should include the schema and path, for example: https://host-example.com/sdk .',
    };
  }

  if (!trimmedUrl.endsWith('sdk') && !trimmedUrl.endsWith('sdk/'))
    return {
      msg: 'The URL does not end with a /sdk path, for example a URL with sdk path: https://host-example.com/sdk .',
      type: 'warning',
    };

  return {
    type: 'success',
    msg: 'The URL of the vCenter API endpoint for example: https://host-example.com/sdk .',
  };
};
