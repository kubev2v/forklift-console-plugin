import { HookModel, PlanModel, V1beta1Hook, V1beta1Plan } from '@kubev2v/types';
import { k8sDelete, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

export const deleteHook = async (
  plan: V1beta1Plan,
  hook: V1beta1Hook,
  step: 'PostHook' | 'PreHook',
) => {
  await k8sDelete({ model: HookModel, resource: hook });

  // update plan
  const vms = plan.spec.vms;
  const newVms = vms.map((vm) => {
    const newHooks = vm?.hooks?.filter((h) => h.step !== step) || [];

    return {
      ...vm,
      hooks: newHooks.length > 0 ? newHooks : undefined,
    };
  });

  return await k8sPatch({
    model: PlanModel,
    resource: plan,
    path: '',
    data: [{ op: 'replace', path: '/spec/vms', value: newVms }],
  });
};
