import { type ValidationMsg, ValidationState } from '@utils/validation/Validation';

import { validateURL } from '../../common';

export const validateOpenshiftUILink = (uiLink: string | number): ValidationMsg => {
  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (uiLink === undefined) {
    return {
      msg: 'The link for OpenShift Virtualization web console UI. For example, https://console-openshift-console.apps.openshift-domain.com.',
      type: ValidationState.Default,
    };
  }

  // Sanity check
  if (typeof uiLink !== 'string') {
    return {
      msg: 'The link for the OpenShift Virtualization web console UI is not a string',
      type: ValidationState.Error,
    };
  }

  const trimmedUrl: string = uiLink.trim();
  const isValidURL = validateURL(trimmedUrl);

  if (trimmedUrl === '') {
    return {
      msg: 'The link for the OpenShift Virtualization web console UI is empty. A default or an empty value will be used.',
      type: ValidationState.Warning,
    };
  }

  if (!isValidURL) {
    return {
      msg: 'The link for the OpenShift Virtualization web console UI invalid. It should include the schema and path, for example: https://console-openshift-console.apps.openshift-domain.com.',
      type: ValidationState.Error,
    };
  }

  return {
    msg: 'The link for OpenShift Virtualization web console UI. For example, https://console-openshift-console.apps.openshift-domain.com.',
    type: ValidationState.Success,
  };
};
