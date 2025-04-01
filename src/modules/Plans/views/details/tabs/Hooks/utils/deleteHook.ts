import { HookModel, PlanModel, type V1beta1Hook, type V1beta1Plan } from '@kubev2v/types';
import { k8sDelete, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

export const deleteHook = async (
  plan: V1beta1Plan,
  hook: V1beta1Hook,
  step: 'PostHook' | 'PreHook',
) => {
  await k8sDelete({ model: HookModel, resource: hook });

  // Update plan
  const { vms } = plan.spec;
  const newVms = vms.map((vm) => {
    const newHooks = vm?.hooks?.filter((h) => h.step !== step) || [];

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
