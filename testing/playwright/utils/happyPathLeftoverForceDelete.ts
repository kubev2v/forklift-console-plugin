import { apiRequest } from './resource-manager/apiRequest';
import { BaseResourceManager } from './resource-manager/BaseResourceManager';
import { API_PATHS, RESOURCE_TYPES } from './resource-manager/constants';
import { testWarn } from './testLog';

const HTTP_NOT_FOUND = 404;
const VM_DELETE_POLL_MS = 2_000;

type LeftoverVmRef = {
  name: string;
  namespace: string;
};

type VmMetadata = {
  deletionTimestamp?: string;
  finalizers?: string[];
};

type VmResource = {
  metadata?: VmMetadata;
};

const delay = async (ms: number): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const vmApiPath = (vm: LeftoverVmRef): string =>
  `${API_PATHS.KUBEVIRT}/namespaces/${vm.namespace}/${RESOURCE_TYPES.VIRTUAL_MACHINES}/${vm.name}`;

const vmiApiPath = (vm: LeftoverVmRef): string =>
  `${API_PATHS.KUBEVIRT}/namespaces/${vm.namespace}/${RESOURCE_TYPES.VIRTUAL_MACHINE_INSTANCES}/${vm.name}`;

export const waitForVmNotFound = async (apiPath: string, timeoutMs: number): Promise<boolean> => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const result = await apiRequest(apiPath, { method: 'GET' });
    if (result.status === HTTP_NOT_FOUND) {
      return true;
    }
    if (!result.success) {
      throw new Error(`Could not poll leftover VM at ${apiPath}: ${result.error}`);
    }
    await delay(VM_DELETE_POLL_MS);
  }

  return false;
};

/** Clears KubeVirt finalizers only when the VM is already Terminating. */
export const forceRemoveStuckVm = async (vm: LeftoverVmRef): Promise<void> => {
  const vmPath = vmApiPath(vm);
  const getResult = await apiRequest<VmResource>(vmPath, { method: 'GET' });
  if (getResult.status === HTTP_NOT_FOUND) {
    return;
  }
  if (!getResult.success) {
    throw new Error(`Could not GET leftover VM ${vm.namespace}/${vm.name}: ${getResult.error}`);
  }
  if (!getResult.data.metadata?.deletionTimestamp) {
    throw new Error(
      `Leftover VM ${vm.namespace}/${vm.name} is still present but not Terminating; refusing to clear finalizers`,
    );
  }

  testWarn(`Leftover VM stuck Terminating; forcing removal of ${vm.namespace}/${vm.name}`);

  await apiRequest(vmiApiPath(vm), { method: 'DELETE' });
  await BaseResourceManager.apiPatch(vmPath, { metadata: { finalizers: null } });
  await BaseResourceManager.apiDelete(vmPath);
};
