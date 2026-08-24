import {
  HookModel,
  PlanModel,
  type V1beta1Hook,
  type V1beta1HookSpecAap,
  type V1beta1Plan,
} from '@forklift-ui/types';
import { k8sCreate, k8sDelete, k8sPatch, k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { getName, getNamespace, getUID } from '@utils/crds/common/selectors';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';
import { ANNOTATION_AAP_JOB_TEMPLATE_NAME } from '@utils/types/aap';

import { type HookType, HookTypeLabelLowercase } from './constants';

export const getAapConfig = (hook: V1beta1Hook | undefined): V1beta1HookSpecAap | undefined =>
  hook?.spec?.aap;

type HookTemplateParams = {
  image: string;
  plan: V1beta1Plan;
  playbook: string;
  serviceAccount: string;
  step: HookType;
};

type AapHookTemplateParams = {
  aapJobTemplateId: number;
  aapJobTemplateName?: string;
  plan: V1beta1Plan;
  step: HookType;
};

export const getLocalHookTemplate = ({
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
        name: getName(plan) ?? '',
        uid: getUID(plan) ?? '',
      },
    ],
  },
  spec: { image, playbook, serviceAccount },
});

export const getAapHookTemplate = ({
  aapJobTemplateId,
  aapJobTemplateName,
  plan,
  step,
}: AapHookTemplateParams): V1beta1Hook => {
  const annotations: Record<string, string> = {};
  if (aapJobTemplateName) {
    annotations[ANNOTATION_AAP_JOB_TEMPLATE_NAME] = aapJobTemplateName;
  }

  return {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'Hook',
    metadata: {
      ...(!isEmpty(annotations) && { annotations }),
      name: `${getName(plan)}-${HookTypeLabelLowercase[step]}-hook`,
      namespace: getNamespace(plan),
      ownerReferences: [
        {
          apiVersion: plan?.apiVersion,
          kind: plan?.kind,
          name: getName(plan) ?? '',
          uid: getUID(plan) ?? '',
        },
      ],
    },
    spec: {
      aap: { jobTemplateId: aapJobTemplateId },
    },
  };
};

export const createHook = async (
  plan: V1beta1Plan,
  hook: V1beta1Hook,
  step: HookType,
): Promise<V1beta1Plan> => {
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

export const deleteHook = async (
  plan: V1beta1Plan,
  hook: V1beta1Hook,
  step: HookType,
): Promise<V1beta1Plan> => {
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

export const updateHook = async (hook: V1beta1Hook): Promise<void> => {
  await k8sUpdate({ data: hook, model: HookModel });
};
