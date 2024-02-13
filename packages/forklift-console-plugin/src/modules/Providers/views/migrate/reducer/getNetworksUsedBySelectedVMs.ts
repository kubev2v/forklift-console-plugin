import { OVirtNicProfile, ProviderVirtualMachine } from '@kubev2v/types';

import { VmData } from '../../details';

import { POD_NETWORK } from './actions';

// based on packages/legacy/src/Plans/components/Wizard/helpers.tsx
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

export const toNetworks = (vm: ProviderVirtualMachine, nicProfiles?: OVirtNicProfile[]) =>
  toNetworksOrProfiles(vm).map((network) =>
    vm.providerType === 'ovirt' && nicProfiles
      ? nicProfiles.find((nicProfile) => nicProfile?.id === network)?.network
      : network,
  );

export const toNetworksOrProfiles = (vm) => {
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
      return (
        vm?.object?.spec?.template?.spec?.networks?.map((network) =>
          network?.pod ? POD_NETWORK : network?.multus?.networkName,
        ) ?? []
      );
    }
    default:
      return [];
  }
};
