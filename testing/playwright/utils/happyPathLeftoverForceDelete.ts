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
    await delay(VM_DELETE_POLL_MS);
  }

  return false;
};

/** Clears KubeVirt finalizers when a VM is stuck Terminating (Failed VMI / Error launcher). */
export const forceRemoveStuckVm = async (vm: LeftoverVmRef): Promise<void> => {
  const vmPath = vmApiPath(vm);
  testWarn(`Leftover VM stuck after delete; forcing removal of ${vm.namespace}/${vm.name}`);

  await apiRequest(vmiApiPath(vm), { method: 'DELETE' });
  await BaseResourceManager.apiPatch(vmPath, { metadata: { finalizers: null } });
  await BaseResourceManager.apiDelete(vmPath);
};
