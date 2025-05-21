import { AlertMessageForModals } from 'src/modules/Providers/modals/components/AlertMessageForModals';
import { deepCopy } from 'src/utils/deepCopy';

import { HookModel, PlanModel, type V1beta1Hook, type V1beta1Plan } from '@kubev2v/types';
import { k8sCreate, k8sDelete, k8sPatch, k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { getName, getNamespace } from '@utils/crds/common/selectors';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';
import { t } from '@utils/i18n';

import { type FormAction, formActionKeys, type FormState } from '../state/types';

import { type HookType, hookType } from './constants';

const createHook = async (plan: V1beta1Plan, hook: V1beta1Hook, step: HookType) => {
  await k8sCreate({
    data: hook,
    model: HookModel,
  });

  const vms = getPlanVirtualMachines(plan);
  const newVms = vms.map((vm) => ({
    ...vm,
    hooks: [
      ...(vm?.hooks ?? []),
      {
        hook: {
          name: getName(hook),
          namespace: getNamespace(hook),
        },
        step,
      },
    ],
  }));

  return k8sPatch({
    data: [{ op: 'replace', path: '/spec/vms', value: newVms }],
    model: PlanModel,
    path: '',
    resource: plan,
  });
};

const deleteHook = async (plan: V1beta1Plan, hook: V1beta1Hook, step: HookType) => {
  await k8sDelete({ model: HookModel, resource: hook });

  const vms = getPlanVirtualMachines(plan);
  const newVms = vms.map((vm) => {
    const newHooks = vm?.hooks?.filter((vmHook) => vmHook.step !== (step as string)) ?? [];

    return {
      ...vm,
      hooks: newHooks.length > 0 ? newHooks : undefined,
    };
  });

  return k8sPatch({
    data: [{ op: 'replace', path: '/spec/vms', value: newVms }],
    model: PlanModel,
    path: '',
    resource: plan,
  });
};

const updateHook = async (hook: V1beta1Hook) => {
  await k8sUpdate({ data: hook, model: HookModel });
};

type onUpdatePlanHooksProps = {
  plan: V1beta1Plan;
  preHookResource: V1beta1Hook;
  postHookResource: V1beta1Hook;
  dispatch: (value: FormAction) => void;
  state: FormState;
};

export const onUpdatePlanHooks = async (props: onUpdatePlanHooksProps) => {
  const { dispatch, plan, postHookResource, preHookResource, state } = props;

  dispatch({ payload: true, type: formActionKeys.SET_LOADING });

  const newPlan = deepCopy(plan);

  try {
    if (state.preHookSet) {
      if (preHookResource) {
        await updateHook(state.preHook!);
      } else {
        await createHook(newPlan, state.preHook!, hookType.PreHook);
      }
    } else if (preHookResource) {
      await deleteHook(newPlan, preHookResource, hookType.PreHook);
    }

    if (state.postHookSet) {
      if (postHookResource) {
        await updateHook(state.postHook!);
      } else {
        await createHook(newPlan, state.postHook!, hookType.PostHook);
      }
    } else if (postHookResource) {
      await deleteHook(newPlan, postHookResource, hookType.PostHook);
    }

    dispatch({ payload: false, type: formActionKeys.SET_LOADING });
  } catch (err) {
    dispatch({
      payload: (
        <AlertMessageForModals
          title={t('Error')}
          message={err instanceof Error ? err.message : String(err)}
        />
      ),
      type: formActionKeys.SET_ALERT_MESSAGE,
    });

    dispatch({ payload: false, type: formActionKeys.SET_LOADING });
  }
};

/**
 * Validates that there is only one 'PostHook' and one 'PreHook' defined
 * and that the exact same hooks are defined on all VMs in the plan.
 *
 * @param {V1beta1Plan} plan - The plan object containing VM specifications.
 * @returns {string} - Returns a warning string.
 */
export const validateHooks = (plan: V1beta1Plan): string => {
  const vms = getPlanVirtualMachines(plan);
  if (isEmpty(vms)) {
    return '';
  }

  const hooksOnFirstVM = vms[0]?.hooks ?? [];

  const hasMultiplePostHook =
    hooksOnFirstVM.filter((hook) => hook.step === hookType.PostHook).length > 1;
  const hasMultiplePreHook =
    hooksOnFirstVM.filter((hook) => hook.step === hookType.PreHook).length > 1;

  if (hasMultiplePostHook || hasMultiplePreHook) {
    return t('the plan is configured with more then one hook per step');
  }

  const sortedFirstVMHooks = hooksOnFirstVM.sort((a, b) => a.step.localeCompare(b.step));

  const sameHooks = vms.every((vm) => {
    const sortedVMHooks = (vm.hooks ?? []).sort((a, b) => a.step.localeCompare(b.step));
    return JSON.stringify(sortedFirstVMHooks) === JSON.stringify(sortedVMHooks);
  });

  if (!sameHooks) {
    return t('the plan is configured with different hooks for different virtual machines');
  }

  return '';
};
