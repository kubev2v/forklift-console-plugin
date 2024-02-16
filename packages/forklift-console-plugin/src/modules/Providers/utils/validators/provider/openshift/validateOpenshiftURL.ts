import { validateURL, ValidationMsg } from '../../common';

export const validateOpenshiftURL = (url: string | number): ValidationMsg => {
  // Sanity check
  if (typeof url !== 'string') {
    return { type: 'error', msg: 'URL is not a string' };
  }

  const trimmedUrl: string = url.toString().trim();
  const isValidURL = validateURL(trimmedUrl);

  if (trimmedUrl === '') {
    return {
      type: 'default',
      msg: 'The URL of the Openshift Virtualization API endpoint, for example: https://example.com:6443 .',
    };
  }

  if (!isValidURL) {
    return {
      type: 'error',
      msg: 'The URL is invalid. URL should include the schema, for example: https://example.com:6443 .',
    };
  }

  return {
    type: 'success',
    msg: 'The URL of the Openshift Virtualization API endpoint, for example: https://example.com:6443 .',
  };
};
