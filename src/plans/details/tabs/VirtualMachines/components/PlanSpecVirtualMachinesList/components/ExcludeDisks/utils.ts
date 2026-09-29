import { areExcludeDiskSelectionsEqual } from 'src/plans/utils/excludeDisks/excludeDiskSelection';

import { ADD, REMOVE, REPLACE } from '@components/ModalForm/utils/constants';
import { PlanModel, type V1beta1Plan } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { getPlanVirtualMachines, getVmExcludeDisks } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';
import type { EnhancedPlanSpecVms } from '@utils/plans/types';

export const onConfirmVmExcludeDisks =
  (vmIndex: number) =>
  async ({
    newValue,
    resource,
  }: {
    newValue: string[];
    resource: V1beta1Plan;
  }): Promise<V1beta1Plan> => {
    const vm = getPlanVirtualMachines(resource)[vmIndex] as EnhancedPlanSpecVms | undefined;
    const current = getVmExcludeDisks(vm) ?? [];

    if (areExcludeDiskSelectionsEqual(newValue, current)) {
      return resource;
    }

    const path = `/spec/vms/${vmIndex}/excludeDisks`;

    if (isEmpty(newValue)) {
      if (isEmpty(current)) {
        return resource;
      }

      return k8sPatch({
        data: [{ op: REMOVE, path }],
        model: PlanModel,
        resource,
      });
    }

    const op = isEmpty(current) ? ADD : REPLACE;

    return k8sPatch({
      data: [{ op, path, value: newValue }],
      model: PlanModel,
      resource,
    });
  };
