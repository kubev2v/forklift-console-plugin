// EC2 instance details returned inside the `object` field of the VM API response.
// Fields use PascalCase JSON tags from the AWS SDK (ec2types.Instance).
// https://github.com/kubev2v/forklift/blob/main/pkg/provider/ec2/inventory/model/model.go
export type Ec2InstanceDetails = {
  InstanceType?: string;
  State?: { Name?: string };
  Placement?: { AvailabilityZone?: string };
  PublicIpAddress?: string;
  PrivateIpAddress?: string;
  VpcId?: string;
  SubnetId?: string;
};

// EC2 VM as returned by the inventory API (/providers/ec2/{uid}/vms).
// Base fields (id, name, revision, selfLink) come from the Resource struct,
// while AWS instance data is nested under `object`.
// https://github.com/kubev2v/forklift/blob/main/pkg/provider/ec2/inventory/web/resource.go
export type Ec2VM = {
  id: string;
  name: string;
  revision: number;
  selfLink: string;
  providerType: 'ec2';
  concerns: { category: string; label: string; assessment: string }[];
  object?: Ec2InstanceDetails;
};

export const getEc2VM = (data: unknown): Ec2VM | undefined =>
  (data as { vm?: unknown })?.vm as Ec2VM | undefined;
