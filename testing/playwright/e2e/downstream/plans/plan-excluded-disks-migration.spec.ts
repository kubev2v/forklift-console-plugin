import type {
  IoK8sApiCoreV1PersistentVolumeClaim,
  V1VirtualMachineInstance,
} from '@forklift-ui/types';
import { expect } from '@playwright/test';

import { providerOnlyFixtures as test } from '../../../fixtures/resourceFixtures';
import { CreatePlanWizardPage } from '../../../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { PlanDetailsPage } from '../../../page-objects/PlanDetailsPage/PlanDetailsPage';
import {
  createPlanTestData,
  NetworkTargets,
  SourceNetworks,
  SourceStorages,
  StorageClasses,
} from '../../../types/test-data';
import { requireVddk } from '../../../utils/requireVddk';
import { apiRequest } from '../../../utils/resource-manager/apiRequest';
import {
  API_PATHS,
  HAPPY_PATH_MIGRATION_TIMEOUT_MS,
  HAPPY_PATH_TEST_OVERHEAD_MS,
  PLAN_READY_TIMEOUT,
  RESOURCE_TYPES,
} from '../../../utils/resource-manager/constants';
import { CNV_4_21_0, V5_0_0 } from '../../../utils/version/constants';
import { requireCNVVersion, requireVersion } from '../../../utils/version/version';

const SOURCE_VM = 'mtv-rhel8-warm-2disks2nics';
const BOOT_DISK = 'scsi0:0';
const DATA_DISK = 'scsi0:1';
const GUEST_BOOT_TIMEOUT_MS = 10 * 60_000;
const PLAN_SPEC_TIMEOUT_MS = 60_000;

test.describe('vSphere excluded disk cold migration', { tag: ['@downstream', '@slow'] }, () => {
  requireVersion(test, V5_0_0);
  requireCNVVersion(test, CNV_4_21_0);
  requireVddk(test);
  test.describe.configure({
    timeout: HAPPY_PATH_MIGRATION_TIMEOUT_MS + HAPPY_PATH_TEST_OVERHEAD_MS + PLAN_READY_TIMEOUT,
  });

  test('excludes the data disk and boots the migrated VM', async ({
    page,
    resourceManager,
    testProvider,
  }) => {
    const planData = createPlanTestData({
      additionalPlanSettings: { preserveStaticIPs: false, targetPowerState: 'on' },
      networkMap: {
        mappings: [
          { source: SourceNetworks.VM_NETWORK, target: NetworkTargets.DEFAULT },
          { source: SourceNetworks.MGMT_NETWORK, target: NetworkTargets.IGNORE },
        ],
      },
      sourceProvider: testProvider?.metadata?.name ?? '',
      storageMap: {
        isPreexisting: false,
        mappings: [
          {
            source: SourceStorages.MTV_TLV2_RELEASE_V8,
            target: StorageClasses.OCS_RBD_VIRTUALIZATION,
          },
        ],
        name: `excluded-disks-storage-map-${Date.now()}`,
      },
      virtualMachines: [{ folder: 'vm', sourceName: SOURCE_VM }],
    });
    const planPage = new PlanDetailsPage(page);
    const getExcludedDisks = async (): Promise<string[] | undefined> => {
      const plan = await resourceManager.fetchPlan(planData.planName);
      expect(plan, 'Plan should exist while checking excluded disks').not.toBeNull();
      return (plan?.spec?.vms?.[0] as { excludeDisks?: string[] } | undefined)?.excludeDisks;
    };

    await test.step('Create a cold Plan for the two-disk source VM', async () => {
      const wizard = new CreatePlanWizardPage(page, resourceManager);
      await wizard.navigate();
      await wizard.waitForWizardLoad();
      await wizard.fillAndSubmit(planData);
      await planPage.waitForPlanEditable();
      await planPage.virtualMachinesTab.navigateToVirtualMachinesTab();
    });

    await test.step('Save only the secondary disk as excluded', async () => {
      const modal = await planPage.virtualMachinesTab.openExcludeDisksDialog(SOURCE_VM);
      await modal.waitForDisks([BOOT_DISK, DATA_DISK]);
      await expect(modal.saveButton).toBeDisabled();

      await modal.diskCheckbox(BOOT_DISK).check();
      await modal.diskCheckbox(DATA_DISK).check();
      await expect(modal.allDisksWarning).toBeVisible();
      await expect(modal.saveButton).toBeDisabled();

      await modal.diskCheckbox(BOOT_DISK).uncheck();
      await expect(modal.saveButton).toBeEnabled();
      await modal.saveButton.click();
      await expect(modal.root).not.toBeVisible();
      await expect.poll(getExcludedDisks, { timeout: PLAN_SPEC_TIMEOUT_MS }).toEqual([DATA_DISK]);
    });

    await test.step('Reopen, clear, and restore the persisted exclusion', async () => {
      const modal = await planPage.virtualMachinesTab.openExcludeDisksDialog(SOURCE_VM);
      await modal.waitForDisks([BOOT_DISK, DATA_DISK]);
      await expect(modal.diskCheckbox(DATA_DISK)).toBeChecked();
      await expect(modal.saveButton).toBeDisabled();
      await modal.diskCheckbox(DATA_DISK).uncheck();
      await modal.saveButton.click();
      await expect.poll(getExcludedDisks, { timeout: PLAN_SPEC_TIMEOUT_MS }).toBeUndefined();

      await planPage.virtualMachinesTab.openExcludeDisksDialog(SOURCE_VM);
      await modal.waitForDisks([BOOT_DISK, DATA_DISK]);
      await modal.diskCheckbox(DATA_DISK).check();
      await modal.saveButton.click();
      await expect.poll(getExcludedDisks, { timeout: PLAN_SPEC_TIMEOUT_MS }).toEqual([DATA_DISK]);
    });

    await test.step('Complete the migration with the exclusion in the Plan', async () => {
      await planPage.waitForPlanReady();
      resourceManager.addVm(SOURCE_VM, planData.targetProject.name);
      await planPage.clickActionsMenuAndStart();
      await expect
        .poll(async () => (await planPage.getMigrationStatus()).status, { timeout: 30_000 })
        .toBe('Migration running');
      await planPage.waitForMigrationCompletion(HAPPY_PATH_MIGRATION_TIMEOUT_MS, true);
    });

    await test.step('Verify one target disk and a healthy guest boot', async () => {
      const namespace = planData.targetProject.name;
      const targetVm = await resourceManager.fetchVirtualMachine(SOURCE_VM, namespace);
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
              `${API_PATHS.KUBEVIRT}/namespaces/${namespace}/${RESOURCE_TYPES.VIRTUAL_MACHINE_INSTANCES}/${SOURCE_VM}`,
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
          { timeout: GUEST_BOOT_TIMEOUT_MS },
        )
        .toEqual({ agentConnected: true, phase: 'Running', ready: true });
    });
  });
});
