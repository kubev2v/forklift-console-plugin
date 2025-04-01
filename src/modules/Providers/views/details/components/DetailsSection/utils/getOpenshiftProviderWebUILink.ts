import type { V1beta1Provider } from '@kubev2v/types';

import { getProviderUIAnnotation } from './getProviderUIAnnotation';

/**
 * A function for auto calculating the Openshift UI link.
 * It extracts the provider's Openshift UI link, E.g.  https://console-openshift-console.apps.example.com
 * from the Openshift URL, E.g. https://api.example.com:6443
 *
 * returns the calculated web ui link or an empty string if calculation is avoided
 */
export const getOpenshiftProviderWebUILink = (provider: V1beta1Provider): string => {
  // Check for custom link
  const customLink = getProviderUIAnnotation(provider);
  if (customLink) {
    return customLink;
  }

  const url = provider?.spec?.url;
  if (!url) {
    return '';
  }
  const urlObj = new URL(url);

  // Remove the port
  urlObj.port = '';

  // Replace the host prefix of 'api.' with 'console-openshift-console.apps.'
  if (urlObj.host.startsWith('api.')) {
    const newHostName = `console-openshift-console.apps.${urlObj.host.slice(4)}`;
    urlObj.host = newHostName;

    return urlObj.toString();
  }
  return '';
};
