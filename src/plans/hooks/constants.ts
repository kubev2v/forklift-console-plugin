import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export const DISPLAY_NAME_ANNOTATION = 'instancetype.kubevirt.io/displayName';

export const INSTANCE_TYPE_GVK = {
  group: 'instancetype.kubevirt.io',
  kind: 'VirtualMachineClusterInstancetype',
  version: 'v1beta1',
};

export type ClusterInstanceType = K8sResourceCommon & {
  spec?: {
    cpu?: { guest?: number };
    memory?: { guest?: string };
  };
};

export type InstanceTypeOption = {
  description: string;
  name: string;
};
