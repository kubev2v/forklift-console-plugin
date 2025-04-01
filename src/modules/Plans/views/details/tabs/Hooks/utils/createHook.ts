import { HookModel, PlanModel, V1beta1Hook, V1beta1Plan } from '@kubev2v/types';
import { k8sCreate, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

export const createHook = async (
  plan: V1beta1Plan,
  hook: V1beta1Hook,
  step: 'PostHook' | 'PreHook',
) => {
  await k8sCreate({
    model: HookModel,
    data: hook,
  });

  // update plan
  const vms = plan.spec.vms;
  const newVms = vms.map((vm) => ({
    ...vm,
    hooks: [
      ...(vm?.hooks || []),
      {
        step: step,
        hook: {
          name: hook.metadata.name,
          namespace: hook.metadata.namespace,
        },
      },
    ],
  }));

  return await k8sPatch({
    model: PlanModel,
    resource: plan,
    path: '',
    data: [{ op: 'replace', path: '/spec/vms', value: newVms }],
  });
};
