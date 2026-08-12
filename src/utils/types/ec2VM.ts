// EC2 instance details returned inside the `object` field of the VM API response.
// Fields use PascalCase JSON tags from the AWS SDK (ec2types.Instance).
// https://github.com/kubev2v/forklift/blob/main/pkg/provider/ec2/inventory/model/model.go
export type Ec2InstanceDetails = {
  BlockDeviceMappings?: { Ebs?: { VolumeType?: string } }[];
  InstanceType?: string;
  NetworkInterfaces?: { SubnetId?: string }[];
  Placement?: { AvailabilityZone?: string };
  PrivateIpAddress?: string;
  PublicIpAddress?: string;
  State?: { Name?: string };
  SubnetId?: string;
  VpcId?: string;
};

// EC2 VM as returned by the inventory API (/providers/ec2/{uid}/vms).
// Base fields (id, name, revision, selfLink) come from the Resource struct,
// while AWS instance data is nested under `object`.
// https://github.com/kubev2v/forklift/blob/main/pkg/provider/ec2/inventory/web/resource.go
export type Ec2VM = {
  concerns: { assessment: string; category: string; label: string }[];
  id: string;
  name: string;
  object?: Ec2InstanceDetails;
  providerType: 'ec2';
  revision: number;
  selfLink: string;
};

export const getEc2VM = (data: unknown): Ec2VM | undefined =>
  (data as { vm?: unknown })?.vm as Ec2VM | undefined;
