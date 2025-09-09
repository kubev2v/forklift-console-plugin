import type { TargetPowerStateValue } from 'src/plans/constants';

import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { PlanModel, type V1beta1Plan } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { getPlanTargetPowerState, getPlanVirtualMachines } from '@utils/crds/plans/selectors';

export const onConfirmTargetPowerState = async ({
  newValue,
  resource,
}: {
  newValue: TargetPowerStateValue;
  resource: V1beta1Plan;
}): Promise<V1beta1Plan> => {
  const op = getPlanTargetPowerState(resource) ? REPLACE : ADD;

  const result = await k8sPatch({
    data: [
      {
        op,
        path: '/spec/targetPowerState',
        value: newValue,
      },
    ],
    model: PlanModel,
    resource,
  });

  return result;
};

export const onConfirmVmTargetPowerState =
  (vmIndex: number) =>
  async ({
    newValue,
    resource,
  }: {
    newValue: TargetPowerStateValue;
    resource: V1beta1Plan;
  }): Promise<V1beta1Plan> => {
    const vm = getPlanVirtualMachines(resource)[vmIndex];
    const current = vm?.targetPowerState;
    const op = current === undefined ? ADD : REPLACE;

    const result = await k8sPatch({
      data: [
        {
          op,
          path: `/spec/vms/${vmIndex}/targetPowerState`,
          value: newValue,
        },
      ],
      model: PlanModel,
      resource,
    });

    return result;
  };
