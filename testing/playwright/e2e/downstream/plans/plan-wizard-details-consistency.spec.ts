import { expect } from '@playwright/test';

import { providerOnlyFixtures as test } from '../../../fixtures/resourceFixtures';
import { CreatePlanWizardPage } from '../../../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { PlanDetailsPage } from '../../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { MigrationType } from '../../../types/enums';
import { createPlanTestData, type PlanTestData } from '../../../types/test-data';
import { V2_12_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

test.describe('Plan Wizard-Details Consistency', { tag: '@downstream' }, () => {
  requireVersion(test, V2_12_0);

  test('should verify warm migration type in review step matches details page', async ({
    page,
    testProvider,
    resourceManager,
  }) => {
    const testData: PlanTestData = createPlanTestData({
      sourceProvider: testProvider?.metadata?.name ?? '',
      migrationType: MigrationType.WARM,
    });
    resourceManager.addPlan(testData.planName, testData.planProject);

    const wizard = new CreatePlanWizardPage(page, resourceManager);
    await wizard.navigate();
    await wizard.waitForWizardLoad();

    await test.step('Navigate to Migration Type step and select Warm', async () => {
      await wizard.navigateToMigrationTypeStep(testData);
      await wizard.migrationType.verifyStepVisible();
      await wizard.migrationType.selectMigrationType(MigrationType.WARM);
      await expect(wizard.migrationType.warmMigrationRadio).toBeChecked();
    });

    await test.step('Skip to Review and verify migration type value', async () => {
      await wizard.clickSkipToReview();
      await wizard.review.verifyStepVisible();
      await wizard.review.verifyMigrationTypeValue('Warm migration');
    });

    await test.step('Create the plan', async () => {
      await wizard.clickNext();
      await wizard.waitForPlanCreation();
    });

    await test.step('Verify migration type on details page matches review', async () => {
      const planDetailsPage = new PlanDetailsPage(page);
      await planDetailsPage.detailsTab.navigateToDetailsTab();
      await planDetailsPage.detailsTab.verifyMigrationType(MigrationType.WARM);
    });
  });

  test('should verify preserve static IPs default in review step matches details page', async ({
    page,
    testProvider,
    resourceManager,
  }) => {
    const testData: PlanTestData = createPlanTestData({
      sourceProvider: testProvider?.metadata?.name ?? '',
    });
    resourceManager.addPlan(testData.planName, testData.planProject);

    const wizard = new CreatePlanWizardPage(page, resourceManager);
    await wizard.navigate();
    await wizard.waitForWizardLoad();

    await test.step('Navigate through wizard to review step', async () => {
      await wizard.generalInformation.fillAndComplete(testData);
      await wizard.clickNext();
      await wizard.virtualMachines.fillAndComplete(testData.virtualMachines);
      await wizard.clickNext();
      await wizard.networkMap.fillAndComplete(testData.networkMap);
      await wizard.clickNext();
      await wizard.storageMap.fillAndComplete(testData.storageMap);
      await wizard.clickNext();
      await wizard.clickSkipToReview();
    });

    await test.step('Verify preserve static IPs is Enabled in review (vSphere default)', async () => {
      await wizard.review.verifyStepVisible();
      await wizard.review.verifyPreserveStaticIPs(true);
    });

    await test.step('Create the plan', async () => {
      await wizard.clickNext();
      await wizard.waitForPlanCreation();
    });

    await test.step('Verify preserve static IPs on details page matches review', async () => {
      const planDetailsPage = new PlanDetailsPage(page);
      await planDetailsPage.detailsTab.navigateToDetailsTab();
      await planDetailsPage.detailsTab.verifyPreserveStaticIPs(true);
    });
  });

  test('should verify shared disks default in review step matches details page', async ({
    page,
    testProvider,
    resourceManager,
  }) => {
    const testData: PlanTestData = createPlanTestData({
      sourceProvider: testProvider?.metadata?.name ?? '',
    });
    resourceManager.addPlan(testData.planName, testData.planProject);

    const wizard = new CreatePlanWizardPage(page, resourceManager);
    await wizard.navigate();
    await wizard.waitForWizardLoad();

    await test.step('Navigate through wizard to review step', async () => {
      await wizard.generalInformation.fillAndComplete(testData);
      await wizard.clickNext();
      await wizard.virtualMachines.fillAndComplete(testData.virtualMachines);
      await wizard.clickNext();
      await wizard.networkMap.fillAndComplete(testData.networkMap);
      await wizard.clickNext();
      await wizard.storageMap.fillAndComplete(testData.storageMap);
      await wizard.clickNext();
      await wizard.clickSkipToReview();
    });

    await test.step('Verify shared disks is Enabled in review (default)', async () => {
      await wizard.review.verifyStepVisible();
      await wizard.review.verifySharedDisks(true);
    });

    await test.step('Create the plan', async () => {
      await wizard.clickNext();
      await wizard.waitForPlanCreation();
    });

    await test.step('Verify shared disks on details page matches review', async () => {
      const planDetailsPage = new PlanDetailsPage(page);
      await planDetailsPage.detailsTab.navigateToDetailsTab();
      await planDetailsPage.detailsTab.verifySharedDisks(true);
    });
  });
});
