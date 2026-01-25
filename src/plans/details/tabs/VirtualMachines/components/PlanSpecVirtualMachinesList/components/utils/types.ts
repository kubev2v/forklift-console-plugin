import type { V1beta1Plan } from '@forklift-ui/types';

export type SetVMTargetName = ({
  newValue,
  resource,
  vmIndex,
}: {
  resource: V1beta1Plan;
  newValue: string | undefined;
  vmIndex: number;
}) => Promise<V1beta1Plan>;
