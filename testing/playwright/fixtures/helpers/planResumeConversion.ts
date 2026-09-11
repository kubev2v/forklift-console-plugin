import type { V1beta1Plan } from '@forklift-ui/types';

import { RESOURCE_KINDS } from '../../utils/resource-manager/constants';
import type { ResourceManager } from '../../utils/resource-manager/ResourceManager';
import type { JsonPatchOperation } from '../../utils/resource-manager/ResourcePatcher';

const ADVISORY = 'Advisory';
const CANCELED = 'Canceled';
const CONDITION_TRUE = 'True';
const CONVERSION_RESUMABLE = 'ConversionResumable';

export type PlanCondition = {
  category?: string;
  lastTransitionTime?: string;
  message?: string;
  status?: string;
  type?: string;
};

const advisoryCondition = (type: string): PlanCondition => ({
  category: ADVISORY,
  lastTransitionTime: new Date().toISOString(),
  status: CONDITION_TRUE,
  type,
});

const getPlanConditions = (plan: V1beta1Plan | null): PlanCondition[] =>
  plan?.status?.conditions ?? [];

const hasTrueCondition = (conditions: PlanCondition[], type: string): boolean =>
  conditions.some((condition) => condition.type === type && condition.status === CONDITION_TRUE);

/**
 * ConversionResumable is a controller Advisory condition. Extra Advisory entries persist
 * on the status subresource (unlike Ready/Executing, which the controller recomputes).
 * HTTP GET mocks lose to the Plan watch, so E2E injects the condition via status PATCH.
 *
 * Canceled is added when missing so PlanStatus leaves the Ready "Start" branch and can
 * render the Resume link.
 */
export const injectConversionResumable = async (
  resourceManager: ResourceManager,
  planName: string,
  namespace: string,
): Promise<PlanCondition[]> => {
  const plan = await resourceManager.fetchPlan(planName, namespace);
  if (!plan) {
    throw new Error(`Plan ${planName} not found`);
  }

  const originalConditions = getPlanConditions(plan);
  const patches: JsonPatchOperation[] = [];

  if (!hasTrueCondition(originalConditions, CONVERSION_RESUMABLE)) {
    patches.push({
      op: 'add',
      path: '/status/conditions/-',
      value: advisoryCondition(CONVERSION_RESUMABLE),
    });
  }

  if (!hasTrueCondition(originalConditions, CANCELED)) {
    patches.push({
      op: 'add',
      path: '/status/conditions/-',
      value: advisoryCondition(CANCELED),
    });
  }

  const firstVm = plan.status?.migration?.vms?.[0] as { disksCopied?: boolean } | undefined;
  if (firstVm && firstVm.disksCopied !== true) {
    patches.push({
      op: firstVm.disksCopied === undefined ? 'add' : 'replace',
      path: '/status/migration/vms/0/disksCopied',
      value: true,
    });
  }

  if (patches.length === 0) {
    return originalConditions;
  }

  const patched = await resourceManager.patchResource({
    kind: RESOURCE_KINDS.PLAN,
    namespace,
    patch: patches,
    patchType: 'json',
    resourceName: planName,
    subresource: 'status',
  });
  if (!patched) {
    throw new Error(`Failed to patch ConversionResumable on ${planName}`);
  }

  return originalConditions;
};

export const restorePlanConditions = async (
  resourceManager: ResourceManager,
  planName: string,
  namespace: string,
  originalConditions: PlanCondition[],
): Promise<void> => {
  await resourceManager.patchResource({
    kind: RESOURCE_KINDS.PLAN,
    namespace,
    patch: [{ op: 'replace', path: '/status/conditions', value: originalConditions }],
    patchType: 'json',
    resourceName: planName,
    subresource: 'status',
  });
};
