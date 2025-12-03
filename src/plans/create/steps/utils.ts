import type { InventoryStorage } from 'src/modules/Providers/hooks/useStorages';

import type { ProviderNetwork } from '../types';

/**
 * Creates a label for a resource (network or storage) based on provider type.
 * Different providers have different naming conventions for resources.
 *
 * @param resource - The resource object (either ProviderNetwork or InventoryStorage)
 * @returns A formatted string label appropriate for the resource type and provider
 */
export const getMapResourceLabel = (
  resource: ProviderNetwork | InventoryStorage | undefined,
): string => {
  if (!resource?.providerType) {
    return '';
  }
  switch (resource.providerType) {
    case 'openshift': {
      return resource.namespace ? `${resource.namespace}/${resource.name}` : resource.name;
    }
    case 'ova':
    case 'vsphere':
    case 'openstack': {
      return resource.name || '';
    }
    case 'ovirt': {
      // Use path for oVirt if available
      // For network: fall back to empty string
      // For storage: fall back to name
      const isStorageResource = 'name' in resource && resource.name !== undefined;
      return resource.path ?? (isStorageResource ? resource.name || '' : '');
    }
    default: {
      return '';
    }
  }
};
