import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import type { ProviderData } from 'src/providers/utils/types/ProviderData';

import type {
  OpenshiftProvider,
  OpenstackProvider,
  OvaProvider,
  OVirtProvider,
  VSphereProvider,
} from '@kubev2v/types';

export const getProviderStorageCount = (provider: ProviderData) => {
  const { inventory } = provider;

  switch (inventory?.type) {
    case PROVIDER_TYPES.ova:
      return (inventory as OvaProvider).storageCount;
    case PROVIDER_TYPES.openshift:
      return (inventory as OpenshiftProvider).storageClassCount;
    case PROVIDER_TYPES.vsphere:
      return (inventory as VSphereProvider).datastoreCount;
    case PROVIDER_TYPES.openstack:
      return (inventory as OpenstackProvider).volumeTypeCount;
    case PROVIDER_TYPES.ovirt:
      return (inventory as OVirtProvider).storageDomainCount;
    case undefined:
    default: {
      return undefined;
    }
  }
};
