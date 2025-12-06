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
import { createPlanTestData, type ProviderConfig, type ProviderData } from '../../types/test-data';
import { MTV_NAMESPACE } from '../../utils/resource-manager/constants';
import { ResourceManager } from '../../utils/resource-manager/ResourceManager';

const targetProjectName = `test-project-${Date.now()}`;

test.describe.serial('Plans - VSphere to Host Happy Path Cold Migration', () => {
  const resourceManager = new ResourceManager();

  let testProviderData: ProviderData = {
    name: '',
    projectName: MTV_NAMESPACE,
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

  const testPlanData = createPlanTestData({
    planName,
    sourceProvider: providerName,
    virtualMachines: [
      {
        sourceName: 'mtv-func-rhel9',
        targetName: `mtv-func-rhel9-renamed-${Date.now()}`,
        folder: 'vm',
      },
    ],
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
        endpointType: providerConfig.endpoint_type ?? 'vcenter',
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

      await planDetailsPage.verifyPlanStatus('Ready for migration', true);

      await planDetailsPage.clickActionsMenuAndStart();

      await planDetailsPage.verifyMigrationInProgress();

      console.log('⏳ Waiting for migration to complete...');
      await planDetailsPage.waitForMigrationCompletion(timeout, true);

      // Verify each migrated VM exists and add to cleanup
      for (const vm of testPlanData.virtualMachines ?? []) {
        const migratedVMName = vm.targetName ?? vm.sourceName;

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

  test.afterAll(async () => {
    await resourceManager.instantCleanup();
  });
});
