import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import type { InventoryStorage } from 'src/utils/hooks/useStorages';

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
    case PROVIDER_TYPES.openshift: {
      if (resource.namespace) {
        return `${resource.namespace}/${resource.name}`;
      }
      return resource.name;
    }
    case PROVIDER_TYPES.ec2:
    case PROVIDER_TYPES.hyperv:
    case PROVIDER_TYPES.ova:
    case PROVIDER_TYPES.vsphere:
    case PROVIDER_TYPES.openstack: {
      return resource.name || '';
    }
    case PROVIDER_TYPES.ovirt: {
      // Use path for oVirt if available, fall back to name for storage resources
      if ('path' in resource && resource.path) {
        return resource.path;
      }
      return resource.name || '';
    }
    default: {
      return '';
    }
  }
};
