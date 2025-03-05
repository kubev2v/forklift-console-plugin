import { produce } from 'immer';
import { OnConfirmHookType } from 'src/modules/Providers/modals';

import { V1beta1Plan } from '@kubev2v/types';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';

import { DiskBusType, EnhancedPlan } from '../../../utils/types';

export const getDiskBus = (resource: V1beta1Plan): DiskBusType =>
  (resource as EnhancedPlan)?.spec?.diskBus;

export const onConfirmDiskBus: OnConfirmHookType = async ({ resource, model, newValue }) => {
  const plan = resource as EnhancedPlan;

  const updatedPlanDraft = produce(plan, (draft) => {
    draft.spec.diskBus = newValue as DiskBusType;
  });

  const updatedPlan = await k8sUpdate({
    model: model,
    data: updatedPlanDraft,
  });

  return updatedPlan;
};
