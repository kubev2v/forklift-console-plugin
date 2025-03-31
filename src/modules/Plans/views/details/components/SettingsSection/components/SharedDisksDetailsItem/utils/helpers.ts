import { produce } from 'immer';
import type { OnConfirmHookType } from 'src/modules/Providers/modals';

import type { V1beta1Plan } from '@kubev2v/types';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { safeBoolean } from '@utils/helpers';

import type { EnhancedPlan } from '../../../utils/types';

export const getMigrateSharedDisks = (resource: V1beta1Plan): boolean => {
  return (resource as EnhancedPlan)?.spec?.migrateSharedDisks ?? true; // when missing, default behavior is true, follow BE description: https://github.com/kubev2v/forklift/pull/1318#issue-2812305530
};

export const onConfirmMigrateSharedDisks: OnConfirmHookType = async ({
  model,
  newValue,
  resource,
}) => {
  const plan = resource as EnhancedPlan;

  const updatedPlanDraft = produce(plan, (draft) => {
    draft.spec.migrateSharedDisks = safeBoolean(newValue);
  });

  const updatedPlan = await k8sUpdate({
    data: updatedPlanDraft,
    model,
  });

  return updatedPlan;
};
