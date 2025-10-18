import { type ValidationMsg, ValidationState } from '@utils/validation/Validation';

import { validateURL } from '../../common';

export const validateOpenshiftURL = (url: string | number | undefined): ValidationMsg => {
  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (url === undefined) {
    return {
      msg: 'The URL of the Openshift Virtualization API endpoint, for example: https://example.com:6443 .',
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
      msg: 'The URL of the Openshift Virtualization API endpoint, for example: https://example.com:6443 .',
      type: ValidationState.Default,
    };
  }

  if (!isValidURL) {
    return {
      msg: 'The URL is invalid. URL should include the schema, for example: https://example.com:6443 .',
      type: ValidationState.Error,
    };
  }

  return {
    msg: 'The URL of the Openshift Virtualization API endpoint, for example: https://example.com:6443 .',
    type: ValidationState.Success,
  };
};
