import { produce } from 'immer';
import {
  HOOK_SOURCE_AAP,
  HOOK_SOURCE_NONE,
  type HookSource,
} from 'src/plans/create/steps/migration-hooks/constants';
import { createAapTokenSecret } from 'src/plans/create/utils/createAapTokenSecret';

import { HookModel, PlanModel, type V1beta1Hook, type V1beta1Plan } from '@forklift-ui/types';
import { k8sCreate, k8sDelete, k8sPatch, k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { getName, getNamespace, getUID } from '@utils/crds/common/selectors';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';
import { t } from '@utils/i18n';
import type { AAPConfig } from '@utils/types/aap';

import { type HookType, HookTypeLabelLowercase, hookTypes } from './constants';

export const getAapConfig = (hook: V1beta1Hook | undefined): AAPConfig | undefined =>
  (hook?.spec as unknown as { aap?: AAPConfig })?.aap;

type HookTemplateParams = {
  image: string;
  plan: V1beta1Plan;
  playbook: string;
  serviceAccount: string;
  step: HookType;
};

type AapHookTemplateParams = {
  aapJobTemplateId: number;
  aapTimeout?: number;
  aapUrl: string;
  plan: V1beta1Plan;
  step: HookType;
  tokenSecretName: string;
};

const getLocalHookTemplate = ({
  image,
  plan,
  playbook,
  serviceAccount,
  step,
}: HookTemplateParams): V1beta1Hook => ({
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
  spec: { image, playbook, serviceAccount },
});

const getAapHookTemplate = ({
  aapJobTemplateId,
  aapTimeout,
  aapUrl,
  plan,
  step,
  tokenSecretName,
}: AapHookTemplateParams): V1beta1Hook =>
  ({
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
    spec: {
      aap: {
        jobTemplateId: aapJobTemplateId,
        timeout: aapTimeout ?? 0,
        tokenSecret: { name: tokenSecretName, namespace: getNamespace(plan) },
        url: aapUrl,
      },
    },
  }) as unknown as V1beta1Hook;

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

type CreateUpdateOrDeleteHookParams = {
  aapJobTemplateId?: number;
  aapTimeout?: number;
  aapToken?: string;
  aapUrl?: string;
  hook?: V1beta1Hook;
  hookImage?: string;
  hookPlaybook?: string;
  hookServiceAccount?: string;
  hookSet: boolean;
  hookSource?: HookSource;
  plan: V1beta1Plan;
  step: HookType;
};

const resolveAapTokenSecretName = async (
  aapToken: string | undefined,
  existingSecretName: string,
  plan: V1beta1Plan,
): Promise<string> => {
  if (aapToken?.trim()) {
    const newSecret = await createAapTokenSecret(
      aapToken,
      getName(plan) ?? '',
      getNamespace(plan) ?? '',
    );
    return newSecret.metadata?.name ?? existingSecretName;
  }
  return existingSecretName;
};

export const createUpdateOrDeleteHook = async ({
  aapJobTemplateId,
  aapTimeout,
  aapToken,
  aapUrl,
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

  if (hookSource === HOOK_SOURCE_AAP && aapUrl && aapJobTemplateId) {
    const existingAap = getAapConfig(hook);
    const existingSecretName = existingAap?.tokenSecret?.name ?? '';
    const tokenSecretName = await resolveAapTokenSecretName(aapToken, existingSecretName, plan);

    if (!hook) {
      const resourceHook = getAapHookTemplate({
        aapJobTemplateId,
        aapTimeout,
        aapUrl,
        plan,
        step,
        tokenSecretName,
      });
      return createHook(plan, resourceHook, step);
    }

    const updatedHook = {
      ...hook,
      spec: {
        aap: {
          jobTemplateId: aapJobTemplateId,
          timeout: aapTimeout ?? 0,
          tokenSecret: { name: tokenSecretName, namespace: getNamespace(plan) },
          url: aapUrl,
        },
      },
    } as unknown as V1beta1Hook;

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
    delete (draft.spec as unknown as Record<string, unknown>).aap;
  });

  await updateHook(updatedHook);
  return plan;
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

export const getServiceAccountHelperText = (isPreHook: boolean, plan?: V1beta1Plan): string => {
  const serviceAccountProject = isPreHook ? plan?.metadata?.namespace : plan?.spec?.targetNamespace;
  const serviceAccountProjectLabel = isPreHook ? "plan's project." : "plan's target project.";

  return t(
    `Red Hat OpenShift service account. The service account is needed for manipulating any resources of the cluster. Note that the provided service account should be in the ${serviceAccountProject ?? ''} ${serviceAccountProjectLabel}`,
  );
};
