import type { V1beta1Plan } from '@forklift-ui/types';

import { apiRequest } from './resource-manager/apiRequest';
import { BaseResourceManager } from './resource-manager/BaseResourceManager';
import {
  API_PATHS,
  HAPPY_PATH_TARGET_NAMESPACE_PREFIX,
  RESOURCE_TYPES,
} from './resource-manager/constants';
import { testLog } from './testLog';
import { isEmpty } from './utils';

export const SKIP_HAPPY_PATH_LEFTOVER_CLEANUP_ENV = 'SKIP_HAPPY_PATH_LEFTOVER_CLEANUP';

/** Source VM names used as target names when a previous run skipped rename. */
export const HAPPY_PATH_LEFTOVER_EXACT_VM_NAMES: readonly string[] = [
  'mtv-rhel8-warm-sanity',
  'mtv-win2019-79',
];

/** Happy-path rename pattern: `${sourceName}-renamed-${Date.now()}`. */
export const HAPPY_PATH_LEFTOVER_VM_NAME_PREFIXES = [
  'mtv-rhel8-warm-sanity-renamed-',
  'mtv-win2019-79-renamed-',
] as const;

const CONDITION_TRUE = 'True';
const HTTP_NOT_FOUND = 404;
const PLAN_CONDITION_EXECUTING = 'Executing';
const VM_DELETE_POLL_MS = 2_000;
const VM_DELETE_TIMEOUT_MS = 5 * 60_000;

type LeftoverVmRef = {
  name: string;
  namespace: string;
};

type LeftoverVmListItem = {
  metadata?: {
    name?: string;
    namespace?: string;
  };
};

type PlanList = {
  items?: V1beta1Plan[];
};

const delay = async (ms: number): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const isHappyPathLeftoverNamespace = (namespace: string): boolean =>
  namespace.startsWith(HAPPY_PATH_TARGET_NAMESPACE_PREFIX);

export const isLeftoverHappyPathVmName = (name: string): boolean => {
  if (HAPPY_PATH_LEFTOVER_EXACT_VM_NAMES.includes(name)) {
    return true;
  }

  return HAPPY_PATH_LEFTOVER_VM_NAME_PREFIXES.some((prefix) => name.startsWith(prefix));
};

const isExecutingPlan = (plan: V1beta1Plan): boolean =>
  (plan.status?.conditions ?? []).some(
    (condition) =>
      condition.type === PLAN_CONDITION_EXECUTING && condition.status === CONDITION_TRUE,
  );

export const selectLeftoverHappyPathVms = (
  items: LeftoverVmListItem[],
  executingTargetNamespaces: ReadonlySet<string> = new Set(),
): LeftoverVmRef[] => {
  const leftovers: LeftoverVmRef[] = [];

  for (const item of items) {
    const name = item.metadata?.name;
    const namespace = item.metadata?.namespace;
    if (
      name &&
      namespace &&
      isHappyPathLeftoverNamespace(namespace) &&
      isLeftoverHappyPathVmName(name) &&
      !executingTargetNamespaces.has(namespace)
    ) {
      leftovers.push({ name, namespace });
    }
  }

  return leftovers;
};

const shouldSkipLeftoverCleanup = (): boolean => {
  const skipValue = (process.env[SKIP_HAPPY_PATH_LEFTOVER_CLEANUP_ENV] ?? '').toLowerCase();
  return skipValue === '1' || skipValue === 'true';
};

const waitForVmNotFound = async (apiPath: string, vm: LeftoverVmRef): Promise<void> => {
  const deadline = Date.now() + VM_DELETE_TIMEOUT_MS;

  while (Date.now() < deadline) {
    const result = await apiRequest(apiPath, { method: 'GET' });
    if (result.status === HTTP_NOT_FOUND) {
      return;
    }
    await delay(VM_DELETE_POLL_MS);
  }

  throw new Error(`Leftover VM still present after delete timeout: ${vm.namespace}/${vm.name}`);
};

const listExecutingTargetNamespaces = async (): Promise<ReadonlySet<string>> => {
  const data = await BaseResourceManager.apiGet<PlanList>(
    `${API_PATHS.FORKLIFT}/${RESOURCE_TYPES.PLANS}`,
  );
  if (!data) {
    throw new Error('Could not list Plans for happy-path leftover cleanup');
  }

  const namespaces = new Set<string>();
  for (const plan of data.items ?? []) {
    const targetNamespace = plan.spec?.targetNamespace;
    if (targetNamespace && isExecutingPlan(plan)) {
      namespaces.add(targetNamespace);
    }
  }

  return namespaces;
};

/**
 * Deletes leftover happy-path target VMs that cause MacConflicts on the next run.
 * Skips namespaces that still have an Executing Plan targeting them.
 */
export const cleanupLeftoverHappyPathVms = async (): Promise<void> => {
  if (shouldSkipLeftoverCleanup()) {
    testLog(`Skipping happy-path leftover VM cleanup (${SKIP_HAPPY_PATH_LEFTOVER_CLEANUP_ENV})`);
    return;
  }

  const data = await BaseResourceManager.apiGet<{ items?: LeftoverVmListItem[] }>(
    `${API_PATHS.KUBEVIRT}/${RESOURCE_TYPES.VIRTUAL_MACHINES}`,
  );
  if (!data) {
    throw new Error('Could not list VirtualMachines for happy-path leftover cleanup');
  }

  const leftovers = selectLeftoverHappyPathVms(
    data.items ?? [],
    await listExecutingTargetNamespaces(),
  );
  if (isEmpty(leftovers)) {
    testLog('No leftover happy-path target VMs found');
    return;
  }

  for (const vm of leftovers) {
    const apiPath = `${API_PATHS.KUBEVIRT}/namespaces/${vm.namespace}/${RESOURCE_TYPES.VIRTUAL_MACHINES}/${vm.name}`;
    await BaseResourceManager.apiDelete(apiPath);
    await waitForVmNotFound(apiPath, vm);
    testLog(`Deleted leftover VM ${vm.namespace}/${vm.name}`);
  }
};
