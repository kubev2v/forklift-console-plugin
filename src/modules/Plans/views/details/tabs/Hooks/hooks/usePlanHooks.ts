import {
  HookModelGroupVersionKind,
  PlanModelGroupVersionKind,
  type V1beta1Hook,
  type V1beta1Plan,
  type V1beta1PlanSpecVmsHooks,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

export const usePlanHooks = (name: string, namespace: string) => {
  const [plan, loaded, loadError] = useK8sWatchResource<V1beta1Plan>({
    groupVersionKind: PlanModelGroupVersionKind,
    name,
    namespace,
    namespaced: true,
  });
  const hooks: V1beta1PlanSpecVmsHooks[] = plan?.spec?.vms?.[0]?.hooks || [];
  const postHook = hooks.find((h) => h.step === 'PostHook');
  const preHook = hooks.find((h) => h.step === 'PreHook');

  const [hookRecourses] = useK8sWatchResource<V1beta1Hook[]>({
    groupVersionKind: HookModelGroupVersionKind,
    isList: true,
    namespace: plan?.metadata?.namespace,
    namespaced: true,
  });

  const postHookResource = hookRecourses.find((h) => h.metadata.name === postHook?.hook?.name);
  const preHookResource = hookRecourses.find((h) => h.metadata.name === preHook?.hook?.name);

  // Check for unsupported hooks
  const warning = validateHooks(plan);

  return [plan, preHookResource, postHookResource, loaded, loadError, warning];
};

/**
 * Validates that there is only one 'PostHook' and one 'PreHook' defined
 * and that the exact same hooks are defined on all VMs in the plan.
 *
 * @param {V1beta1Plan} plan - The plan object containing VM specifications.
 * @returns {string} - Returns a warning string.
 */
function validateHooks(plan: V1beta1Plan): string {
  if (!plan?.spec?.vms) {
    return;
  }

  const hooksOnFirstVM = plan.spec.vms[0]?.hooks || [];

  const hasMultiplePostHook = hooksOnFirstVM.filter((h) => h.step === 'PostHook').length > 1;
  const hasMultiplePreHook = hooksOnFirstVM.filter((h) => h.step === 'PreHook').length > 1;

  if (hasMultiplePostHook || hasMultiplePreHook) {
    return 'the plan is configured with more then one hook per step';
  }

  const sortedFirstVMHooks = hooksOnFirstVM.sort((a, b) => a.step.localeCompare(b.step));

  const sameHooks = plan.spec.vms.every((vm) => {
    const sortedVMHooks = (vm.hooks || []).sort((a, b) => a.step.localeCompare(b.step));
    return JSON.stringify(sortedFirstVMHooks) === JSON.stringify(sortedVMHooks);
  });

  if (!sameHooks) {
    return 'the plan is configured with different hooks for different virtual machines';
  }
}
