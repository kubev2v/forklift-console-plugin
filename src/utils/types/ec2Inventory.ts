// EC2 inventory types — defined locally because @forklift-ui/types
// does not include EC2 inventory types yet.

import type { PROVIDER_TYPES } from 'src/providers/utils/constants';

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
