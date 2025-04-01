import React from 'react';
import type { SelectableGalleryItem } from 'src/modules/Providers/utils/components/Gallery/SelectableGallery';

import type { V1beta1Provider } from '@kubev2v/types';

import providerTypes from '../constanats/providerTypes';

import { ProviderCardContent } from './ProviderCardContent';
import { ProviderCardTitle } from './providerCardTitle';

/**
 * Generates an object containing the items for the provider card gallery.
 * Each item includes the title, logo, and content components for a provider.
 * @param {V1beta1Provider[]} providers - The array of providers to generate gallery items for.
 * @returns {Record<string, SelectableGalleryItem>} An object mapping provider UIDs to card item data.
 */
export const createProviderCardItems = (
  providers: V1beta1Provider[],
): Record<string, SelectableGalleryItem> => {
  const providerCardItems = {};

  (providers || []).forEach((provider) => {
    const typeObj = providerTypes[provider.spec.type];

    providerCardItems[provider.metadata.uid] = {
      content: <ProviderCardContent provider={provider} typeLabel={typeObj.title} />,
      logo: typeObj.logo,
      title: <ProviderCardTitle provider={provider} />,
    };
  });

  return providerCardItems;
};

/**
 * Finds a provider by its unique identifier (UID) among a list of providers.
 * @param {string} id - The unique identifier of the provider to find.
 * @param {V1beta1Provider[]} providers - The array of providers to search through.
 * @returns {V1beta1Provider | undefined} The provider found, or undefined if not found.
 */
export const findProviderByID = (
  id: string,
  providers: V1beta1Provider[],
): V1beta1Provider | undefined => {
  return providers.find((provider) => provider.metadata.uid === id);
};
