import { validateURL, ValidationMsg } from '../../common';

export const validateVSphereUILink = (uiLink: string | number): ValidationMsg => {
  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (uiLink === undefined) {
    return {
      type: 'default',
      msg: 'The link of the VMware vSphere UI. For example, https://vSphere-host-example.com/ui.',
    };
  }

  // Sanity check
  if (typeof uiLink !== 'string') {
    return {
      type: 'error',
      msg: 'The link for the VMware vSphere UI is not a string',
    };
  }

  const trimmedUrl: string = uiLink.trim();
  const isValidURL = validateURL(trimmedUrl);

  if (trimmedUrl === '') {
    return {
      type: 'warning',
      msg: 'The link for the VMware vSphere UI is empty. A default or an empty value will be used.',
    };
  }

  if (!isValidURL) {
    return {
      type: 'error',
      msg: 'The link for the VMware vSphere UI is invalid. It should include the schema and path, for example: https://vSphere-host-example.com/ui.',
    };
  }

  if (!trimmedUrl.endsWith('ui') && !trimmedUrl.endsWith('ui/'))
    return {
      msg: 'The link for the VMware vSphere UI does not end with a /ui path, for example: https://vSphere-host-example.com/ui.',
      type: 'warning',
    };

  return {
    type: 'success',
    msg: 'The link of the VMware vSphere UI. For example, https://vSphere-host-example.com/ui.',
  };
};
