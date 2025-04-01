import { validateURL, ValidationMsg } from '../../common';

export const validateOvirtUILink = (uiLink: string | number): ValidationMsg => {
  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (uiLink === undefined) {
    return {
      type: 'default',
      msg: 'The link of the Red Hat Virtualization Manager (RHVM) landing page. For example, https://rhv-host-example.com/ovirt-engine.',
    };
  }

  // Sanity check
  if (typeof uiLink !== 'string') {
    return {
      type: 'error',
      msg: 'The link for the Red Hat Virtualization Manager landing page is not a string',
    };
  }

  const trimmedUrl: string = uiLink.trim();
  const isValidURL = validateURL(trimmedUrl);

  if (trimmedUrl === '') {
    return {
      type: 'warning',
      msg: 'The link for the Red Hat Virtualization Manager landing page is empty. A default or an empty value will be used.',
    };
  }

  if (!isValidURL) {
    return {
      type: 'error',
      msg: 'The link for the Red Hat Virtualization Manager landing page is invalid. It should include the schema and path, for example: https://rhv-host-example.com/ovirt-engine.',
    };
  }

  if (!trimmedUrl.endsWith('ovirt-engine') && !trimmedUrl.endsWith('ovirt-engine/'))
    return {
      msg: 'The link for the Red Hat Virtualization Manager landing page does not end with a /ovirt-engine path, for example: https://rhv-host-example.com/ovirt-engine.',
      type: 'warning',
    };

  return {
    type: 'success',
    msg: 'The link for the Red Hat Virtualization Manager landing page. For example, https://rhv-host-example.com/ovirt-engine.',
  };
};
