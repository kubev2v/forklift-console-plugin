import { AlertMessageForModals } from 'src/modules/Providers/modals/components/AlertMessageForModals';
import { deepCopy } from 'src/utils/deepCopy';

import type { V1beta1Hook, V1beta1Plan } from '@kubev2v/types';

import type { FormAction, FormState } from '../state/reducer';

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
export const onUpdatePlanHooks = async (props: onUpdatePlanHooksProps) => {
  const { dispatch, plan, postHookResource, preHookResource, state } = props;

  dispatch({ payload: true, type: 'SET_LOADING' });

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

    dispatch({ payload: false, type: 'SET_LOADING' });
  } catch (err) {
    dispatch({
      payload: <AlertMessageForModals title={'Error'} message={err.message || err.toString()} />,
      type: 'SET_ALERT_MESSAGE',
    });

    dispatch({ payload: false, type: 'SET_LOADING' });
  }
};
