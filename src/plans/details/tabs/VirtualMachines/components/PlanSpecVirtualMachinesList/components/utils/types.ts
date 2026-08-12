import type { V1beta1Plan } from '@forklift-ui/types';

export type SetVMTargetName = ({
  newValue,
  resource,
  vmIndex,
}: {
  newValue: string | undefined;
  resource: V1beta1Plan;
  vmIndex: number;
}) => Promise<V1beta1Plan>;
