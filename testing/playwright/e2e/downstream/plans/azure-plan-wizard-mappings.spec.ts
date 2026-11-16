import { expect, type Page, test } from '@playwright/test';

import { CreatePlanWizardPage } from '../../../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { CreateProviderPage } from '../../../page-objects/CreateProviderPage';
import { ProviderDetailsPage } from '../../../page-objects/ProviderDetailsPage/ProviderDetailsPage';
import { ProviderType } from '../../../types/enums';
import {
  AzureSourceStorages,
  createPlanTestData,
  type PlanTestData,
  type ProviderData,
} from '../../../types/test-data';
import { AZURE_PROVIDER_KEY, requireAzureProviderConfig } from '../../../utils/azure/azure';
import { getProviderConfig, hasProviderConfig } from '../../../utils/providers';
import { MTV_NAMESPACE } from '../../../utils/resource-manager/constants';
import { ResourceManager } from '../../../utils/resource-manager/ResourceManager';
import { V5_1_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

const fillWizardThroughVMsStep = async (
  page: Page,
  wizard: CreatePlanWizardPage,
  provider: string,
  planData: PlanTestData,
): Promise<void> => {
  const providerDetailsPage = new ProviderDetailsPage(page);
  await providerDetailsPage.navigate(provider, MTV_NAMESPACE);
  await providerDetailsPage.waitForReadyStatus();
  await providerDetailsPage.clickCreatePlanButton();
  await wizard.waitForWizardLoad();
  await wizard.generalInformation.verifySourceProviderPrePopulated(provider);
  await wizard.generalInformation.fillAndComplete(planData);
  await wizard.clickNext();
  await wizard.virtualMachines.fillAndComplete(planData.virtualMachines);
  await wizard.clickNext();
};

const buildPlanData = (planName: string, sourceProvider: string): PlanTestData =>
  createPlanTestData({
    networkMap: { isPreexisting: false, name: `${planName}-net` },
    planName,
    planProject: MTV_NAMESPACE,
    sourceProvider,
    storageMap: {
      isPreexisting: false,
      mappings: [],
      name: `${planName}-stor`,
    },
    targetProject: { isPreexisting: true, name: MTV_NAMESPACE },
    targetProvider: 'host',
    virtualMachines: undefined,
  });

test.describe.serial('Azure Plan Wizard — NIC and disk type mappings', () => {
  requireVersion(test, V5_1_0);
  requireAzureProviderConfig(test);
  test.describe.configure({ timeout: 300_000 });

  if (!hasProviderConfig(AZURE_PROVIDER_KEY)) {
    test.skip();
  }

  const resourceManager = new ResourceManager();
  let providerName = '';

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();

    const providerConfig = getProviderConfig(AZURE_PROVIDER_KEY);
    const name = `test-azure-plan-wizard-${Date.now()}`;
    providerName = name;

    const providerData: ProviderData = {
      azureClientId: providerConfig.azure_client_id,
      azureClientSecret: providerConfig.azure_client_secret,
      azureResourceGroup: providerConfig.azure_resource_group,
      azureSubscriptionId: providerConfig.azure_subscription_id,
      azureTenantId: providerConfig.azure_tenant_id,
      hostname: providerConfig.api_url,
      name,
      projectName: MTV_NAMESPACE,
      type: ProviderType.AZURE,
    };

    const createProvider = new CreateProviderPage(page, resourceManager);
    await createProvider.navigate();
    await createProvider.create(providerData);

    await context.close();
  });

  test.afterAll(async () => {
    await resourceManager.cleanupAll();
  });

  test(
    'should verify the network map step shows Azure NIC sources',
    { tag: ['@downstream'] },
    async ({ page }) => {
      const createWizard = new CreatePlanWizardPage(page);
      const planData = buildPlanData(`azure-net-map-${Date.now()}`, providerName);

      await test.step('Navigate to the network map with a new VM selection', async () => {
        await fillWizardThroughVMsStep(page, createWizard, providerName, planData);
      });

      await test.step('Assert mapped NIC sources exist', async () => {
        await createWizard.networkMap.verifyStepVisible();
        await createWizard.networkMap.waitForData();
        await page.getByTestId('use-new-network-map-radio').check();
        const fieldRows = page.locator('[data-testid^="field-row-"]');
        await expect(fieldRows.first()).toBeVisible({ timeout: 15_000 });
        expect(await fieldRows.count()).toBeGreaterThan(0);
        expect(((await fieldRows.first().textContent()) ?? '').trim().length).toBeGreaterThan(0);
      });
    },
  );

  test(
    'should verify the storage map step shows Azure managed disk types',
    { tag: ['@downstream'] },
    async ({ page }) => {
      const createWizard = new CreatePlanWizardPage(page);
      const planData = buildPlanData(`azure-stor-map-${Date.now()}`, providerName);

      await test.step('Open the wizard through the network map', async () => {
        await fillWizardThroughVMsStep(page, createWizard, providerName, planData);
        await createWizard.networkMap.fillAndComplete({
          isPreexisting: false,
          name: `${planData.planName}-net`,
        });
        await createWizard.clickNext();
      });

      await test.step('Assert managed disk SKUs and storage class targets', async () => {
        await createWizard.storageMap.verifyStepVisible();
        await createWizard.storageMap.waitForData();
        await page.getByTestId('use-new-storage-map-radio').check();
        const fieldRows = page.locator('[data-testid^="field-row-"]');
        await expect(fieldRows.first()).toBeVisible({ timeout: 15_000 });
        const rowCount = await fieldRows.count();
        expect(rowCount).toBeGreaterThan(0);

        let foundAzureDiskType = false;
        for (let index = 0; index < rowCount; index += 1) {
          const sourceText =
            (await fieldRows.nth(index).locator('td').first().textContent())?.toLowerCase() ?? '';
          if (
            Object.values(AzureSourceStorages).some((label) =>
              sourceText.includes(label.toLowerCase()),
            )
          ) {
            foundAzureDiskType = true;
            break;
          }
        }

        expect(foundAzureDiskType).toBe(true);
        const targetToggle = fieldRows.first().getByTestId('target-storage-select');
        await expect(targetToggle).toBeVisible();
        expect(((await targetToggle.textContent()) ?? '').trim().length).toBeGreaterThan(0);
      });
    },
  );
});
