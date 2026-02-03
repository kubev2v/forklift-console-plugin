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
    case 'openshift': {
      // OpenShift resources have namespace from OpenshiftResource base type
      if (resource.namespace) {
        return `${resource.namespace}/${resource.name}`;
      }
      return resource.name;
    }
    case 'hyperv':
    case 'ova':
    case 'vsphere':
    case 'openstack': {
      return resource.name || '';
    }
    case 'ovirt': {
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
