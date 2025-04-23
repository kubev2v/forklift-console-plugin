import type { OVirtNicProfile, ProviderVirtualMachine } from '@kubev2v/types';

import type { VmData } from '../../details/tabs/VirtualMachines/components/VMCellProps';

import { POD_NETWORK } from './actions';

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
          acc.push(POD_NETWORK);
        } else if (networkName) {
          acc.push(networkName);
        }

        return acc;
      }, []);
    }
    case 'ova': {
      return vm?.Networks?.map((network) => network.name) ?? [];
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

// based on packages legacy/src/Plans/components/Wizard/helpers.tsx
export const getNetworksUsedBySelectedVms = (
  selectedVMs: VmData[],
  nicProfiles: OVirtNicProfile[],
): string[] => {
  return Array.from(
    new Set(
      selectedVMs
        ?.map(({ vm }) => vm)
        .flatMap((vm) => toNetworks(vm, nicProfiles))
        .filter(Boolean),
    ),
  );
};
