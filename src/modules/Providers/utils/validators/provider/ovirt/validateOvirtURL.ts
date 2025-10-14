import { type ValidationMsg, ValidationState } from '@utils/validation/Validation';

import { validateURL } from '../../common';

export const validateOvirtURL = (url: string | number | undefined): ValidationMsg => {
  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (url === undefined) {
    return {
      msg: 'The URL of the Red Hat Virtualization Manager (RHVM) API endpoint, for example: https://rhv-host-example.com/ovirt-engine/api .',
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
      msg: 'The URL is required. URL should include the schema and path, for example: https://rhv-host-example.com/ovirt-engine/api .',
      type: ValidationState.Error,
    };
  }

  if (!isValidURL) {
    return {
      msg: 'The URL is invalid. URL should include the schema and path, for example: https://rhv-host-example.com/ovirt-engine/api .',
      type: ValidationState.Error,
    };
  }

  if (!trimmedUrl.endsWith('ovirt-engine/api'))
    return {
      msg: 'The URL does not end with a /ovirt-engine/api path, for example a URL with a path: https://rhv-host-example.com/ovirt-engine/api .',
      type: ValidationState.Warning,
    };

  return {
    msg: 'The URL of the Red Hat Virtualization Manager (RHVM) API endpoint, for example: https://rhv-host-example.com/ovirt-engine/api .',
    type: ValidationState.Success,
  };
};
