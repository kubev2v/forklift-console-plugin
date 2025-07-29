import type { V1beta1Plan } from '@kubev2v/types';

export type SetVMTargetName = ({
  newValue,
  resource,
  vmIndex,
}: {
  resource: V1beta1Plan;
  newValue: string | undefined;
  vmIndex: number;
}) => Promise<V1beta1Plan>;
