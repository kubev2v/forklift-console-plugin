import type {
  HypervProvider,
  OpenshiftProvider,
  OpenstackProvider,
  OvaProvider,
  OVirtProvider,
  VSphereProvider,
} from '@forklift-ui/types';
import { PROVIDER_TYPES } from '@utils/providers/constants';
import type { ProviderData } from '@utils/providers/types';

export const getProviderStorageCount = (provider: ProviderData) => {
  const { inventory } = provider;

  switch (inventory?.type) {
    case PROVIDER_TYPES.ova:
      return (inventory as OvaProvider).storageCount;
    case PROVIDER_TYPES.hyperv:
      return (inventory as HypervProvider).storageCount;
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
