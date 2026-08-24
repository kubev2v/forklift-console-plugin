import { produce } from 'immer';
import {
  HOOK_SOURCE_AAP,
  HOOK_SOURCE_NONE,
  type HookSource,
} from 'src/plans/create/steps/migration-hooks/constants';

import type { V1beta1Hook, V1beta1Plan } from '@forklift-ui/types';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';
import { t } from '@utils/i18n';
import { ANNOTATION_AAP_JOB_TEMPLATE_NAME } from '@utils/types/aap';

import { type HookType, hookTypes } from './constants';
import {
  createHook,
  deleteHook,
  getAapHookTemplate,
  getLocalHookTemplate,
  updateHook,
} from './hookOperations';

export { getAapConfig } from './hookOperations';

type CreateUpdateOrDeleteHookParams = {
  aapJobTemplateId?: number;
  aapJobTemplateName?: string;
  hook?: V1beta1Hook;
  hookImage?: string;
  hookPlaybook?: string;
  hookServiceAccount?: string;
  hookSet: boolean;
  hookSource?: HookSource;
  plan: V1beta1Plan;
  step: HookType;
};

export const createUpdateOrDeleteHook = async ({
  aapJobTemplateId,
  aapJobTemplateName,
  hook,
  hookImage,
  hookPlaybook,
  hookServiceAccount,
  hookSet,
  hookSource = HOOK_SOURCE_NONE,
  plan,
  step,
}: CreateUpdateOrDeleteHookParams): Promise<V1beta1Plan> => {
  if (!hookSet && hook) {
    return deleteHook(plan, hook, step);
  }

  if (!hookSet) {
    return plan;
  }

  if (hookSource === HOOK_SOURCE_AAP && aapJobTemplateId !== undefined) {
    if (!hook) {
      const resourceHook = getAapHookTemplate({
        aapJobTemplateId,
        aapJobTemplateName,
        plan,
        step,
      });
      return createHook(plan, resourceHook, step);
    }

    const annotations: Record<string, string> = {
      ...(hook.metadata?.annotations ?? {}),
    };
    if (aapJobTemplateName) {
      annotations[ANNOTATION_AAP_JOB_TEMPLATE_NAME] = aapJobTemplateName;
    } else {
      delete annotations[ANNOTATION_AAP_JOB_TEMPLATE_NAME];
    }

    const updatedHook: V1beta1Hook = {
      ...hook,
      metadata: { ...hook.metadata, annotations },
      spec: {
        aap: { jobTemplateId: aapJobTemplateId },
      },
    };

    await updateHook(updatedHook);
    return plan;
  }

  const image = hookImage ?? '';
  const playbook = hookPlaybook ?? '';
  const serviceAccount = hookServiceAccount ?? '';

  if (!hook) {
    const resourceHook = getLocalHookTemplate({ image, plan, playbook, serviceAccount, step });
    return createHook(plan, resourceHook, step);
  }

  const updatedHook = produce(hook, (draft) => {
    draft.spec ??= { image: '', playbook: '', serviceAccount: '' };
    draft.spec.image = image;
    draft.spec.playbook = playbook;
    draft.spec.serviceAccount = serviceAccount;
    delete draft.spec.aap;
  });

  await updateHook(updatedHook);
  return plan;
};

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

  const sortedFirstVMHooks = [...hooksOnFirstVM].sort((a, b) => a.step.localeCompare(b.step));

  const sameHooks = vms.every((vm) => {
    const sortedVMHooks = [...(vm.hooks ?? [])].sort((a, b) => a.step.localeCompare(b.step));
    return JSON.stringify(sortedFirstVMHooks) === JSON.stringify(sortedVMHooks);
  });

  if (!sameHooks) {
    return t('the plan is configured with different hooks for different virtual machines');
  }

  return '';
};

export const getServiceAccountHelperText = (isPreHook: boolean, plan?: V1beta1Plan): string => {
  const serviceAccountProject = isPreHook ? plan?.metadata?.namespace : plan?.spec?.targetNamespace;
  const serviceAccountProjectLabel = isPreHook ? "plan's project." : "plan's target project.";

  return t(
    `Red Hat OpenShift service account. The service account is needed for manipulating any resources of the cluster. Note that the provided service account should be in the ${serviceAccountProject ?? ''} ${serviceAccountProjectLabel}`,
  );
};
