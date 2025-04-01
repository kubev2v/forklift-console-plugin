import { validateURL, ValidationMsg } from '../../common';

export const validateOpenshiftUILink = (uiLink: string | number): ValidationMsg => {
  // For a newly opened form where the field is not set yet, set the validation type to default.
  if (uiLink === undefined) {
    return {
      type: 'default',
      msg: 'The link for OpenShift Virtualization web console UI. For example, https://console-openshift-console.apps.openshift-domain.com.',
    };
  }

  // Sanity check
  if (typeof uiLink !== 'string') {
    return {
      type: 'error',
      msg: 'The link for the OpenShift Virtualization web console UI is not a string',
    };
  }

  const trimmedUrl: string = uiLink.trim();
  const isValidURL = validateURL(trimmedUrl);

  if (trimmedUrl === '') {
    return {
      type: 'warning',
      msg: 'The link for the OpenShift Virtualization web console UI is empty. A default or an empty value will be used.',
    };
  }

  if (!isValidURL) {
    return {
      type: 'error',
      msg: 'The link for the OpenShift Virtualization web console UI invalid. It should include the schema and path, for example: https://console-openshift-console.apps.openshift-domain.com.',
    };
  }

  return {
    type: 'success',
    msg: 'The link for OpenShift Virtualization web console UI. For example, https://console-openshift-console.apps.openshift-domain.com.',
  };
};
