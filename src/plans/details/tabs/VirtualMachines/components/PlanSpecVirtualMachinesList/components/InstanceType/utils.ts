import { ADD, REMOVE, REPLACE } from '@components/ModalForm/utils/constants';
import { PlanModel, type V1beta1Plan } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';

export const onConfirmVmInstanceType =
  (vmIndex: number) =>
  async ({
    newValue,
    resource,
  }: {
    newValue: string | undefined;
    resource: V1beta1Plan;
  }): Promise<V1beta1Plan> => {
    const vm = getPlanVirtualMachines(resource)[vmIndex];
    const current = vm?.instanceType;

    if (newValue === current) {
      return resource;
    }

    if (!newValue && current) {
      return k8sPatch({
        data: [{ op: REMOVE, path: `/spec/vms/${vmIndex}/instanceType` }],
        model: PlanModel,
        resource,
      });
    }

    const op = current === undefined ? ADD : REPLACE;

    return k8sPatch({
      data: [{ op, path: `/spec/vms/${vmIndex}/instanceType`, value: newValue }],
      model: PlanModel,
      resource,
    });
  };
