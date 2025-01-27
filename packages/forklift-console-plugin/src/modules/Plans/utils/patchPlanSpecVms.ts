import { PlanModel, V1beta1Plan } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Patch the plan VMs
 *
 * @param plan The V1beta1Plan object which will have its VMs patched
 */
export const patchPlanSpecVms = async (plan: V1beta1Plan) => {
  await k8sPatch({
    model: PlanModel,
    resource: plan,
    data: [
      {
        op: 'replace',
        path: '/spec/vms',
        value: plan.spec.vms,
      },
    ],
  });
};
