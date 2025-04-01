import { validateURL, type ValidationMsg } from '../../common';

export const validateOpenstackUILink = (uiLink: string | number): ValidationMsg => {
  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (uiLink === undefined) {
    return {
      msg: 'The link for the OpenStack dashboard. For example, https://identity_service.com/dashboard.',
      type: 'default',
    };
  }

  // Sanity check
  if (typeof uiLink !== 'string') {
    return {
      msg: 'The link for the OpenStack dashboard is not a string.',
      type: 'error',
    };
  }

  const trimmedUrl: string = uiLink.trim();
  const isValidURL = validateURL(trimmedUrl);

  if (trimmedUrl === '') {
    return {
      msg: 'The link for the OpenStack dashboard is empty. A default or an empty value will be used.',
      type: 'warning',
    };
  }

  if (!isValidURL) {
    return {
      msg: 'The link for the OpenStack dashboard is invalid. It should include the schema and path, for example: https://identity_service.com/dashboard.',
      type: 'error',
    };
  }

  if (!trimmedUrl.endsWith('dashboard'))
    return {
      msg: 'The link for the OpenStack dashboard does not end with /dashboard path, for example: https://identity_service.com/dashboard.',
      type: 'warning',
    };

  return {
    msg: 'The link for the OpenStack dashboard. For example, https://identity_service.com/dashboard.',
    type: 'success',
  };
};
