import type { EnhancedPlanSpecVms } from 'src/plans/details/tabs/Details/components/SettingsSection/utils/types';

import { ADD, REMOVE, REPLACE } from '@components/ModalForm/utils/constants';
import { PlanModel, type V1beta1Plan } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';

const getMigrateSharedDisks = (resource: V1beta1Plan): boolean | undefined =>
  resource?.spec?.migrateSharedDisks;

export const getMigrateSharedDisksValue = (resource: V1beta1Plan): boolean => {
  const migrateSharedDisks = getMigrateSharedDisks(resource);
  return migrateSharedDisks ?? true;
};

export const getVmMigrateSharedDisks = (vm?: EnhancedPlanSpecVms): boolean | undefined =>
  vm?.migrateSharedDisks;

export const onConfirmMigrateSharedDisks = async ({
  newValue,
  resource,
}: {
  resource: V1beta1Plan;
  newValue: boolean;
}): Promise<V1beta1Plan> => {
  const current = getMigrateSharedDisks(resource);
  const op = current === undefined ? ADD : REPLACE;

  const updated = await k8sPatch({
    data: [
      {
        op,
        path: '/spec/migrateSharedDisks',
        value: newValue ?? undefined,
      },
    ],
    model: PlanModel,
    resource,
  });

  return updated;
};

export const onConfirmVmMigrateSharedDisks =
  (vmIndex: number) =>
  async ({
    newValue,
    resource,
  }: {
    newValue: boolean | undefined;
    resource: V1beta1Plan;
  }): Promise<V1beta1Plan> => {
    const vm = getPlanVirtualMachines(resource)[vmIndex] as EnhancedPlanSpecVms | undefined;
    const current = vm?.migrateSharedDisks;
    const path = `/spec/vms/${vmIndex}/migrateSharedDisks`;

    if (newValue === undefined) {
      if (current === undefined) return resource;

      return k8sPatch({
        data: [{ op: REMOVE, path }],
        model: PlanModel,
        resource,
      });
    }

    const op = current === undefined ? ADD : REPLACE;

    return k8sPatch({
      data: [{ op, path, value: newValue }],
      model: PlanModel,
      resource,
    });
  };
