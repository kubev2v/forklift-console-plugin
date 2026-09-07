import type { OVirtNicProfile, OVirtVM, ProviderVirtualMachine } from '@forklift-ui/types';
import { DEFAULT_NETWORK } from '@utils/constants';
import { PROVIDER_TYPES } from '@utils/providers/constants';
import { getEc2SubnetIds, isEc2Vm } from '@utils/types/ec2Inventory';
import { getNutanixSubnetIds, isNutanixVm } from '@utils/types/nutanixInventory';

import type { ProviderNetwork } from '../../types';

const toNetworksOrProfiles = (vm: ProviderVirtualMachine): string[] => {
  if (isEc2Vm(vm)) {
    return getEc2SubnetIds(vm);
  }

  if (isNutanixVm(vm)) {
    return getNutanixSubnetIds(vm);
  }

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
      return (vm?.object?.spec?.template?.spec?.networks ?? []).reduce((acc: string[], network) => {
        const networkName = network?.multus?.networkName ?? network?.name;

        if (network?.pod) {
          acc.push(DEFAULT_NETWORK);
        } else if (networkName) {
          acc.push(networkName);
        }
        return acc;
      }, []);
    }
    case PROVIDER_TYPES.ova: {
      // The OVA backend returns embedded network objects with PascalCase field names (ID),
      // while @forklift-ui/types defines them as camelCase (id). Access ID directly
      // and fall back to id so the code keeps working if the API is ever aligned.
      type RawOvaNet = { ID?: string };
      return (
        vm?.networks
          ?.map((network) => (network as unknown as RawOvaNet).ID ?? network.id)
          .filter((id): id is string => Boolean(id)) ?? []
      );
    }
    case PROVIDER_TYPES.hyperv:
      return vm?.networks?.map((network) => network?.id) ?? [];
    default:
      return [];
  }
};

const toNetworks = (vm: ProviderVirtualMachine, nicProfiles?: OVirtNicProfile[]): string[] => {
  return toNetworksOrProfiles(vm).reduce((acc: string[], network) => {
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
};

const createNicProfileToNetworkMap = (
  nicProfiles: OVirtNicProfile[],
  availableNetworks: ProviderNetwork[] = [],
): Map<string, string> => {
  const networkByName = new Map(
    availableNetworks.map((network) => [network.name.toLowerCase(), network.id]),
  );

  return new Map(
    nicProfiles.flatMap((profile) => {
      if (profile.network) {
        return [[profile.id, profile.network]];
      }

      const networkId = networkByName.get(profile.name.toLowerCase());
      return networkId ? [[profile.id, networkId]] : [];
    }),
  );
};

const getOvirtNetworkIds = (vm: OVirtVM, nicProfileToNetworkMap: Map<string, string>): string[] => {
  return (
    vm.nics?.reduce<string[]>((acc, nic) => {
      const networkId = nicProfileToNetworkMap.get(nic.profile);
      const id = networkId ?? nic.profile;

      return id ? [...acc, id] : acc;
    }, []) ?? []
  );
};

export const getNetworksUsedByProviderVms = (
  providerVms: ProviderVirtualMachine[],
  nicProfiles: OVirtNicProfile[] = [],
  availableNetworks: ProviderNetwork[] = [],
): string[] => {
  const nicProfileToNetworkMap = createNicProfileToNetworkMap(nicProfiles, availableNetworks);

  const networkIdSet = providerVms.reduce<Set<string>>((acc, vm) => {
    const networkIds =
      vm.providerType === PROVIDER_TYPES.ovirt
        ? getOvirtNetworkIds(vm, nicProfileToNetworkMap)
        : toNetworks(vm, nicProfiles);

    for (const id of networkIds) {
      acc.add(id);
    }
    return acc;
  }, new Set());

  return Array.from(networkIdSet);
};
