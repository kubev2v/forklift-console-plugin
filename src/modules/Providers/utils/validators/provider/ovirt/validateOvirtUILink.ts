import { validateURL, type ValidationMsg } from '../../common';

export const validateOvirtUILink = (uiLink: string | number): ValidationMsg => {
  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (uiLink === undefined) {
    return {
      msg: 'The link of the Red Hat Virtualization Manager (RHVM) landing page. For example, https://rhv-host-example.com/ovirt-engine.',
      type: 'default',
    };
  }

  // Sanity check
  if (typeof uiLink !== 'string') {
    return {
      msg: 'The link for the Red Hat Virtualization Manager landing page is not a string',
      type: 'error',
    };
  }

  const trimmedUrl: string = uiLink.trim();
  const isValidURL = validateURL(trimmedUrl);

  if (trimmedUrl === '') {
    return {
      msg: 'The link for the Red Hat Virtualization Manager landing page is empty. A default or an empty value will be used.',
      type: 'warning',
    };
  }

  if (!isValidURL) {
    return {
      msg: 'The link for the Red Hat Virtualization Manager landing page is invalid. It should include the schema and path, for example: https://rhv-host-example.com/ovirt-engine.',
      type: 'error',
    };
  }

  if (!trimmedUrl.endsWith('ovirt-engine') && !trimmedUrl.endsWith('ovirt-engine/'))
    return {
      msg: 'The link for the Red Hat Virtualization Manager landing page does not end with a /ovirt-engine path, for example: https://rhv-host-example.com/ovirt-engine.',
      type: 'warning',
    };

  return {
    msg: 'The link for the Red Hat Virtualization Manager landing page. For example, https://rhv-host-example.com/ovirt-engine.',
    type: 'success',
  };
};
