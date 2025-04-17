import type {
  OpenshiftProvider,
  OpenstackProvider,
  OvaProvider,
  OVirtProvider,
  VSphereProvider,
} from '@kubev2v/types';

import type { ProviderData } from '../../../modules/Providers/utils/types/ProviderData';

export const getProviderStorageCount = (provider: ProviderData) => {
  const { inventory } = provider;

  switch (inventory?.type) {
    case 'ova':
      return (inventory as OvaProvider).storageCount;
    case 'openshift':
      return (inventory as OpenshiftProvider).storageClassCount;
    case 'vsphere':
      return (inventory as VSphereProvider).datastoreCount;
    case 'openstack':
      return (inventory as OpenstackProvider).volumeTypeCount;
    case 'ovirt':
      return (inventory as OVirtProvider).storageDomainCount;
    case undefined:
    default: {
      return 0;
    }
  }
};
