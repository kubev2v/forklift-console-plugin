import { produce } from 'immer';
import { OnConfirmHookType } from 'src/modules/Providers';

import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { setObjectValueByPath, unsetObjectValueByPath } from '@utils/helpers';

import { EnhancedPlan } from '../../../utils/types';

import { NameTemplateRadioOptions } from './constants';

export const onConfirmNameTemplate: (selected: NameTemplateRadioOptions) => OnConfirmHookType =
  (selected) =>
  async ({ resource, model, newValue, jsonPath }) => {
    const plan = resource as EnhancedPlan;

    const updatedPlanDraft = produce(plan, (draft) => {
      if (selected === NameTemplateRadioOptions.customNameTemplate) {
        return setObjectValueByPath(draft, jsonPath, newValue);
      }

      unsetObjectValueByPath(draft, jsonPath);
    });

    const updatedPlan = await k8sUpdate({
      model: model,
      data: updatedPlanDraft,
    });

    return updatedPlan;
  };
