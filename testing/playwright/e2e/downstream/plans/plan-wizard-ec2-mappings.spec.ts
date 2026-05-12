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
import { getProviderConfig, hasProviderConfig } from '../../../utils/providers';
import { MTV_NAMESPACE } from '../../../utils/resource-manager/constants';
import { ResourceManager } from '../../../utils/resource-manager/ResourceManager';
import { V2_12_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

const EC2_PROVIDER_KEY = process.env.EC2_PROVIDER ?? 'ec2';

const PROVIDER_CREATION_TIMEOUT_MS = 240_000;
const WIZARD_FLOW_TIMEOUT_MS = 300_000;

/**
 * Navigates through the plan wizard filling general info and VM selection,
 * then advances to the network map step and returns the wizard instance.
 */
const fillWizardThroughVmStep = async (
  page: Page,
  providerName: string,
  planData: PlanTestData,
): Promise<CreatePlanWizardPage> => {
  const wizard = new CreatePlanWizardPage(page);
  const providerDetailsPage = new ProviderDetailsPage(page);

  await providerDetailsPage.navigate(providerName, MTV_NAMESPACE);
  await providerDetailsPage.waitForReadyStatus();
  await providerDetailsPage.clickCreatePlanButton();
  await wizard.waitForWizardLoad();
  await wizard.generalInformation.verifySourceProviderPrePopulated(providerName);
  await wizard.generalInformation.fillAndComplete(planData);
  await wizard.clickNext();
  await wizard.virtualMachines.fillAndComplete(planData.virtualMachines);
  await wizard.clickNext();

  return wizard;
};

test.describe.serial('EC2 Plan Wizard — Mapping Auto-Population', () => {
  requireVersion(test, V2_12_0);

  const resourceManager = new ResourceManager();

  // Set by the first test (provider creation) and used by subsequent serial tests.
  // Stays empty if provider creation fails, causing dependent tests to skip.
  let providerName = '';

  test.beforeEach(() => {
    test.skip(
      !hasProviderConfig(EC2_PROVIDER_KEY),
      `Provider config '${EC2_PROVIDER_KEY}' not found in .providers.json`,
    );
  });

  const buildPlanData = (planName: string): PlanTestData =>
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
      test.setTimeout(PROVIDER_CREATION_TIMEOUT_MS);
      const providerConfig = getProviderConfig(EC2_PROVIDER_KEY);
      const name = `test-ec2-plan-wizard-${Date.now()}`;
      const providerData: ProviderData = {
        accessKeyId: providerConfig.access_key_id,
        autoTargetCredentials: providerConfig.auto_target_credentials,
        ec2Region: providerConfig.region_name ?? providerConfig.region,
        hostname: providerConfig.api_url,
        name,
        projectName: MTV_NAMESPACE,
        secretAccessKey: providerConfig.secret_access_key,
        type: ProviderType.EC2,
      };
      const createProvider = new CreateProviderPage(page, resourceManager);
      await createProvider.navigate();
      await createProvider.create(providerData);

      providerName = name;
    },
  );

  test(
    'should verify network map step shows populated EC2 sources',
    { tag: ['@downstream'] },
    async ({ page }) => {
      test.skip(!providerName, 'Provider was not created — skipping dependent test');
      test.setTimeout(WIZARD_FLOW_TIMEOUT_MS);
      const planData = buildPlanData(`ec2-net-map-${Date.now()}`);
      const wizard = await fillWizardThroughVmStep(page, providerName, planData);

      await test.step('Assert subnets or map options exist', async () => {
        await wizard.networkMap.verifyStepVisible();
        await wizard.networkMap.waitForData();
        await wizard.page.getByTestId('use-new-network-map-radio').check();
        // Matches field-row-0, field-row-1, etc. — each row in the mapping table
        const fieldRows = wizard.page.getByTestId(/^field-row-\d+$/);
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
      test.skip(!providerName, 'Provider was not created — skipping dependent test');
      test.setTimeout(WIZARD_FLOW_TIMEOUT_MS);
      const planData = buildPlanData(`ec2-stor-map-${Date.now()}`);
      const wizard = await fillWizardThroughVmStep(page, providerName, planData);

      await wizard.networkMap.fillAndComplete(planData.networkMap);
      await wizard.clickNext();

      await test.step('Assert EBS sources and storage class targets', async () => {
        await wizard.storageMap.verifyStepVisible();
        await wizard.storageMap.waitForData();
        await wizard.page.getByTestId('use-new-storage-map-radio').check();
        // Matches field-row-0, field-row-1, etc. — each row in the mapping table
        const fieldRows = wizard.page.getByTestId(/^field-row-\d+$/);
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
      test.skip(!providerName, 'Provider was not created — skipping dependent test');
      test.setTimeout(WIZARD_FLOW_TIMEOUT_MS);
      const wizardWithRm = new CreatePlanWizardPage(page, resourceManager);
      const planDetailsPage = new PlanDetailsPage(page);
      const planName = `ec2-mappings-plan-${Date.now()}`;
      const planData = buildPlanData(planName);

      await test.step('Navigate wizard to review', async () => {
        const wizard = await fillWizardThroughVmStep(page, providerName, planData);
        await wizard.networkMap.fillAndComplete(planData.networkMap);
        await wizard.clickNext();
        await wizard.storageMap.fillAndComplete(planData.storageMap);
        await wizard.clickNext();
        await wizard.clickSkipToReview();
      });

      await test.step('Review storage map table (EC2 has no default network mappings)', async () => {
        await wizardWithRm.review.verifyStepVisible();
        expect(
          await wizardWithRm.page
            .getByTestId('storage-map-review-table')
            .locator('tbody tr')
            .count(),
        ).toBeGreaterThan(0);
      });

      await test.step('Submit and verify plan mappings tab', async () => {
        await wizardWithRm.clickNext();
        await wizardWithRm.waitForPlanCreation();
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
