import { validateURL } from 'src/utils/validation/common';

import { type ValidationMsg, ValidationState } from '@utils/validation/Validation';

export const validateOpenstackUILink = (uiLink: string | number): ValidationMsg => {
  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (uiLink === undefined) {
    return {
      msg: 'The link for the OpenStack dashboard. For example, https://identity_service.com/dashboard.',
      type: ValidationState.Default,
    };
  }

  // Sanity check
  if (typeof uiLink !== 'string') {
    return {
      msg: 'The link for the OpenStack dashboard is not a string.',
      type: ValidationState.Error,
    };
  }

  const trimmedUrl: string = uiLink.trim();
  const isValidURL = validateURL(trimmedUrl);

  if (trimmedUrl === '') {
    return {
      msg: 'The link for the OpenStack dashboard is empty. A default or an empty value will be used.',
      type: ValidationState.Warning,
    };
  }

  if (!isValidURL) {
    return {
      msg: 'The link for the OpenStack dashboard is invalid. It should include the schema and path, for example: https://identity_service.com/dashboard.',
      type: ValidationState.Error,
    };
  }

  if (!trimmedUrl.endsWith('dashboard'))
    return {
      msg: 'The link for the OpenStack dashboard does not end with /dashboard path, for example: https://identity_service.com/dashboard.',
      type: ValidationState.Warning,
    };

  return {
    msg: 'The link for the OpenStack dashboard. For example, https://identity_service.com/dashboard.',
    type: ValidationState.Success,
  };
};
