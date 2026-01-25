import { validateURL } from 'src/utils/validation/common';

import { type ValidationMsg, ValidationState } from '@utils/validation/Validation';

export const validateOvirtUILink = (uiLink: string | number): ValidationMsg => {
  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (uiLink === undefined) {
    return {
      msg: 'The link of the Red Hat Virtualization Manager (RHVM) landing page. For example, https://rhv-host-example.com/ovirt-engine.',
      type: ValidationState.Default,
    };
  }

  // Sanity check
  if (typeof uiLink !== 'string') {
    return {
      msg: 'The link for the Red Hat Virtualization Manager landing page is not a string',
      type: ValidationState.Error,
    };
  }

  const trimmedUrl: string = uiLink.trim();
  const isValidURL = validateURL(trimmedUrl);

  if (trimmedUrl === '') {
    return {
      msg: 'The link for the Red Hat Virtualization Manager landing page is empty. A default or an empty value will be used.',
      type: ValidationState.Warning,
    };
  }

  if (!isValidURL) {
    return {
      msg: 'The link for the Red Hat Virtualization Manager landing page is invalid. It should include the schema and path, for example: https://rhv-host-example.com/ovirt-engine.',
      type: ValidationState.Error,
    };
  }

  if (!trimmedUrl.endsWith('ovirt-engine') && !trimmedUrl.endsWith('ovirt-engine/'))
    return {
      msg: 'The link for the Red Hat Virtualization Manager landing page does not end with a /ovirt-engine path, for example: https://rhv-host-example.com/ovirt-engine.',
      type: ValidationState.Warning,
    };

  return {
    msg: 'The link for the Red Hat Virtualization Manager landing page. For example, https://rhv-host-example.com/ovirt-engine.',
    type: ValidationState.Success,
  };
};
