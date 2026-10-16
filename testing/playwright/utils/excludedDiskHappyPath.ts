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
export const EXCLUDED_DISK_GUEST_BOOT_TIMEOUT_MS = 10 * 60_000;

const BOOT_DISK = 'scsi0:0';
const DATA_DISK = 'scsi0:1';
const PLAN_SPEC_TIMEOUT_MS = 60_000;

const getExcludedDisks = async (
  resourceManager: ResourceManager,
  planName: string,
): Promise<unknown> => {
  const plan = await resourceManager.fetchPlan(planName);
  expect(plan, 'Plan should exist while checking excluded disks').not.toBeNull();
  const planVm = plan?.spec?.vms?.[0];
  expect(planVm?.name, 'First Plan VM should be the two-disk source').toContain(
    EXCLUDED_DISK_SOURCE_VM,
  );
  return planVm && 'excludeDisks' in planVm ? planVm.excludeDisks : undefined;
};

export const saveExcludedDataDisk = async (
  planPage: PlanDetailsPage,
  resourceManager: ResourceManager,
  planName: string,
): Promise<void> => {
  const modal = await planPage.virtualMachinesTab.openExcludeDisksDialog(EXCLUDED_DISK_SOURCE_VM);
  await modal.waitForDisks([BOOT_DISK, DATA_DISK]);
  await expect(modal.saveButton).toBeDisabled();

  await modal.diskCheckbox(BOOT_DISK).check();
  await modal.diskCheckbox(DATA_DISK).check();
  await expect(modal.allDisksWarning).toBeVisible();
  await expect(modal.saveButton).toBeDisabled();

  await modal.diskCheckbox(BOOT_DISK).uncheck();
  await modal.saveButton.click();
  await expect(modal.root).not.toBeVisible();
  await expect
    .poll(() => getExcludedDisks(resourceManager, planName), { timeout: PLAN_SPEC_TIMEOUT_MS })
    .toEqual([DATA_DISK]);
};

export const clearAndRestoreExcludedDataDisk = async (
  planPage: PlanDetailsPage,
  resourceManager: ResourceManager,
  planName: string,
): Promise<void> => {
  const modal = await planPage.virtualMachinesTab.openExcludeDisksDialog(EXCLUDED_DISK_SOURCE_VM);
  await modal.waitForDisks([BOOT_DISK, DATA_DISK]);
  await expect(modal.diskCheckbox(DATA_DISK)).toBeChecked();
  await expect(modal.saveButton).toBeDisabled();
  await modal.diskCheckbox(DATA_DISK).uncheck();
  await modal.saveButton.click();
  await expect
    .poll(() => getExcludedDisks(resourceManager, planName), { timeout: PLAN_SPEC_TIMEOUT_MS })
    .toBeUndefined();

  await planPage.virtualMachinesTab.openExcludeDisksDialog(EXCLUDED_DISK_SOURCE_VM);
  await modal.waitForDisks([BOOT_DISK, DATA_DISK]);
  await modal.diskCheckbox(DATA_DISK).check();
  await modal.saveButton.click();
  await expect
    .poll(() => getExcludedDisks(resourceManager, planName), { timeout: PLAN_SPEC_TIMEOUT_MS })
    .toEqual([DATA_DISK]);
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
  const claim = await apiRequest<IoK8sApiCoreV1PersistentVolumeClaim>(
    `${API_PATHS.KUBERNETES_CORE}/namespaces/${namespace}/persistentvolumeclaims/${claimName}`,
    { method: 'GET' },
  );
  expect(claim.success, 'Boot disk PVC should exist').toBe(true);
  if (claim.success) {
    expect(claim.data.status?.phase).toBe('Bound');
  }

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
};
