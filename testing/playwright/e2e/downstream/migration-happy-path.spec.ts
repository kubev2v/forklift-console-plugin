import { existsSync } from 'fs';
import { join } from 'path';

import type { V1beta1Plan } from '@forklift-ui/types';
import { expect, test } from '@playwright/test';

import { EndpointType, MigrationType, ProviderType } from '../../types/enums';

const providersPath = join(__dirname, '../../../.providers.json');
if (!existsSync(providersPath)) {
  throw new Error(`.providers.json file not found at: ${providersPath}`);
}

import * as providers from '../../../.providers.json';
import { VirtualMachineDetailsPage } from '../../page-objects/CNV/VirtualMachineDetailsPage';
import { CreatePlanWizardPage } from '../../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { CreateProviderPage } from '../../page-objects/CreateProviderPage';
import { OverviewPage } from '../../page-objects/OverviewPage/OverviewPage';
import { PlanDetailsPage } from '../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { PlansListPage } from '../../page-objects/PlansListPage';
import { ProviderDetailsPage } from '../../page-objects/ProviderDetailsPage/ProviderDetailsPage';
import {
  createPlanTestData,
  NetworkTargets,
  type PlanTestData,
  type ProviderConfig,
  type ProviderData,
  SourceNetworks,
  SourceStorages,
  StorageClasses,
} from '../../types/test-data';
import {
  clearAndRestoreExcludedDataDisk,
  EXCLUDED_DISK_GUEST_BOOT_TIMEOUT_MS,
  EXCLUDED_DISK_SOURCE_VM,
  saveExcludedDataDisk,
  verifyExcludedDiskTarget,
} from '../../utils/excludedDisks';
import {
  formatMigrationTimeoutDetail,
  getMigrationTimeoutUiStatus,
  isMigrationTimeoutError,
} from '../../utils/formatMigrationTimeoutDetail';
import { requireVddk } from '../../utils/requireVddk';
import {
  ELEMENT_TIMEOUT,
  HAPPY_PATH_MIGRATION_TIMEOUT_MS,
  HAPPY_PATH_TARGET_NAMESPACE_PREFIX,
  HAPPY_PATH_TEST_OVERHEAD_MS,
  MTV_NAMESPACE,
  PLAN_READY_TIMEOUT,
} from '../../utils/resource-manager/constants';
import { ResourceManager } from '../../utils/resource-manager/ResourceManager';
import { testLog } from '../../utils/testLog';
import { CNV_4_21_0, V2_10_5, V2_12_0, V5_0_0 } from '../../utils/version/constants';
import {
  isCNVVersionAtLeast,
  isVersionAtLeast,
  isVersionInStreams,
  requireCNVVersion,
  requireVersion,
} from '../../utils/version/version';

const targetProjectName = `${HAPPY_PATH_TARGET_NAMESPACE_PREFIX}${Date.now()}`;
const WINDOWS_SOURCE_VM = 'mtv-win2019-79';

