import { existsSync } from 'fs';
import { join } from 'path';

import { expect, test } from '@playwright/test';

import { EndpointType, ProviderType } from '../../types/enums';

const providersPath = join(__dirname, '../../../.providers.json');
if (!existsSync(providersPath)) {
  throw new Error(`.providers.json file not found at: ${providersPath}`);
}

import * as providers from '../../../.providers.json';
import { VirtualMachineDetailsPage } from '../../page-objects/CNV/VirtualMachineDetailsPage';
import { CreatePlanWizardPage } from '../../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { CreateProviderPage } from '../../page-objects/CreateProviderPage';
import { OverviewPage } from '../../page-objects/OverviewPage';
import { PlanDetailsPage } from '../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { PlansListPage } from '../../page-objects/PlansListPage';
import { ProviderDetailsPage } from '../../page-objects/ProviderDetailsPage/ProviderDetailsPage';
import {
  createPlanTestData,
  NetworkTargets,
  type ProviderConfig,
  type ProviderData,
  SourceNetworks,
} from '../../types/test-data';
import { ELEMENT_TIMEOUT, MTV_NAMESPACE } from '../../utils/resource-manager/constants';
import { ResourceManager } from '../../utils/resource-manager/ResourceManager';
import { CNV_4_21_0, V2_10_5, V2_12_0 } from '../../utils/version/constants';
import { isVersionInStreams, requireCNVVersion, requireVersion } from '../../utils/version/version';

const targetProjectName = `test-project-${Date.now()}`;

test.describe.serial('Plans - VSphere to Host Happy Path Cold Migration', () => {
  requireVersion(test, V2_10_5);

  const resourceManager = new ResourceManager();

  let testProviderData: ProviderData = {
    name: '',
    projectName: MTV_NAMESPACE,
    type: ProviderType.VSPHERE,
    endpointType: EndpointType.VCENTER,
    hostname: '',
    username: '',
    password: '',
    vddkInitImage: '',
    useVddkAioOptimization: false,
  };

  const providerName = `test-vsphere-provider-${Date.now()}`;
  const planName = `${providerName}-plan`;

  const testPlanData = createPlanTestData({
    planName,
    sourceProvider: providerName,
    virtualMachines: [
      {
        sourceName: 'mtv-func-rhel9',
        targetName: `mtv-func-rhel9-renamed-${Date.now()}`,
        folder: 'vm',
      },
      {
        sourceName: 'mtv-func-win2019',
        targetName: `mtv-func-win2019-renamed-${Date.now()}`,
        folder: 'vm',
      },
    ],
    networkMap: {
      mappings: [
        { source: SourceNetworks.MGMT_NETWORK, target: NetworkTargets.DEFAULT },
        { source: SourceNetworks.VM_NETWORK, target: NetworkTargets.IGNORE },
      ],
    },
    targetProject: {
      name: targetProjectName,
      isPreexisting: false,
    },
  });

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
        name: providerName,
        projectName: MTV_NAMESPACE,
        type: providerConfig.type,
        endpointType: providerConfig.endpoint_type ?? EndpointType.VCENTER,
        hostname: providerConfig.api_url,
        username: providerConfig.username,
        password: providerConfig.password,
        vddkInitImage: providerConfig.vddk_init_image,
        useVddkAioOptimization: false,
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
      test.setTimeout(60000);
      const providerDetailsPage = new ProviderDetailsPage(page);
      const createWizard = new CreatePlanWizardPage(page, resourceManager);
      const planDetailsPage = new PlanDetailsPage(page);

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
    'should run cold migration',
    {
      tag: ['@downstream', '@slow'],
    },
    async ({ page }) => {
      const timeout = 20 * 60000;
      test.setTimeout(timeout);
      const plansPage = new PlansListPage(page);
      const planDetailsPage = new PlanDetailsPage(page);

      await plansPage.navigateFromMainMenu();
      await plansPage.waitForPageLoad();
      await plansPage.navigateToPlan(planName);
      await planDetailsPage.verifyPlanTitle(planName);

      await planDetailsPage.verifyPlanStatus('Ready for migration', true);

      await planDetailsPage.clickActionsMenuAndStart();

      await planDetailsPage.verifyMigrationInProgress();

      console.log('⏳ Waiting for migration to complete...');
      await planDetailsPage.waitForMigrationCompletion(timeout, true);

      // Verify each migrated VM exists and add to cleanup
      for (const vm of testPlanData.virtualMachines ?? []) {
        const migratedVMName = vm.targetName ?? vm.sourceName;
        if (!migratedVMName) {
          throw new Error('VM name is required for verification');
        }

        resourceManager.addVm(migratedVMName, testPlanData.targetProject.name);

        // Fetch the migrated VM to verify it exists
        const vmResource = await resourceManager.fetchVirtualMachine(
          page,
          migratedVMName,
          testPlanData.targetProject.name,
        );
        expect(vmResource).not.toBeNull();
        expect(vmResource?.metadata?.name).toBe(migratedVMName);
        expect(vmResource?.metadata?.namespace).toBe(testPlanData.targetProject.name);
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
        await plansPage.navigateFromMainMenu();
        await plansPage.waitForPageLoad();
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
          const vmLink = page.getByRole('link', { name: vmName, exact: true });
          await expect(vmLink).toBeVisible({ timeout: ELEMENT_TIMEOUT });
          await vmLink.click();

          await cnvVMPage.waitForPageLoad(vmName);
          await cnvVMPage.verifySmokeOverview(vmName);

          await plansPage.navigateFromMainMenu();
          await plansPage.waitForPageLoad();
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
    await resourceManager.instantCleanup();
  });
});
