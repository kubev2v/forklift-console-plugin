import { validateURL } from 'src/utils/validation/common';

import { type ValidationMsg, ValidationState } from '@utils/validation/Validation';

export const validateVSphereUILink = (uiLink: string | number): ValidationMsg => {
  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (uiLink === undefined) {
    return {
      msg: 'The link of the VMware vSphere UI. For example, https://vSphere-host-example.com/ui.',
      type: ValidationState.Default,
    };
  }

  // Sanity check
  if (typeof uiLink !== 'string') {
    return {
      msg: 'The link for the VMware vSphere UI is not a string',
      type: ValidationState.Error,
    };
  }

  const trimmedUrl: string = uiLink.trim();
  const isValidURL = validateURL(trimmedUrl);

  if (trimmedUrl === '') {
    return {
      msg: 'The link for the VMware vSphere UI is empty. A default or an empty value will be used.',
      type: ValidationState.Warning,
    };
  }

  if (!isValidURL) {
    return {
      msg: 'The link for the VMware vSphere UI is invalid. It should include the schema and path, for example: https://vSphere-host-example.com/ui.',
      type: ValidationState.Error,
    };
  }

  if (!trimmedUrl.endsWith('ui') && !trimmedUrl.endsWith('ui/'))
    return {
      msg: 'The link for the VMware vSphere UI does not end with a /ui path, for example: https://vSphere-host-example.com/ui.',
      type: ValidationState.Warning,
    };

  return {
    msg: 'The link of the VMware vSphere UI. For example, https://vSphere-host-example.com/ui.',
    type: ValidationState.Success,
  };
};
