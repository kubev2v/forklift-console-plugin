//import { k8sDelete } from '@openshift-console/dynamic-plugin-sdk';
import { HookModel, PlanModel, V1beta1Hook, V1beta1Plan, V1beta1PlanSpecVms } from '@kubev2v/types';
import { k8sDelete, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Updates the existing data of a Kubernetes V1beta1Hook resources.
 *
 * @param {plan} V1beta1NetworkMap - The planNetworkMaps original object.
 * @param {removedHooks} V1beta1StorageMap - The planStorageMaps original object.
 * @param {updatedPlanVms} V1beta1NetworkMapSpecMap[] - The V1beta1NetworkMapSpecMap array, containing the updated data.
 * @returns {Promise<void>} A promise that resolves when the patch operation is complete.
 */
export async function patchPlanHooksData(
  plan: V1beta1Plan,
  removedHooks: V1beta1Hook[],
  updatedPlanVms: V1beta1PlanSpecVms,
) {
  await k8sPatch({
    model: PlanModel,
    resource: plan,
    data: [
      {
        op: 'replace',
        path: '/spec/vms',
        value: updatedPlanVms,
      },
    ],
  });

  for (let i = 0; i < removedHooks.length; i++) {
    await k8sDelete({
      model: HookModel,
      resource: removedHooks[i],
    });
  }
}
