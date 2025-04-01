import { validateURL, type ValidationMsg } from '../../common';

export const validateEsxiURL = (url: string | number): ValidationMsg => {
  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (url === undefined) {
    return {
      msg: 'The URL is required, URL of the ESXi API endpoint for example: https://host-example.com/sdk .',
      type: 'default',
    };
  }

  // Sanity check
  if (typeof url !== 'string') {
    return { msg: 'URL is not a string', type: 'error' };
  }

  const trimmedUrl: string = url.trim();
  const isValidURL = validateURL(trimmedUrl);

  if (trimmedUrl === '') {
    return {
      msg: 'The URL is required, URL of the ESXi API endpoint for example: https://host-example.com/sdk .',
      type: 'error',
    };
  }

  if (!isValidURL) {
    return {
      msg: 'The URL is invalid. URL should include the schema and path, for example: https://host-example.com/sdk .',
      type: 'error',
    };
  }

  if (!trimmedUrl.endsWith('sdk'))
    return {
      msg: 'The URL does not end with a /sdk path, for example a URL with sdk path: https://host-example.com/sdk .',
      type: 'warning',
    };

  return {
    msg: 'The URL of the ESXi API endpoint for example: https://host-example.com/sdk .',
    type: 'success',
  };
};
