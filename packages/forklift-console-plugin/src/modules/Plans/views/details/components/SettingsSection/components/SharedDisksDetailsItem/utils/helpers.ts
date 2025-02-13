import { produce } from 'immer';
import { OnConfirmHookType } from 'src/modules/Providers/modals';

import { V1beta1Plan } from '@kubev2v/types';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';

interface EnhancedPlan extends V1beta1Plan {
  spec: {
    migrateSharedDisks?: boolean;
  } & V1beta1Plan['spec'];
}

export const safeBoolean = (value): boolean => {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
};

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

  const obj2 = await k8sUpdate({
    model: model,
    data: updatedPlanDraft,
  });

  return obj2;
};
