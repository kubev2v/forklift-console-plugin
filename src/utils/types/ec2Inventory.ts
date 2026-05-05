// EC2 inventory types — defined locally because @forklift-ui/types
// does not include EC2 inventory types yet.

import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type { ProviderVirtualMachine } from '@forklift-ui/types';
import { isEmpty } from '@utils/helpers';

// EC2 networks are AWS subnets, identified by SubnetId.
export type Ec2Network = {
  id: string;
  name: string;
  revision: number;
  selfLink: string;
  providerType: typeof PROVIDER_TYPES.ec2;
};

// EC2 storage items are static EBS volume types (gp2, gp3, io1, io2, st1, sc1, standard).
export type Ec2Storage = {
  id: string;
  name: string;
  revision: number;
  selfLink: string;
  providerType: typeof PROVIDER_TYPES.ec2;
};

// Shape of the EC2 VM `object` field relevant for network/storage extraction.
// Full type: Ec2InstanceDetails in src/providers/details/tabs/VirtualMachines/utils/types/Ec2VM.ts
export type Ec2VmObject = {
  SubnetId?: string;
  NetworkInterfaces?: { SubnetId?: string }[];
  BlockDeviceMappings?: { Ebs?: { VolumeType?: string } }[];
};

export type Ec2VmLike = ProviderVirtualMachine & { object?: Ec2VmObject };

// ProviderVirtualMachine from @forklift-ui/types does not include 'ec2' yet
export const isEc2Vm = (vm: ProviderVirtualMachine): vm is Ec2VmLike =>
  (vm.providerType as string) === PROVIDER_TYPES.ec2;

/**
 * Extracts subnet IDs from an EC2 VM.
 * Prefers NetworkInterfaces entries; falls back to top-level SubnetId
 * when interfaces are absent or contain no subnet IDs.
 */
export const getEc2SubnetIds = (vm: Ec2VmLike): string[] => {
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
