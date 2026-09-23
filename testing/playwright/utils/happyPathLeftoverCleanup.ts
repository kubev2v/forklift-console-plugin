import { BaseResourceManager } from './resource-manager/BaseResourceManager';
import { API_PATHS, RESOURCE_TYPES } from './resource-manager/constants';
import { testError } from './testLog';
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

export const isProtectedNamespace = (namespace: string): boolean =>
  namespace.startsWith('kube-') || namespace.startsWith('openshift-');

export const isLeftoverHappyPathVmName = (name: string): boolean => {
  if (HAPPY_PATH_LEFTOVER_EXACT_VM_NAMES.includes(name)) {
    return true;
  }

  return HAPPY_PATH_LEFTOVER_VM_NAME_PREFIXES.some((prefix) => name.startsWith(prefix));
};

export const selectLeftoverHappyPathVms = (items: LeftoverVmListItem[]): LeftoverVmRef[] => {
  const leftovers: LeftoverVmRef[] = [];

  for (const item of items) {
    const name = item.metadata?.name;
    const namespace = item.metadata?.namespace;
    if (name && namespace && !isProtectedNamespace(namespace) && isLeftoverHappyPathVmName(name)) {
      leftovers.push({ name, namespace });
    }
  }

  return leftovers;
};

const shouldSkipLeftoverCleanup = (): boolean => {
  const skipValue = (process.env[SKIP_HAPPY_PATH_LEFTOVER_CLEANUP_ENV] ?? '').toLowerCase();
  return skipValue === '1' || skipValue === 'true';
};

/**
 * Deletes leftover happy-path target VMs that cause MacConflicts on the next run.
 * Best-effort: listing or delete failures are logged and do not fail globalSetup.
 */
export const cleanupLeftoverHappyPathVms = async (): Promise<void> => {
  if (shouldSkipLeftoverCleanup()) {
    testError(`Skipping happy-path leftover VM cleanup (${SKIP_HAPPY_PATH_LEFTOVER_CLEANUP_ENV})`);
    return;
  }

  const data = await BaseResourceManager.apiGet<{ items?: LeftoverVmListItem[] }>(
    `${API_PATHS.KUBEVIRT}/${RESOURCE_TYPES.VIRTUAL_MACHINES}`,
  );

  if (!data) {
    testError('Could not list VirtualMachines for happy-path leftover cleanup');
    return;
  }

  const leftovers = selectLeftoverHappyPathVms(data.items ?? []);
  if (isEmpty(leftovers)) {
    testError('No leftover happy-path target VMs found');
    return;
  }

  for (const vm of leftovers) {
    const apiPath = `${API_PATHS.KUBEVIRT}/namespaces/${vm.namespace}/${RESOURCE_TYPES.VIRTUAL_MACHINES}/${vm.name}`;
    await BaseResourceManager.apiDelete(apiPath);
    testError(`Requested delete of leftover VM ${vm.namespace}/${vm.name}`);
  }
};
