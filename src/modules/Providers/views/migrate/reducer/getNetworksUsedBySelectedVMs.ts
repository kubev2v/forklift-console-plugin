import { DefaultNetworkLabel } from 'src/plans/details/tabs/Mappings/utils/constants';

import type { OVirtNicProfile, ProviderVirtualMachine } from '@kubev2v/types';
import type { EnhancedOvaVM } from '@utils/crds/plans/type-enhancements';

const toNetworksOrProfiles = (vm: ProviderVirtualMachine): string[] => {
  switch (vm.providerType) {
    case 'vsphere': {
      return vm?.networks?.map((network) => network?.id) ?? [];
    }
    case 'openstack': {
      return Object.keys(vm?.addresses ?? {});
    }
    case 'ovirt': {
      return vm?.nics?.map((nic) => nic?.profile) ?? [];
    }
    case 'openshift': {
      return (vm?.object?.spec?.template?.spec?.networks ?? []).reduce((acc: string[], network) => {
        const networkName = network?.multus?.networkName;

        if (network?.pod) {
          acc.push(DefaultNetworkLabel.Target);
        } else if (networkName) {
          acc.push(networkName);
        }

        return acc;
      }, []);
    }
    case 'ova': {
      return (vm as EnhancedOvaVM)?.networks?.map((network) => network.ID) ?? [];
    }
    default:
      return [];
  }
};

export const toNetworks = (vm: ProviderVirtualMachine, nicProfiles?: OVirtNicProfile[]): string[] =>
  toNetworksOrProfiles(vm).reduce((acc: string[], network) => {
    const nicProfileNetwork = nicProfiles?.find(
      (nicProfile) => nicProfile?.id === network,
    )?.network;
    if (vm.providerType === 'ovirt' && nicProfileNetwork) {
      acc.push(nicProfileNetwork);
    } else {
      acc.push(network);
    }

    return acc;
  }, []);
