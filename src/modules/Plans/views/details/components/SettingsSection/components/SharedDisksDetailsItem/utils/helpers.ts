import { produce } from 'immer';
import { OnConfirmHookType } from 'src/modules/Providers/modals/EditModal/types';

import { V1beta1Plan } from '@kubev2v/types';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { safeBoolean } from '@utils/helpers';

import { EnhancedPlan } from '../../../utils/types';

export const getMigrateSharedDisks = (resource: V1beta1Plan): boolean => {
  return (resource as EnhancedPlan)?.spec?.migrateSharedDisks ?? true; // when missing, default behavior is true, follow BE description: https://github.com/kubev2v/forklift/pull/1318#issue-2812305530
};

export const onConfirmMigrateSharedDisks: OnConfirmHookType = async ({
  resource,
  model,
  newValue,
}) => {
  const plan = resource as EnhancedPlan;

  const updatedPlanDraft = produce(plan, (draft) => {
    draft.spec.migrateSharedDisks = safeBoolean(newValue);
  });

  const updatedPlan = await k8sUpdate({
    model: model,
    data: updatedPlanDraft,
  });

  return updatedPlan;
};
