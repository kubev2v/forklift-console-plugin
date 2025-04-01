import { validateURL, ValidationMsg } from '../../common';

export const validateOpenstackUILink = (uiLink: string | number): ValidationMsg => {
  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (uiLink === undefined) {
    return {
      type: 'default',
      msg: 'The link for the OpenStack dashboard. For example, https://identity_service.com/dashboard.',
    };
  }

  // Sanity check
  if (typeof uiLink !== 'string') {
    return {
      type: 'error',
      msg: 'The link for the OpenStack dashboard is not a string.',
    };
  }

  const trimmedUrl: string = uiLink.trim();
  const isValidURL = validateURL(trimmedUrl);

  if (trimmedUrl === '') {
    return {
      type: 'warning',
      msg: 'The link for the OpenStack dashboard is empty. A default or an empty value will be used.',
    };
  }

  if (!isValidURL) {
    return {
      type: 'error',
      msg: 'The link for the OpenStack dashboard is invalid. It should include the schema and path, for example: https://identity_service.com/dashboard.',
    };
  }

  if (!trimmedUrl.endsWith('dashboard'))
    return {
      msg: 'The link for the OpenStack dashboard does not end with /dashboard path, for example: https://identity_service.com/dashboard.',
      type: 'warning',
    };

  return {
    type: 'success',
    msg: 'The link for the OpenStack dashboard. For example, https://identity_service.com/dashboard.',
  };
};
