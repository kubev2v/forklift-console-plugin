import type { V1beta1Plan } from '@kubev2v/types';

export type DeleteVirtualMachineProps = {
  plan: V1beta1Plan;
  selectedIds: string[];
};