test.describe.serial('Plans - VSphere to Host Happy Path Cold Migration', () => {
  requireVersion(test, V2_10_5);
  requireVddk(test);

  const resourceManager = new ResourceManager();

  let testProviderData: ProviderData = {
    endpointType: EndpointType.VCENTER,
    hostname: '',
    name: '',
    password: '',
    projectName: MTV_NAMESPACE,
    type: ProviderType.VSPHERE,
    username: '',
    useVddkAioOptimization: false,
    vddkInitImage: '',
  };

  const providerName = `test-vsphere-provider-${Date.now()}`;
  const planName = `${providerName}-plan`;
  let testPlanData: PlanTestData;

  test(
    'should create a new vsphere provider',
    {
      tag: ['@downstream'],
    },
    async ({ page }) => {
      const createProvider = new CreateProviderPage(page, resourceManager);

      const providerKey = process.env.VSPHERE_PROVIDER ?? 'vsphere-8.0.1';
      const providerConfig = (providers as Record<string, ProviderConfig>)[providerKey];

      testProviderData = {
        endpointType: providerConfig.endpoint_type ?? EndpointType.VCENTER,
        hostname: providerConfig.api_url,
        name: providerName,
        password: providerConfig.password,
        projectName: MTV_NAMESPACE,
        type: providerConfig.type,
        username: providerConfig.username,
        useVddkAioOptimization: false,
        vddkInitImage: providerConfig.vddk_init_image,
      };

      await createProvider.navigate();
      await createProvider.create(testProviderData);
    },
  );

  test(
    'should create a new cold migration plan',
    {
      tag: ['@downstream'],
    },
    async ({ page }) => {
      // waitForPlanEditable uses PLAN_READY_TIMEOUT for Validating/VDDK.
      const CREATE_PLAN_OVERHEAD_MS = 5 * 60_000; // navigate + wizard + rename
      test.setTimeout(PLAN_READY_TIMEOUT + CREATE_PLAN_OVERHEAD_MS);
      const providerDetailsPage = new ProviderDetailsPage(page);
      const createWizard = new CreatePlanWizardPage(page, resourceManager);
      const planDetailsPage = new PlanDetailsPage(page);

      const excludedDiskSupported = isVersionAtLeast(V5_0_0) && isCNVVersionAtLeast(CNV_4_21_0);
      const rhelSourceName = excludedDiskSupported
        ? EXCLUDED_DISK_SOURCE_VM
        : 'mtv-rhel8-warm-sanity';
      testPlanData = createPlanTestData({
        additionalPlanSettings: { preserveStaticIPs: false },
        migrationType: MigrationType.COLD,
        networkMap: {
          mappings: [
            { source: SourceNetworks.VM_NETWORK, target: NetworkTargets.DEFAULT },
            ...(excludedDiskSupported
              ? [{ source: SourceNetworks.MGMT_NETWORK, target: NetworkTargets.IGNORE }]
              : []),
          ],
        },
        planName,
        sourceProvider: providerName,
        targetProject: {
          isPreexisting: false,
          name: targetProjectName,
        },
        virtualMachines: [
          {
            folder: 'vm',
            sourceName: rhelSourceName,
            targetName: `${rhelSourceName}-renamed-${Date.now()}`,
          },
          {
            folder: 'vm',
            sourceName: WINDOWS_SOURCE_VM,
            targetName: `${WINDOWS_SOURCE_VM}-renamed-${Date.now()}`,
          },
        ],
      });
      if (excludedDiskSupported) {
        testPlanData.storageMap.mappings?.push({
          source: SourceStorages.MTV_TLV2_RELEASE_V8,
          target: StorageClasses.OCS_RBD_VIRTUALIZATION,
        });
      }

      await providerDetailsPage.navigate(providerName, MTV_NAMESPACE);
      await providerDetailsPage.waitForInventoryReady();
      await providerDetailsPage.clickCreatePlanButton();
      await createWizard.waitForWizardLoad();

      if (isVersionInStreams([V2_10_5, V2_12_0])) {
        await createWizard.generalInformation.verifySourceProviderPrePopulated(providerName);
      }

      await createWizard.fillAndSubmit(testPlanData);

      await planDetailsPage.verifyBasicPlanDetailsPage(testPlanData);
      await planDetailsPage.renameVMs(testPlanData);
    },
  );

  test(
    'should save, clear, and restore the RHEL data-disk exclusion',
    { tag: ['@downstream'] },
    async ({ page }) => {
      requireVersion(test, V5_0_0);
      requireCNVVersion(test, CNV_4_21_0);
      test.setTimeout(PLAN_READY_TIMEOUT + 5 * 60_000);
      const plansPage = new PlansListPage(page);
      const planDetailsPage = new PlanDetailsPage(page);

      await plansPage.navigateDirectly();
      await plansPage.navigateToPlan(planName);
      await planDetailsPage.virtualMachinesTab.navigateToVirtualMachinesTab();

      await test.step('Set RHEL target on and Windows target off', async () => {
        const vmTab = planDetailsPage.virtualMachinesTab;
        await vmTab.enableColumn('Target power state');
        await vmTab.openPowerStateDialog(EXCLUDED_DISK_SOURCE_VM);
        await vmTab.powerStateModalSelect.click();
        await vmTab.powerStateOptionOn.click();
        await vmTab.powerStateModalSaveButton.click();
        await expect(vmTab.editTargetPowerStateModal).not.toBeVisible();
        await vmTab.waitForVMPowerState(EXCLUDED_DISK_SOURCE_VM, 'Powered on');

        await vmTab.openPowerStateDialog(WINDOWS_SOURCE_VM);
        await vmTab.powerStateModalSelect.click();
        await vmTab.powerStateOptionOff.click();
        await vmTab.powerStateModalSaveButton.click();
        await expect(vmTab.editTargetPowerStateModal).not.toBeVisible();
        await vmTab.waitForVMPowerState(WINDOWS_SOURCE_VM, 'Powered off');
      });

      await test.step('Save only the data disk as excluded', async () => {
        await saveExcludedDataDisk(planDetailsPage, resourceManager, planName);
      });
      await test.step('Clear and restore the persisted exclusion', async () => {
        await clearAndRestoreExcludedDataDisk(planDetailsPage, resourceManager, planName);
      });
    },
  );

  test(
    'should run cold migration',
    {
      tag: ['@downstream', '@slow'],
    },
    async ({ page }) => {
      const excludedDiskSourceSelected =
        testPlanData.virtualMachines?.[0]?.sourceName === EXCLUDED_DISK_SOURCE_VM;
      test.setTimeout(
        HAPPY_PATH_MIGRATION_TIMEOUT_MS +
          HAPPY_PATH_TEST_OVERHEAD_MS +
          (excludedDiskSourceSelected ? EXCLUDED_DISK_GUEST_BOOT_TIMEOUT_MS : 0),
      );
      const plansPage = new PlansListPage(page);
      const planDetailsPage = new PlanDetailsPage(page);

      await plansPage.navigateDirectly();
      await plansPage.navigateToPlan(planName);
      await planDetailsPage.verifyPlanTitle(planName);

      // Abort early on MAC conflict — leftover VMs from a previous run must be cleaned up first.
      const planResource = await resourceManager.fetchPlan(planName);
      if (excludedDiskSourceSelected) {
        expect(planResource?.spec?.warm).toBe(false);
        const rhelPlanVm = planResource?.spec?.vms?.[0];
        expect(rhelPlanVm?.name).toContain(EXCLUDED_DISK_SOURCE_VM);
        expect(
          rhelPlanVm && 'excludeDisks' in rhelPlanVm ? rhelPlanVm.excludeDisks : undefined,
        ).toEqual(['scsi0:1']);
        const windowsPlanVm = planResource?.spec?.vms?.[1];
        expect(windowsPlanVm?.name).toContain(WINDOWS_SOURCE_VM);
        expect(windowsPlanVm?.targetPowerState).toBe('off');
      }
      const hasMacConflict = planResource?.status?.conditions?.some(
        (condition) => condition.type === 'MacConflicts' && condition.status === 'True',
      );
      expect(
        hasMacConflict,
        'Plan has MAC address conflicts from leftover target VMs of a previous run. ' +
          'Downstream globalSetup deletes happy-path leftover VMs unless SKIP_HAPPY_PATH_LEFTOVER_CLEANUP=1. ' +
          'Delete those KubeVirt VMs and re-run.',
      ).toBe(false);

      // waitForPlanReady polls until Ready, tolerating transient 'Cannot start' from VDDK validation.
      await planDetailsPage.waitForPlanReady();

      // Register VMs for cleanup before migration starts — prevents MAC conflicts if the test times out.
      for (const vm of testPlanData.virtualMachines ?? []) {
        const migratedVMName = vm.targetName ?? vm.sourceName;
        if (migratedVMName) {
          resourceManager.addVm(migratedVMName, testPlanData.targetProject.name);
        }
      }

      await planDetailsPage.clickActionsMenuAndStart();

      await planDetailsPage.verifyMigrationInProgress();

      testLog('⏳ Waiting for migration to complete...');
      try {
        await planDetailsPage.waitForMigrationCompletion(HAPPY_PATH_MIGRATION_TIMEOUT_MS, true);
      } catch (cause: unknown) {
        if (!isMigrationTimeoutError(cause)) {
          throw cause;
        }

        let plan: V1beta1Plan | null = null;
        try {
          plan = await resourceManager.fetchPlan(planName);
        } catch (fetchError: unknown) {
          const fetchMessage =
            fetchError instanceof Error ? fetchError.message : String(fetchError);
          testLog(`Failed to fetch plan for migration timeout diagnostics: ${fetchMessage}`);
        }

        throw new Error(
          formatMigrationTimeoutDetail(
            plan,
            getMigrationTimeoutUiStatus(cause.message),
            HAPPY_PATH_MIGRATION_TIMEOUT_MS,
          ),
          { cause },
        );
      }

      for (const vm of testPlanData.virtualMachines ?? []) {
        const migratedVMName = vm.targetName ?? vm.sourceName;
        if (!migratedVMName) {
          throw new Error('VM name is required for verification');
        }

        const vmResource = await resourceManager.fetchVirtualMachine(
          migratedVMName,
          testPlanData.targetProject.name,
        );
        expect(vmResource).not.toBeNull();
        expect(vmResource?.metadata?.name).toBe(migratedVMName);
        expect(vmResource?.metadata?.namespace).toBe(testPlanData.targetProject.name);
      }

      if (excludedDiskSourceSelected) {
        const rhelTargetName = testPlanData.virtualMachines?.[0]?.targetName;
        expect(rhelTargetName, 'RHEL VM should have a target name').toBeTruthy();
        if (rhelTargetName) {
          await test.step('Verify only the boot disk remains and the RHEL guest is healthy', () =>
            verifyExcludedDiskTarget(
              resourceManager,
              rhelTargetName,
              testPlanData.targetProject.name,
            ));
        }
      }
    },
  );

  test(
    'should verify migrated VMs on CNV overview page',
    {
      tag: ['@downstream'],
    },
    async ({ page }) => {
      const TEST_TIMEOUT = 120_000;

      requireCNVVersion(test, CNV_4_21_0);
      test.setTimeout(TEST_TIMEOUT);

      const planDetailsPage = new PlanDetailsPage(page);
      const plansPage = new PlansListPage(page);
      const cnvVMPage = new VirtualMachineDetailsPage(page);

      await test.step('Navigate to plan VM tab', async () => {
        await plansPage.navigateDirectly();
        await plansPage.navigateToPlan(planName);
        await planDetailsPage.verifyPlanTitle(planName);
        await planDetailsPage.virtualMachinesTab.navigateToVirtualMachinesTab();
      });

      const vmsToVerify = (testPlanData.virtualMachines ?? [])
        .map((vm) => vm.targetName ?? vm.sourceName)
        .filter((name): name is string => Boolean(name));

      expect(vmsToVerify.length).toBeGreaterThan(0);

      for (const vmName of vmsToVerify) {
        await test.step(`Click VM "${vmName}" link and verify CNV overview`, async () => {
          const vmLink = page.getByRole('link', { exact: true, name: vmName });
          await expect(vmLink).toBeVisible({ timeout: ELEMENT_TIMEOUT });
          await vmLink.click();

          await cnvVMPage.waitForPageLoad(vmName);
          await cnvVMPage.verifySmokeOverview(vmName);

          await plansPage.navigateDirectly();
          await plansPage.navigateToPlan(planName);
          await planDetailsPage.verifyPlanTitle(planName);
          await planDetailsPage.virtualMachinesTab.navigateToVirtualMachinesTab();
        });
      }
    },
  );

  test(
    'should verify throughput metrics on overview page after migration',
    {
      tag: ['@downstream'],
    },
    async ({ page }) => {
      requireVersion(test, V2_12_0);
      test.setTimeout(120000);
      const overviewPage = new OverviewPage(page);

      await test.step('Navigate to Overview page', async () => {
        await overviewPage.navigateDirectly();
      });

      await test.step('Verify throughput cards are visible with correct titles', async () => {
        await overviewPage.networkThroughputCard.verifyCardVisible();
        await overviewPage.storageThroughputCard.verifyCardVisible();
      });

      await test.step('Verify default time range is "Last 1 hour"', async () => {
        await overviewPage.networkThroughputCard.verifyTimeRangeSelected('Last 1 hour');
        await overviewPage.storageThroughputCard.verifyTimeRangeSelected('Last 1 hour');
      });

      await test.step('Verify throughput charts show migration data', async () => {
        await overviewPage.networkThroughputCard.verifyHasChartData();
        await overviewPage.storageThroughputCard.verifyHasChartData();
      });

      await test.step('Verify migrated plan appears in throughput filters', async () => {
        await overviewPage.networkThroughputCard.verifyPlanInFilter(planName);
        await overviewPage.storageThroughputCard.verifyPlanInFilter(planName);
      });

      await test.step('Verify time range change preserves data', async () => {
        await overviewPage.networkThroughputCard.selectTimeRange('Last 6 hours');
        await overviewPage.networkThroughputCard.verifyTimeRangeSelected('Last 6 hours');
        await overviewPage.networkThroughputCard.verifyHasChartData();
      });

      await test.step('Verify storage throughput also has data at "Last 6 hours"', async () => {
        await overviewPage.storageThroughputCard.selectTimeRange('Last 6 hours');
        await overviewPage.storageThroughputCard.verifyTimeRangeSelected('Last 6 hours');
        await overviewPage.storageThroughputCard.verifyHasChartData();
      });
    },
  );

  test.afterAll(async () => {
    await resourceManager.cleanupAll();
  });
});
