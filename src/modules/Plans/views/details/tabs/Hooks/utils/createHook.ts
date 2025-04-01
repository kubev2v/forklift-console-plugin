import { HookModel, PlanModel, type V1beta1Hook, type V1beta1Plan } from '@kubev2v/types';
import { k8sCreate, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

export const createHook = async (
  plan: V1beta1Plan,
  hook: V1beta1Hook,
  step: 'PostHook' | 'PreHook',
) => {
  await k8sCreate({
    data: hook,
    model: HookModel,
  });

  // Update plan
  const { vms } = plan.spec;
  const newVms = vms.map((vm) => ({
    ...vm,
    hooks: [
      ...(vm?.hooks || []),
      {
        hook: {
          name: hook.metadata.name,
          namespace: hook.metadata.namespace,
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
