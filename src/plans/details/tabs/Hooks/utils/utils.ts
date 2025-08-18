import { produce } from 'immer';
import { deepCopy } from 'src/utils/deepCopy';

import { HookModel, PlanModel, type V1beta1Hook, type V1beta1Plan } from '@kubev2v/types';
import { k8sCreate, k8sDelete, k8sPatch, k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { getName, getNamespace, getUID } from '@utils/crds/common/selectors';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';
import { t } from '@utils/i18n';

import type { HookFormValues } from '../state/types';

import { type HookType, HookTypeLabelLowercase, hookTypes } from './constants';

type HookTemplateParams = {
  image: string;
  playbook: string;
  plan: V1beta1Plan;
  step: HookType;
};

const getHookTemplate = ({ image, plan, playbook, step }: HookTemplateParams): V1beta1Hook => ({
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Hook',
  metadata: {
    name: `${getName(plan)}-${HookTypeLabelLowercase[step]}-hook`,
    namespace: getNamespace(plan),
    ownerReferences: [
      {
        apiVersion: plan?.apiVersion,
        kind: plan?.kind,
        name: getName(plan)!,
        uid: getUID(plan)!,
      },
    ],
  },
  spec: { image, playbook },
});

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

  const newPlan = await k8sPatch({
    data: [{ op: 'replace', path: '/spec/vms', value: newVms }],
    model: PlanModel,
    resource: plan,
  });

  return newPlan;
};

const deleteHook = async (plan: V1beta1Plan, hook: V1beta1Hook, step: HookType) => {
  await k8sDelete({ model: HookModel, resource: hook });

  const vms = getPlanVirtualMachines(plan);
  const newVms = vms.map((vm) => {
    const newHooks = vm?.hooks?.filter((vmHook) => vmHook.step !== (step as string)) ?? [];

    return {
      ...vm,
      hooks: isEmpty(newHooks) ? undefined : newHooks,
    };
  });

  return k8sPatch({
    data: [{ op: 'replace', path: '/spec/vms', value: newVms }],
    model: PlanModel,
    resource: plan,
  });
};

const updateHook = async (hook: V1beta1Hook) => {
  await k8sUpdate({ data: hook, model: HookModel });
};

type createUpdateOrDeleteHookParams = {
  hook?: V1beta1Hook;
  hookImage?: string;
  hookPlaybook?: string;
  hookSet: boolean;
  plan: V1beta1Plan;
  step: HookType;
};

const createUpdateOrDeleteHook = async ({
  hook,
  hookImage,
  hookPlaybook,
  hookSet,
  plan,
  step,
}: createUpdateOrDeleteHookParams): Promise<V1beta1Plan> => {
  const image = hookImage ?? '';
  const playbook = hookPlaybook ?? '';

  if (hookSet && !hook) {
    const resourceHook = getHookTemplate({ image, plan, playbook, step });
    const newPlan = await createHook(plan, resourceHook, step);
    return newPlan;
  }

  if (!hookSet && hook) {
    const newPlan = await deleteHook(plan, hook, step);
    return newPlan;
  }

  if (hookSet && hook) {
    const updatedHook = produce(hook, (draft) => {
      draft.spec ??= { image: '', playbook: '' };
      draft.spec.image = image;
      draft.spec.playbook = playbook;
    });

    await updateHook(updatedHook);
  }

  return plan;
};

type onUpdatePlanHooksProps = {
  plan: V1beta1Plan;
  preHookResource: V1beta1Hook;
  postHookResource: V1beta1Hook;
  formData: HookFormValues;
};

export const onUpdatePlanHooks = async (props: onUpdatePlanHooksProps) => {
  const { formData, plan, postHookResource, preHookResource } = props;
  const {
    postHookImage,
    postHookPlaybook,
    postHookSet,
    preHookImage,
    preHookPlaybook,
    preHookSet,
  } = formData;

  const newPlan = await createUpdateOrDeleteHook({
    hook: preHookResource,
    hookImage: preHookImage,
    hookPlaybook: preHookPlaybook,
    hookSet: preHookSet,
    plan: deepCopy(plan),
    step: hookTypes.PreHook,
  });

  await createUpdateOrDeleteHook({
    hook: postHookResource,
    hookImage: postHookImage,
    hookPlaybook: postHookPlaybook,
    hookSet: postHookSet,
    plan: newPlan,
    step: hookTypes.PostHook,
  });
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
    hooksOnFirstVM.filter((hook) => hook.step === hookTypes.PostHook).length > 1;
  const hasMultiplePreHook =
    hooksOnFirstVM.filter((hook) => hook.step === hookTypes.PreHook).length > 1;

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
