import type {
  OpenshiftProvider,
  OpenstackProvider,
  OvaProvider,
  OVirtProvider,
  VSphereProvider,
} from '@kubev2v/types';

import type { ProviderData } from '../../../modules/Providers/utils/types/ProviderData';

export const getProviderStorageCount = (provider: ProviderData) => {
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let storageCount: number;
  const { inventory } = provider;

  switch (inventory?.type) {
    case 'ova':
      ({ storageCount } = inventory as OvaProvider);
      break;
    case 'openshift':
      storageCount = (inventory as OpenshiftProvider).storageClassCount;
      break;
    case 'vsphere':
      storageCount = (inventory as VSphereProvider).datastoreCount;
      break;
    case 'openstack':
      storageCount = (inventory as OpenstackProvider).volumeTypeCount;
      break;
    case 'ovirt':
      storageCount = (inventory as OVirtProvider).storageDomainCount;
      break;
    case undefined:
    default: {
      storageCount = 0;
    }
  }

  return storageCount;
};
