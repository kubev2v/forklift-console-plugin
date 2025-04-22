import type { V1beta1Provider } from '@kubev2v/types';

import { getProviderUIAnnotation } from './getProviderUIAnnotation';

/**
 * A function for auto calculating the RHV UI link.
 * It extracts the provider's RHV UI link from the RHV URL by searching for the URL's path of
 * '/ovirt-engine/api[/]' and cutting out the /api[/] path section.
 * If RHV URL is invalid then an empty string is returned
 */
export const getOvirtProviderWebUILink = (provider: V1beta1Provider): string => {
  // Check for custom link
  const customLink = getProviderUIAnnotation(provider);
  if (customLink) {
    return customLink;
  }

  // Calculate link using API URL
  const uiLinkRegexp = /(?<=ovirt-engine)\/api$/gu;
  const regexpResult = uiLinkRegexp.exec(provider?.spec?.url);

  return provider?.spec?.url && regexpResult
    ? provider?.spec?.url.slice(0, uiLinkRegexp.lastIndex - regexpResult[0].length)
    : '';
};
