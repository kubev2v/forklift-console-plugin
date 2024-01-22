import { OVirtNicProfile } from '@kubev2v/types';

import { VmData } from '../details';

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
        .flatMap((vm) => {
          switch (vm.providerType) {
            case 'vsphere': {
              return vm.networks?.map((network) => network?.id);
            }
            case 'openstack': {
              return Object.keys(vm?.addresses ?? {});
            }
            case 'ovirt': {
              const vmNicProfiles = vm.nics?.map((nic) =>
                nicProfiles.find((nicProfile) => nicProfile?.id === nic?.profile),
              );
              const networkIds = vmNicProfiles?.map((nicProfile) => nicProfile?.network);
              return networkIds;
            }
            case 'openshift': {
              return vm?.object?.spec?.template?.spec?.networks?.map((network) =>
                network?.pod ? POD_NETWORK : network?.multus?.networkName,
              );
            }
            default:
              return [];
          }
        })
        .filter(Boolean),
    ),
  );
};
