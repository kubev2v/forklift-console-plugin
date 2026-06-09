import type { ProviderVirtualMachine } from '@forklift-ui/types';
import { PROVIDER_TYPES } from '@utils/providers/constants';

export const getVmGuestOS = (vm: ProviderVirtualMachine | undefined): string => {
  if (!vm) return '';

  switch (vm.providerType) {
    case PROVIDER_TYPES.vsphere:
      return vm.guestName || vm.guestNameFromVmwareTools || vm.guestId || '';
    case PROVIDER_TYPES.hyperv:
      return vm.guestOS ?? '';
    case PROVIDER_TYPES.ova:
      return vm.osType ?? '';
    case PROVIDER_TYPES.ovirt:
      return vm.guestName || vm.osType || '';
    case PROVIDER_TYPES.openshift:
    case PROVIDER_TYPES.openstack:
    default:
      return '';
  }
};
