import { PodNetworkLabel } from 'src/plans/details/tabs/Mappings/utils/constants';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type { OVirtNicProfile, ProviderVirtualMachine } from '@kubev2v/types';

const getNetworksForVM = (vm: ProviderVirtualMachine) => {
  switch (vm.providerType) {
    case PROVIDER_TYPES.vsphere: {
      return vm?.networks?.map((network) => network?.id) ?? [];
    }
    case PROVIDER_TYPES.openstack: {
      return Object.keys(vm?.addresses ?? {});
    }
    case PROVIDER_TYPES.ovirt: {
      return vm?.nics?.map((nic) => nic?.profile) ?? [];
    }
    case PROVIDER_TYPES.openshift: {
      return (
        vm?.object?.spec?.template?.spec?.networks?.map((network) =>
          network?.pod ? PodNetworkLabel.Source : network?.multus?.networkName,
        ) ?? []
      );
    }
    case PROVIDER_TYPES.ova: {
      return vm?.networks?.map((network) => Object?.values(network)[0]) ?? [];
    }
    default:
      return [];
  }
};

export const getVMNetworksOrProfiles = (
  vm: ProviderVirtualMachine,
  nicProfiles?: OVirtNicProfile[],
) =>
  getNetworksForVM(vm).map((network: unknown) =>
    vm.providerType === PROVIDER_TYPES.ovirt && nicProfiles
      ? nicProfiles.find((nicProfile) => nicProfile?.id === network)?.network
      : network,
  );
