import { DefaultNetworkLabel } from 'src/plans/details/tabs/Mappings/utils/constants';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type { OVirtNicProfile, ProviderVirtualMachine } from '@forklift-ui/types';

const getNetworksForVM = (vm: ProviderVirtualMachine) => {
  if (vm.providerType === (PROVIDER_TYPES.ec2 as string)) return [];

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
      const networks = vm?.object?.spec?.template?.spec?.networks;

      if (!networks) {
        return [];
      }
      return networks.map((network) =>
        network?.pod ? DefaultNetworkLabel.Source : (network?.multus?.networkName ?? network?.name),
      );
    }
    case PROVIDER_TYPES.hyperv:
      return vm?.networks?.map((network) => network?.id) ?? [];
    case PROVIDER_TYPES.ova: {
      return vm?.networks?.map((network) => network?.id) ?? [];
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
