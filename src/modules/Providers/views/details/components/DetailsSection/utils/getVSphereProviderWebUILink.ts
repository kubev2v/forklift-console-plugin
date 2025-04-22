import type { V1beta1Provider } from '@kubev2v/types';

import { getProviderUIAnnotation } from './getProviderUIAnnotation';

/**
 * A function for auto calculating the vSphere UI link.
 * It extracts the provider's vSphere UI link from the vSphere URL by searching for the URL's
 */
export const getVSphereProviderWebUILink = (provider: V1beta1Provider): string => {
  // Check for custom link
  const customLink = getProviderUIAnnotation(provider);
  if (customLink) {
    return customLink;
  }

  // Calculate link using API URL
  const url = provider?.spec?.url || '';
  const suffix = '/sdk';
  const newSuffix = '/ui';

  if (url.endsWith(suffix)) {
    return url.slice(0, -suffix.length) + newSuffix;
  }
  return '';
};
