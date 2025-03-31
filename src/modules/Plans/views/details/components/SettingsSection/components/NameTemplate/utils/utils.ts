import { produce } from 'immer';
import type { OnConfirmHookType } from 'src/modules/Providers';

import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { setObjectValueByPath, unsetObjectValueByPath } from '@utils/helpers';

import type { EnhancedPlan } from '../../../utils/types';

import { NameTemplateRadioOptions } from './constants';

export const onConfirmNameTemplate: (selected: NameTemplateRadioOptions) => OnConfirmHookType =
  (selected) =>
  async ({ jsonPath, model, newValue, resource }) => {
    const plan = resource as EnhancedPlan;

    const updatedPlanDraft = produce(plan, (draft) => {
      if (selected === NameTemplateRadioOptions.customNameTemplate) {
        setObjectValueByPath(draft, jsonPath, newValue);
        return;
      }

      unsetObjectValueByPath(draft, jsonPath);
    });

    const updatedPlan = await k8sUpdate({
      data: updatedPlanDraft,
      model,
    });

    return updatedPlan;
  };
