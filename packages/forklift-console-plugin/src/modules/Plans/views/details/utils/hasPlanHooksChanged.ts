import { PlanHook } from '../tabs';

/**
 * Compares the plan's hooks between two versions.
 *
 * @param {V1beta1NetworkMapSpecMap[]} currPlanHooks - The first version of the plan hooks.
 * @param {V1beta1StorageMapSpecMap[]} nextPlanHooks - The second version of the the plan hooks.
 *
 * @returns {boolean} Returns true if any of the hooks data have changed, otherwise returns false.
 */
export function hasPlanHooksChanged(currPlanHooks: PlanHook[], nextPlanHooks: PlanHook[]): boolean {
  // Both hooks don't include entities
  if (!currPlanHooks && !nextPlanHooks) {
    return false;
  }

  // One of the hooks doesn't have data
  if (!currPlanHooks || !nextPlanHooks) {
    return true;
  }

  // Both hooks have data, but the number of hooks entries is different
  if (currPlanHooks.length !== nextPlanHooks.length) {
    return true;
  }

  // Compare each hook entry
  for (const index in currPlanHooks) {
    if (
      currPlanHooks[index].step !== nextPlanHooks[index].step ||
      currPlanHooks[index].hook?.metadata?.name !== nextPlanHooks[index].hook?.metadata?.name ||
      currPlanHooks[index].hook?.metadata?.namespace !==
        nextPlanHooks[index].hook?.metadata?.namespace ||
      currPlanHooks[index].hook.spec?.playbook !== nextPlanHooks[index].hook.spec?.playbook ||
      currPlanHooks[index].hook.spec?.image !== nextPlanHooks[index].hook.spec?.image
    ) {
      return true;
    }
  }

  // No differences found
  return false;
}
