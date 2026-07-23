import type { OVirtNicProfile, ProviderVirtualMachine } from '@forklift-ui/types';
import { DefaultNetworkLabel } from '@utils/mappings/constants';
import { PROVIDER_TYPES } from '@utils/providers/constants';
import { getEc2SubnetIds, isEc2Vm } from '@utils/types/ec2Inventory';

const getNetworksForVM = (vm: ProviderVirtualMachine) => {
  if (isEc2Vm(vm)) return getEc2SubnetIds(vm);

  if (vm.providerType === (PROVIDER_TYPES.nutanix as string)) {
    return (
      (vm as ProviderVirtualMachine & { nics?: { subnetUuid?: string }[] })?.nics
        ?.map((nic) => nic?.subnetUuid)
        .filter((id): id is string => Boolean(id)) ?? []
    );
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
      // The OVA backend returns embedded network objects with PascalCase field names (ID),
      // while @forklift-ui/types defines them as camelCase (id). Access ID directly
      // and fall back to id so the code keeps working if the API is ever aligned.
      type RawOvaNet = { ID?: string };
      return (
        vm?.networks
          ?.map((network) => (network as unknown as RawOvaNet).ID ?? network?.id)
          .filter((id): id is string => Boolean(id)) ?? []
      );
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
