import type {
  IoK8sApiCoreV1PersistentVolumeClaim,
  V1VirtualMachineInstance,
} from '@forklift-ui/types';
import { expect } from '@playwright/test';

import type { PlanDetailsPage } from '../page-objects/PlanDetailsPage/PlanDetailsPage';

import { apiRequest } from './resource-manager/apiRequest';
import { API_PATHS, RESOURCE_TYPES } from './resource-manager/constants';
import type { ResourceManager } from './resource-manager/ResourceManager';

export const EXCLUDED_DISK_SOURCE_VM = 'mtv-rhel8-warm-2disks2nics';
export const EXCLUDED_DATA_DISK_BUS_ADDRESS = 'scsi0:1';
export const EXCLUDED_DISK_GUEST_BOOT_TIMEOUT_MS = 10 * 60_000;

const BOOT_DISK_BUS_ADDRESS = 'scsi0:0';
const PLAN_SPEC_TIMEOUT_MS = 60_000;

const getExcludedDisks = async (
  resourceManager: ResourceManager,
  planName: string,
): Promise<string[] | undefined> => {
  const plan = await resourceManager.fetchPlan(planName);
  expect(plan, 'Plan should exist while checking excluded disks').not.toBeNull();
  const planVm = plan?.spec?.vms?.find((vm) => vm.name?.includes(EXCLUDED_DISK_SOURCE_VM));
  expect(planVm?.name, 'Plan should contain the two-disk source').toContain(
    EXCLUDED_DISK_SOURCE_VM,
  );
  return planVm?.excludeDisks;
};

export const saveExcludedDataDisk = async (
  planPage: PlanDetailsPage,
  resourceManager: ResourceManager,
  planName: string,
): Promise<void> => {
  const modal = await planPage.virtualMachinesTab.openExcludeDisksDialog(EXCLUDED_DISK_SOURCE_VM);
  await modal.waitForDisks([BOOT_DISK_BUS_ADDRESS, EXCLUDED_DATA_DISK_BUS_ADDRESS]);
  await expect(modal.saveButton).toBeDisabled();

  await modal.diskCheckbox(BOOT_DISK_BUS_ADDRESS).check();
  await modal.diskCheckbox(EXCLUDED_DATA_DISK_BUS_ADDRESS).check();
  await expect(modal.allDisksWarning).toBeVisible();
  await expect(modal.saveButton).toBeDisabled();

  await modal.diskCheckbox(BOOT_DISK_BUS_ADDRESS).uncheck();
  await modal.saveButton.click();
  await expect(modal.root).not.toBeVisible();
  await expect
    .poll(() => getExcludedDisks(resourceManager, planName), { timeout: PLAN_SPEC_TIMEOUT_MS })
    .toEqual([EXCLUDED_DATA_DISK_BUS_ADDRESS]);
};

export const clearAndRestoreExcludedDataDisk = async (
  planPage: PlanDetailsPage,
  resourceManager: ResourceManager,
  planName: string,
): Promise<void> => {
  const modal = await planPage.virtualMachinesTab.openExcludeDisksDialog(EXCLUDED_DISK_SOURCE_VM);
  await modal.waitForDisks([BOOT_DISK_BUS_ADDRESS, EXCLUDED_DATA_DISK_BUS_ADDRESS]);
  await expect(modal.diskCheckbox(EXCLUDED_DATA_DISK_BUS_ADDRESS)).toBeChecked();
  await expect(modal.saveButton).toBeDisabled();
  await modal.diskCheckbox(EXCLUDED_DATA_DISK_BUS_ADDRESS).uncheck();
  await modal.saveButton.click();
  await expect(modal.root).not.toBeVisible();
  await expect
    .poll(() => getExcludedDisks(resourceManager, planName), { timeout: PLAN_SPEC_TIMEOUT_MS })
    .toBeUndefined();

  await planPage.virtualMachinesTab.openExcludeDisksDialog(EXCLUDED_DISK_SOURCE_VM);
  await modal.waitForDisks([BOOT_DISK_BUS_ADDRESS, EXCLUDED_DATA_DISK_BUS_ADDRESS]);
  await modal.diskCheckbox(EXCLUDED_DATA_DISK_BUS_ADDRESS).check();
  await modal.saveButton.click();
  await expect(modal.root).not.toBeVisible();
  await expect
    .poll(() => getExcludedDisks(resourceManager, planName), { timeout: PLAN_SPEC_TIMEOUT_MS })
    .toEqual([EXCLUDED_DATA_DISK_BUS_ADDRESS]);
};

export const verifyExcludedDiskTarget = async (
  resourceManager: ResourceManager,
  targetVmName: string,
  namespace: string,
): Promise<void> => {
  const targetVm = await resourceManager.fetchVirtualMachine(targetVmName, namespace);
  expect(targetVm, 'Migrated VM should exist').not.toBeNull();
  const disks = targetVm?.spec.template.spec?.domain?.devices?.disks ?? [];
  const volumes = targetVm?.spec.template.spec?.volumes ?? [];
  expect(disks).toHaveLength(1);
  expect(volumes).toHaveLength(1);
  expect(disks[0]?.name).toBe(volumes[0]?.name);

  const claimName = volumes[0]?.persistentVolumeClaim?.claimName;
  expect(claimName, 'Boot disk should use a PVC').toBeTruthy();
  await expect
    .poll(
      async () => {
        const response = await apiRequest<V1VirtualMachineInstance>(
          `${API_PATHS.KUBEVIRT}/namespaces/${namespace}/${RESOURCE_TYPES.VIRTUAL_MACHINE_INSTANCES}/${targetVmName}`,
          { method: 'GET' },
        );
        const status = response.success ? response.data.status : undefined;
        return {
          agentConnected: status?.conditions?.some(
            (condition) => condition.type === 'AgentConnected' && condition.status === 'True',
          ),
          phase: status?.phase,
          ready: status?.conditions?.some(
            (condition) => condition.type === 'Ready' && condition.status === 'True',
          ),
        };
      },
      { timeout: EXCLUDED_DISK_GUEST_BOOT_TIMEOUT_MS },
    )
    .toEqual({ agentConnected: true, phase: 'Running', ready: true });

  const claim = await apiRequest<IoK8sApiCoreV1PersistentVolumeClaim>(
    `${API_PATHS.KUBERNETES_CORE}/namespaces/${namespace}/persistentvolumeclaims/${claimName}`,
    { method: 'GET' },
  );
  expect(claim.success, 'Boot disk PVC should exist').toBe(true);
  if (claim.success) {
    expect(claim.data.status?.phase).toBe('Bound');
  }
};
