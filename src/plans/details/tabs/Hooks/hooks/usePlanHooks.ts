import {
  HookModelGroupVersionKind,
  type V1beta1Hook,
  type V1beta1Plan,
  type V1beta1PlanSpecVmsHooks,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { getName, getNamespace } from '@utils/crds/common/selectors';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';

import { hookType } from '../utils/constants';
import { validateHooks } from '../utils/utils';

type UsePlanHooks = (plan: V1beta1Plan) => {
  preHookResource: V1beta1Hook | undefined;
  postHookResource: V1beta1Hook | undefined;
  warning: string;
};

export const usePlanHooks: UsePlanHooks = (plan) => {
  const hooks: V1beta1PlanSpecVmsHooks[] = getPlanVirtualMachines(plan)?.[0]?.hooks ?? [];
  const postHook = hooks.find((hook) => hook.step === (hookType.PostHook as string));
  const preHook = hooks.find((hook) => hook.step === (hookType.PreHook as string));

  const [hookRecourses] = useK8sWatchResource<V1beta1Hook[]>({
    groupVersionKind: HookModelGroupVersionKind,
    isList: true,
    namespace: getNamespace(plan),
    namespaced: true,
  });

  const postHookResource = hookRecourses.find((hook) => getName(hook) === postHook?.hook?.name);
  const preHookResource = hookRecourses.find((hook) => getName(hook) === preHook?.hook?.name);

  // Check for unsupported hooks
  const warning = validateHooks(plan);

  return { postHookResource, preHookResource, warning };
};
