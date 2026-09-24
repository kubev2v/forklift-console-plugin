import { apiRequest } from './resource-manager/apiRequest';
import { BaseResourceManager } from './resource-manager/BaseResourceManager';
import {
  API_PATHS,
  HAPPY_PATH_TARGET_NAMESPACE_PREFIX,
  RESOURCE_TYPES,
} from './resource-manager/constants';
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

const HTTP_NOT_FOUND = 404;
const VM_DELETE_POLL_MS = 2_000;
const VM_DELETE_TIMEOUT_MS = 60_000;

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

const delay = async (ms: number): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const isProtectedNamespace = (namespace: string): boolean =>
  namespace.startsWith('kube-') || namespace.startsWith('openshift-');

/** Prior-run happy-path / default plan fixture namespaces. Current-run NS does not exist at globalSetup. */
export const isHappyPathLeftoverNamespace = (namespace: string): boolean =>
  namespace.startsWith(HAPPY_PATH_TARGET_NAMESPACE_PREFIX);

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
    if (
      name &&
      namespace &&
      isHappyPathLeftoverNamespace(namespace) &&
      !isProtectedNamespace(namespace) &&
      isLeftoverHappyPathVmName(name)
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

const waitForVmNotFound = async (apiPath: string, vm: LeftoverVmRef): Promise<boolean> => {
  const deadline = Date.now() + VM_DELETE_TIMEOUT_MS;

  while (Date.now() < deadline) {
    const result = await apiRequest(apiPath, { method: 'GET' });
    if (result.status === HTTP_NOT_FOUND) {
      return true;
    }
    await delay(VM_DELETE_POLL_MS);
  }

  testError(`Leftover VM still present after delete timeout: ${vm.namespace}/${vm.name}`);
  return false;
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
    const gone = await waitForVmNotFound(apiPath, vm);
    if (gone) {
      testError(`Deleted leftover VM ${vm.namespace}/${vm.name}`);
    }
  }
};
