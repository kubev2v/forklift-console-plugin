import { validateURL, ValidationMsg } from '../../common';

export const validateOvirtURL = (url: string | number): ValidationMsg => {
  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (url === undefined) {
    return {
      type: 'default',
      msg: 'The URL of the Red Hat Virtualization Manager (RHVM) API endpoint, for example: https://rhv-host-example.com/ovirt-engine/api .',
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
      msg: 'The URL is required. URL should include the schema and path, for example: https://rhv-host-example.com/ovirt-engine/api .',
    };
  }

  if (!isValidURL) {
    return {
      type: 'error',
      msg: 'The URL is invalid. URL should include the schema and path, for example: https://rhv-host-example.com/ovirt-engine/api .',
    };
  }

  if (!trimmedUrl.endsWith('ovirt-engine/api'))
    return {
      msg: 'The URL does not end with a /ovirt-engine/api path, for example a URL with a path: https://rhv-host-example.com/ovirt-engine/api .',
      type: 'warning',
    };

  return {
    type: 'success',
    msg: 'The URL of the Red Hat Virtualization Manager (RHVM) API endpoint, for example: https://rhv-host-example.com/ovirt-engine/api .',
  };
};
