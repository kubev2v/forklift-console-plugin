import React from 'react';
import { AlertMessageForModals } from 'src/modules/Providers/modals';
import { deepCopy } from 'src/utils';

import { V1beta1Hook, V1beta1Plan } from '@kubev2v/types';

import { FormAction, FormState } from '../state';
import { createHook } from './createHook';
import { deleteHook } from './deleteHook';
import { updateHook } from './updateHook';

type onUpdatePlanHooksProps = {
  plan: V1beta1Plan;
  preHookResource: V1beta1Hook;
  postHookResource: V1beta1Hook;
  dispatch: (value: FormAction) => void;
  state: FormState;
};

// Handle user clicking "save"
export async function onUpdatePlanHooks(props: onUpdatePlanHooksProps) {
  const { plan, preHookResource, postHookResource, dispatch, state } = props;

  dispatch({ type: 'SET_LOADING', payload: true });

  let newPlan = deepCopy(plan);

  try {
    if (state.preHookSet) {
      if (preHookResource) {
        // Patch new hook
        await updateHook(state.preHook);
      } else {
        // Create hook
        newPlan = await createHook(newPlan, state.preHook, 'PreHook');
      }
    } else if (preHookResource) {
      // Delete hook
      newPlan = await deleteHook(newPlan, preHookResource, 'PreHook');
    }

    if (state.postHookSet) {
      if (postHookResource) {
        // Patch new hook
        await updateHook(state.postHook);
      } else {
        // Create hook
        await createHook(newPlan, state.postHook, 'PostHook');
      }
    } else if (postHookResource) {
      // Delete hook
      await deleteHook(newPlan, postHookResource, 'PostHook');
    }

    dispatch({ type: 'SET_LOADING', payload: false });
  } catch (err) {
    dispatch({
      type: 'SET_ALERT_MESSAGE',
      payload: <AlertMessageForModals title={'Error'} message={err.message || err.toString()} />,
    });

    dispatch({ type: 'SET_LOADING', payload: false });
  }
}
