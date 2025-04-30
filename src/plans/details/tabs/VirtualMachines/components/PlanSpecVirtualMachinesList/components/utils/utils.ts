import type { EnhancedPlan } from 'src/plans/details/tabs/Details/components/SettingsSection/utils/types';

import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { PlanModel, type V1beta1Plan } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

export const onConfirmVirtualMachineNetworkNameTemplate =
  (vmIndex: number) =>
  async ({
    newValue,
    resource,
  }: {
    resource: V1beta1Plan;
    newValue: string | undefined;
  }): Promise<V1beta1Plan> => {
    const current = (resource as EnhancedPlan)?.spec?.networkNameTemplate;
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
    const current = (resource as EnhancedPlan)?.spec?.volumeNameTemplate;
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
    const current = (resource as EnhancedPlan)?.spec?.pvcNameTemplate;
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
