import type { V1beta1Provider } from '@kubev2v/types';

import { getProviderUIAnnotation } from './getProviderUIAnnotation';

/**
 * A function for auto calculating the OpenStack UI link.
 * It extracts the provider's OpenStack UI link, E.g.  https://identity_service.com/dashboard
 * from the OpenStack URL, E.g. https://identity_service.com:5000/v3
 *
 * returns the calculated web ui link or an empty string if calculation is avoided
 */
export const getOpenstackProviderWebUILink = (provider: V1beta1Provider): string => {
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

  // Replace the '/v3' path with the '/dashboard' path
  if (urlObj.pathname.endsWith('/v3')) {
    const newPath = `${urlObj.pathname.slice(0, -3)}/dashboard`;
    urlObj.pathname = newPath;

    return urlObj.toString();
  }
  return '';
};
