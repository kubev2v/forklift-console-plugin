import { type ValidationMsg, ValidationState } from '@utils/validation/Validation';

import { validateURL } from '../../common';

export const validateEsxiURL = (url: string | number | undefined): ValidationMsg => {
  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (url === undefined) {
    return {
      msg: 'The URL is required, URL of the ESXi API endpoint for example: https://host-example.com/sdk.',
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
      msg: 'The URL is required, URL of the ESXi API endpoint for example: https://host-example.com/sdk.',
      type: ValidationState.Error,
    };
  }

  if (!isValidURL) {
    return {
      msg: 'The URL is invalid. URL should include the schema and path, for example: https://host-example.com/sdk.',
      type: ValidationState.Error,
    };
  }

  if (!trimmedUrl.endsWith('sdk'))
    return {
      msg: 'The URL does not end with a /sdk path, for example a URL with sdk path: https://host-example.com/sdk.',
      type: ValidationState.Warning,
    };

  return {
    msg: 'The URL of the ESXi API endpoint for example: https://host-example.com/sdk.',
    type: ValidationState.Success,
  };
};
