import { validateURL, type ValidationMsg } from '../../common';

export const validateVSphereUILink = (uiLink: string | number): ValidationMsg => {
  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (uiLink === undefined) {
    return {
      msg: 'The link of the VMware vSphere UI. For example, https://vSphere-host-example.com/ui.',
      type: 'default',
    };
  }

  // Sanity check
  if (typeof uiLink !== 'string') {
    return {
      msg: 'The link for the VMware vSphere UI is not a string',
      type: 'error',
    };
  }

  const trimmedUrl: string = uiLink.trim();
  const isValidURL = validateURL(trimmedUrl);

  if (trimmedUrl === '') {
    return {
      msg: 'The link for the VMware vSphere UI is empty. A default or an empty value will be used.',
      type: 'warning',
    };
  }

  if (!isValidURL) {
    return {
      msg: 'The link for the VMware vSphere UI is invalid. It should include the schema and path, for example: https://vSphere-host-example.com/ui.',
      type: 'error',
    };
  }

  if (!trimmedUrl.endsWith('ui') && !trimmedUrl.endsWith('ui/'))
    return {
      msg: 'The link for the VMware vSphere UI does not end with a /ui path, for example: https://vSphere-host-example.com/ui.',
      type: 'warning',
    };

  return {
    msg: 'The link of the VMware vSphere UI. For example, https://vSphere-host-example.com/ui.',
    type: 'success',
  };
};
