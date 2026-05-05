import { DefaultNetworkLabel } from 'src/plans/details/tabs/Mappings/utils/constants';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type { OVirtNicProfile, ProviderVirtualMachine } from '@forklift-ui/types';
import { isEmpty } from '@utils/helpers';
import type { Ec2VmObject } from '@utils/types/ec2Inventory';

type Ec2VmLike = ProviderVirtualMachine & { object?: Ec2VmObject };

// ProviderVirtualMachine from @forklift-ui/types does not include 'ec2' yet
const isEc2Vm = (vm: ProviderVirtualMachine): vm is Ec2VmLike =>
  (vm.providerType as string) === PROVIDER_TYPES.ec2;

const getEc2SubnetIds = (vm: Ec2VmLike): string[] => {
  const interfaces = vm.object?.NetworkInterfaces;

  if (interfaces?.length) {
    const subnetIds = interfaces.reduce<string[]>(
      (acc, nic) => (nic.SubnetId ? [...acc, nic.SubnetId] : acc),
      [],
    );
    if (!isEmpty(subnetIds)) return subnetIds;
  }

  return vm.object?.SubnetId ? [vm.object.SubnetId] : [];
};

const getNetworksForVM = (vm: ProviderVirtualMachine) => {
  if (isEc2Vm(vm)) return getEc2SubnetIds(vm);

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
