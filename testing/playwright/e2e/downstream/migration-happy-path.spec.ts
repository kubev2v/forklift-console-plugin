import { existsSync } from 'fs';
import { join } from 'path';

import { expect, test } from '@playwright/test';

const providersPath = join(__dirname, '../../../.providers.json');
if (!existsSync(providersPath)) {
  throw new Error(`.providers.json file not found at: ${providersPath}`);
}

import * as providers from '../../../.providers.json';
import { CreatePlanWizardPage } from '../../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { CreateProviderPage } from '../../page-objects/CreateProviderPage';
import { PlanDetailsPage } from '../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { PlansListPage } from '../../page-objects/PlansListPage';
import { ProviderDetailsPage } from '../../page-objects/ProviderDetailsPage';
import { ProvidersListPage } from '../../page-objects/ProvidersListPage';
import { createPlanTestData, type ProviderConfig, type ProviderData } from '../../types/test-data';
import { ResourceManager } from '../../utils/resource-manager/ResourceManager';

test.describe.serial('Plans - VSphere to Host Happy Path Cold Migration', () => {
  const resourceManager = new ResourceManager();

  let testProviderData: ProviderData = {
    name: '',
    type: 'vsphere',
    endpointType: 'vcenter',
    hostname: '',
    username: '',
    password: '',
    vddkInitImage: '',
    useVddkAioOptimization: false,
  };

  const providerName = `test-vsphere-provider-${Date.now()}`;
  const planName = `${providerName}-plan`;
  const targetProjectName = `test-project-${Date.now()}`;

  const testPlanData = createPlanTestData({
    planName,
    planProject: 'openshift-mtv',
    sourceProvider: providerName,
    targetProvider: 'host',
    targetProject: {
      name: targetProjectName,
      isPreexisting: false,
    },
    networkMap: {
      name: `${planName}-network-map`,
      isPreexisting: false,
    },
    storageMap: {
      name: `${planName}-storage-map`,
      isPreexisting: false,
      targetStorage: 'ocs-storagecluster-ceph-rbd-virtualization',
    },
    virtualMachines: [
      { sourceName: 'mtv-func-rhel9', targetName: `mtv-func-rhel9-renamed-${Date.now()}` },
    ],
  });

  test(
    'should create a new vsphere provider',
    {
      tag: ['@downstream'],
    },
    async ({ page }) => {
      const providersPage = new ProvidersListPage(page);
      const createProvider = new CreateProviderPage(page, resourceManager);
      const providerDetailsPage = new ProviderDetailsPage(page);

      const providerKey = process.env.VSPHERE_PROVIDER ?? 'vsphere-8.0.1';
      const providerConfig = (providers as Record<string, ProviderConfig>)[providerKey];

      testProviderData = {
        name: providerName,
        type: providerConfig.type,
        endpointType: providerConfig.endpoint_type ?? 'vcenter',
        hostname: providerConfig.api_url,
        username: providerConfig.username,
        password: providerConfig.password,
        vddkInitImage: providerConfig.vddk_init_image,
        useVddkAioOptimization: false,
      };

      await providersPage.navigateFromMainMenu();
      await providersPage.clickCreateProviderButton();
      await createProvider.waitForWizardLoad();
      await createProvider.fillAndSubmit(testProviderData);
      await providerDetailsPage.waitForPageLoad();
      await providerDetailsPage.verifyProviderDetails(testProviderData);
    },
  );

  test(
    'should create a new cold migration plan',
    {
      tag: ['@downstream'],
    },
    async ({ page }) => {
      test.setTimeout(60000);
      const plansPage = new PlansListPage(page);
      const createWizard = new CreatePlanWizardPage(page, resourceManager);
      const planDetailsPage = new PlanDetailsPage(page);

      await plansPage.navigateFromMainMenu();
      await plansPage.clickCreatePlanButton();
      await createWizard.waitForWizardLoad();
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
      const timeout = 15 * 60000;
      test.setTimeout(timeout);
      const plansPage = new PlansListPage(page);
      const planDetailsPage = new PlanDetailsPage(page);

      await plansPage.navigateFromMainMenu();
      await plansPage.waitForPageLoad();
      await plansPage.navigateToPlan(planName);
      await planDetailsPage.verifyPlanTitle(planName);

      await planDetailsPage.verifyPlanStatus('Ready for migration');

      console.log('Starting migration via actions menu...');
      await planDetailsPage.clickActionsMenuAndStart();

      await planDetailsPage.verifyMigrationInProgress();
      console.log('Migration started successfully');

      console.log('⏳ Waiting for migration to complete...');
      await planDetailsPage.waitForMigrationCompletion(timeout, true);
      console.log(`[${new Date().toLocaleString()}] ✅ Migration completed successfully!`);

      // Verify each migrated VM exists and add to cleanup
      for (const vm of testPlanData.virtualMachines ?? []) {
        const migratedVMName = vm.targetName ?? vm.sourceName;

        // Create VM stub for cleanup (added first to ensure cleanup even if verification fails)
        const vmStub = {
          apiVersion: 'kubevirt.io/v1',
          kind: 'VirtualMachine',
          metadata: {
            name: migratedVMName,
            namespace: targetProjectName,
          },
        };
        resourceManager.addResource(vmStub);

        // Fetch the migrated VM to verify it exists
        const vmResource = await resourceManager.fetchVirtualMachine(
          page,
          migratedVMName,
          targetProjectName,
        );
        expect(vmResource).not.toBeNull();
        expect(vmResource?.metadata?.name).toBe(migratedVMName);
        expect(vmResource?.metadata?.namespace).toBe(targetProjectName);
      }
    },
  );

  test.afterAll(async () => {
    await resourceManager.instantCleanup();
  });
});
