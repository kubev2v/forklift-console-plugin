import { validateURL, type ValidationMsg } from '../../common';

export const validateOpenshiftURL = (url: string | number): ValidationMsg => {
  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (url === undefined) {
    return {
      msg: 'The URL of the Openshift Virtualization API endpoint, for example: https://example.com:6443 .',
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
      msg: 'The URL of the Openshift Virtualization API endpoint, for example: https://example.com:6443 .',
      type: 'default',
    };
  }

  if (!isValidURL) {
    return {
      msg: 'The URL is invalid. URL should include the schema, for example: https://example.com:6443 .',
      type: 'error',
    };
  }

  return {
    msg: 'The URL of the Openshift Virtualization API endpoint, for example: https://example.com:6443 .',
    type: 'success',
  };
};
