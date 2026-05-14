import { expect, type Page, test } from '@playwright/test';

import { CreatePlanWizardPage } from '../../../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { CreateProviderPage } from '../../../page-objects/CreateProviderPage';
import { PlanDetailsPage } from '../../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { ProviderDetailsPage } from '../../../page-objects/ProviderDetailsPage/ProviderDetailsPage';
import { ProviderType } from '../../../types/enums';
import {
  createPlanTestData,
  Ec2SourceStorages,
  type PlanTestData,
  type ProviderData,
} from '../../../types/test-data';
import { getMappingWizardFieldRows } from '../../../utils/mappingWizardFieldRows';
import { getProviderConfig, hasProviderConfig } from '../../../utils/providers';
import { MTV_NAMESPACE } from '../../../utils/resource-manager/constants';
import { ResourceManager } from '../../../utils/resource-manager/ResourceManager';
import { V2_12_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

const EC2_PROVIDER_KEY = process.env.EC2_PROVIDER ?? 'ec2';

/** Downstream EC2 flows wait on controller + inventory; one ceiling for the whole serial suite. */
const EC2_PLAN_WIZARD_SUITE_TIMEOUT_MS = 300_000;

/** From provider details: create-plan wizard through general + VMs, stop on the network-map step. */
const openCreatePlanWizardFromProviderThroughNetworkMapStep = async (
  page: Page,
  wizard: CreatePlanWizardPage,
  sourceProviderName: string,
  planData: PlanTestData,
): Promise<void> => {
  const providerDetailsPage = new ProviderDetailsPage(page);
  await providerDetailsPage.navigate(sourceProviderName, MTV_NAMESPACE);
  await providerDetailsPage.waitForReadyStatus();
  await providerDetailsPage.clickCreatePlanButton();
  await wizard.waitForWizardLoad();
  await wizard.generalInformation.verifySourceProviderPrePopulated(sourceProviderName);
  await wizard.generalInformation.fillAndComplete(planData);
  await wizard.clickNext();
  await wizard.virtualMachines.fillAndComplete(planData.virtualMachines);
  await wizard.clickNext();
};

test.describe.serial('EC2 Plan Wizard — Mapping Auto-Population', () => {
  requireVersion(test, V2_12_0);
  test.describe.configure({ timeout: EC2_PLAN_WIZARD_SUITE_TIMEOUT_MS });

  if (!hasProviderConfig(EC2_PROVIDER_KEY)) {
    test.skip();
  }

  const resourceManager = new ResourceManager();

  /**
   * First serial test assigns this after create; later tests read it. `buildPlanData` closes over it so
   * `sourceProvider` matches the live provider name (cannot be inlined before the first test runs).
   */
  let providerName = '';

  const buildPlanData = (planName: string) =>
    createPlanTestData({
      networkMap: { isPreexisting: false, name: `${planName}-net` },
      planName,
      planProject: MTV_NAMESPACE,
      sourceProvider: providerName,
      storageMap: {
        isPreexisting: false,
        mappings: [],
        name: `${planName}-stor`,
      },
      targetProject: { isPreexisting: true, name: MTV_NAMESPACE },
      targetProvider: 'host',
      virtualMachines: undefined,
    });

  test(
    'should create EC2 provider for plan wizard tests',
    { tag: ['@downstream'] },
    async ({ page }) => {
      const providerConfig = getProviderConfig(EC2_PROVIDER_KEY);
      providerName = `test-ec2-plan-wizard-${Date.now()}`;
      const providerData: ProviderData = {
        accessKeyId: providerConfig.access_key_id,
        autoTargetCredentials: providerConfig.auto_target_credentials,
        ec2Region: providerConfig.region_name ?? providerConfig.region,
        hostname: providerConfig.api_url,
        // Unique per run so ResourceManager cleanup and serial follow-up tests stay deterministic.
        name: providerName,
        projectName: MTV_NAMESPACE,
        secretAccessKey: providerConfig.secret_access_key,
        type: ProviderType.EC2,
      };
      const createProvider = new CreateProviderPage(page, resourceManager);
      await createProvider.navigate();
      await createProvider.create(providerData);
    },
  );

  test(
    'should verify network map step shows populated EC2 sources',
    { tag: ['@downstream'] },
    async ({ page }) => {
      const createWizard = new CreatePlanWizardPage(page);
      const planData = buildPlanData(`ec2-net-map-${Date.now()}`);

      await test.step('Navigate to network map with a new VM selection', async () => {
        await openCreatePlanWizardFromProviderThroughNetworkMapStep(
          page,
          createWizard,
          providerName,
          planData,
        );
      });

      await test.step('Assert subnets or map options exist', async () => {
        await createWizard.networkMap.verifyStepVisible();
        await createWizard.networkMap.waitForData();
        await createWizard.page.getByTestId('use-new-network-map-radio').check();
        const fieldRows = getMappingWizardFieldRows(createWizard.page);
        await expect(fieldRows.first()).toBeVisible({ timeout: 15_000 });
        const rowCount = await fieldRows.count();
        expect(rowCount).toBeGreaterThan(0);
        expect(((await fieldRows.first().textContent()) ?? '').trim().length).toBeGreaterThan(0);
      });
    },
  );

  test(
    'should verify storage map step shows populated EBS sources',
    { tag: ['@downstream'] },
    async ({ page }) => {
      const createWizard = new CreatePlanWizardPage(page);
      const planData = buildPlanData(`ec2-stor-map-${Date.now()}`);

      await test.step('Open wizard through network map', async () => {
        await openCreatePlanWizardFromProviderThroughNetworkMapStep(
          page,
          createWizard,
          providerName,
          planData,
        );
        await createWizard.networkMap.fillAndComplete(planData.networkMap);
        await createWizard.clickNext();
      });

      await test.step('Assert EBS sources and storage class targets', async () => {
        await createWizard.storageMap.verifyStepVisible();
        await createWizard.storageMap.waitForData();
        await createWizard.page.getByTestId('use-new-storage-map-radio').check();
        const fieldRows = getMappingWizardFieldRows(createWizard.page);
        await expect(fieldRows.first()).toBeVisible({ timeout: 15_000 });
        const rowCount = await fieldRows.count();
        expect(rowCount).toBeGreaterThan(0);
        let foundEbsSource = false;
        for (let i = 0; i < rowCount; i += 1) {
          const sourceText =
            (await fieldRows.nth(i).locator('td').first().textContent())?.toLowerCase() ?? '';
          if (
            Object.values(Ec2SourceStorages).some((label) =>
              sourceText.includes(label.toLowerCase()),
            )
          ) {
            foundEbsSource = true;
            break;
          }
        }
        expect(foundEbsSource).toBe(true);
        const targetToggle = fieldRows.first().getByTestId('target-storage-select');
        await expect(targetToggle).toBeVisible();
        expect(((await targetToggle.textContent()) ?? '').trim().length).toBeGreaterThan(0);
      });
    },
  );

  test(
    'should complete plan creation and verify Mappings tab',
    { tag: ['@downstream'] },
    async ({ page }) => {
      const createWizard = new CreatePlanWizardPage(page, resourceManager);
      const planDetailsPage = new PlanDetailsPage(page);
      const planName = `ec2-mappings-plan-${Date.now()}`;
      const planData = buildPlanData(planName);

      await test.step('Reach review with default post-migration steps skipped', async () => {
        await openCreatePlanWizardFromProviderThroughNetworkMapStep(
          page,
          createWizard,
          providerName,
          planData,
        );
        await createWizard.networkMap.fillAndComplete(planData.networkMap);
        await createWizard.clickNext();
        await createWizard.storageMap.fillAndComplete(planData.storageMap);
        await createWizard.clickNext();
        await createWizard.clickSkipToReview();
      });

      await test.step('Review storage map table (EC2 has no default network mappings)', async () => {
        await createWizard.review.verifyStepVisible();
        expect(
          await createWizard.page
            .getByTestId('storage-map-review-table')
            .locator('tbody tr')
            .count(),
        ).toBeGreaterThan(0);
      });

      await test.step('Submit and verify plan mappings tab', async () => {
        await createWizard.clickNext();
        await createWizard.waitForPlanCreation();
        resourceManager.addPlan(planName, MTV_NAMESPACE);
        await planDetailsPage.verifyPlanTitle(planName);
        await planDetailsPage.mappingsTab.navigateToMappingsTab();
        const storageCount =
          await planDetailsPage.mappingsTab.getStorageMappingCountFromReviewTable();
        expect(storageCount).toBeGreaterThan(0);
      });
    },
  );

  test.afterAll(async () => {
    await resourceManager.instantCleanup();
  });
});
