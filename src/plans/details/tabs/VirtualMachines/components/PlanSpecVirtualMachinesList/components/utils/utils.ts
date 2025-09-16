import { validateK8sName } from 'src/modules/Providers/utils/validators/common';
import type { EnhancedPlanSpecVms } from 'src/plans/details/tabs/Details/components/SettingsSection/utils/types';

import { ADD, REMOVE, REPLACE } from '@components/ModalForm/utils/constants';
import { PlanModel, type V1beta1Plan, type V1beta1PlanSpecVms } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { t } from '@utils/i18n';

import type { SetVMTargetName } from './types';

export const onConfirmVirtualMachineNetworkNameTemplate =
  (vmIndex: number) =>
  async ({
    newValue,
    resource,
  }: {
    resource: V1beta1Plan;
    newValue: string | undefined;
  }): Promise<V1beta1Plan> => {
    const current = (resource?.spec?.vms as EnhancedPlanSpecVms[])?.[vmIndex]?.networkNameTemplate;
    const op = current === undefined ? ADD : REPLACE;

    const result = await k8sPatch({
      data: [
        {
          op,
          path: `/spec/vms/${vmIndex}/networkNameTemplate`,
          value: newValue ?? undefined,
        },
      ],
      model: PlanModel,
      resource,
    });

    return result;
  };

export const onConfirmVirtualMachineVolumeNameTemplate =
  (vmIndex: number) =>
  async ({
    newValue,
    resource,
  }: {
    resource: V1beta1Plan;
    newValue: string | undefined;
  }): Promise<V1beta1Plan> => {
    const current = (resource?.spec?.vms as EnhancedPlanSpecVms[])?.[vmIndex]?.volumeNameTemplate;
    const op = current === undefined ? ADD : REPLACE;

    const result = await k8sPatch({
      data: [
        {
          op,
          path: `/spec/vms/${vmIndex}/volumeNameTemplate`,
          value: newValue ?? undefined,
        },
      ],
      model: PlanModel,
      resource,
    });

    return result;
  };

export const onConfirmVirtualMachinePVCNameTemplate =
  (vmIndex: number) =>
  async ({
    newValue,
    resource,
  }: {
    resource: V1beta1Plan;
    newValue: string | undefined;
  }): Promise<V1beta1Plan> => {
    const current = (resource?.spec?.vms as EnhancedPlanSpecVms[])?.[vmIndex]?.pvcNameTemplate;
    const op = current === undefined ? ADD : REPLACE;

    const result = await k8sPatch({
      data: [
        {
          op,
          path: `/spec/vms/${vmIndex}/pvcNameTemplate`,
          value: newValue ?? undefined,
        },
      ],
      model: PlanModel,
      resource,
    });

    return result;
  };

export const patchVMTargetName: SetVMTargetName = async ({ newValue, resource, vmIndex }) => {
  const current = (resource?.spec?.vms as EnhancedPlanSpecVms[])?.[vmIndex]?.targetName;
  const op = current === undefined ? ADD : REPLACE;

  const result = await k8sPatch({
    data: [
      {
        op: newValue ? op : REMOVE,
        path: `/spec/vms/${vmIndex}/targetName`,
        value: newValue ?? undefined,
      },
    ],
    model: PlanModel,
    resource,
  });

  return result;
};

export const validateVMTargetName = (value: string, vms: V1beta1PlanSpecVms[]): string | null => {
  if (!value) {
    return null;
  }

  if (!validateK8sName(value)) {
    return t(
      "VM target name must contain only lowercase alphanumeric characters or '-', and must start or end with lowercase alphanumeric character.",
    );
  }

  if (vms.some((vm) => vm?.targetName === value)) {
    return t('VM target name must be unique within a plan.');
  }

  return null;
};
