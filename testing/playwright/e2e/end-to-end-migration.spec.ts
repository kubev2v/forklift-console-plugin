import { test } from '@playwright/test';

import { TEST_DATA } from '../fixtures/test-data';
import { setupCreatePlanIntercepts } from '../intercepts';
import { CreatePlanWizardPage } from '../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { PlanDetailsPage } from '../page-objects/PlanDetailsPage';
import { PlansListPage } from '../page-objects/PlansListPage';

test.describe('Plans - Critical End-to-End Migration', () => {
  test.beforeEach(async ({ page }) => {
    // Capture browser console logs and errors
    page.on('console', (msg) => {
      // eslint-disable-next-line no-console
      console.log(`🖥️ BROWSER ${msg.type().toUpperCase()}: ${msg.text()}`);
    });

    page.on('pageerror', (error) => {
      // eslint-disable-next-line no-console
      console.error(`🖥️ BROWSER ERROR: ${error.message}`);
      // eslint-disable-next-line no-console
      console.error(`🖥️ BROWSER STACK: ${error.stack}`);
    });

    await setupCreatePlanIntercepts(page);
    const plansPage = new PlansListPage(page);
    await plansPage.navigateFromMainMenu();
  });

  test('should run plan creation wizard', async ({ page }) => {
    const plansPage = new PlansListPage(page);
    const createWizard = new CreatePlanWizardPage(page);
    const planDetailsPage = new PlanDetailsPage(page);

    // Navigate to wizard
    await plansPage.waitForPageLoad();
    await plansPage.clickCreatePlanButton();
    await createWizard.waitForWizardLoad();

    // STEP 1: General Information
    await createWizard.generalInformation.fillPlanName(TEST_DATA.planName);
    await createWizard.generalInformation.selectPlanProject(TEST_DATA.planProject);
    await createWizard.generalInformation.selectSourceProvider(TEST_DATA.sourceProvider);
    await createWizard.generalInformation.selectTargetProvider(TEST_DATA.targetProvider);
    await createWizard.generalInformation.waitForTargetProviderNamespaces();
    await createWizard.generalInformation.selectTargetProject(TEST_DATA.targetProject);
    await createWizard.clickNext();

    // STEP 2: Virtual Machines
    await createWizard.virtualMachines.verifyStepVisible();
    await createWizard.virtualMachines.verifyTableLoaded();
    await createWizard.virtualMachines.selectFirstVirtualMachine();
    await createWizard.clickNext();

    // STEP 3: Network Map
    await createWizard.networkMap.verifyStepVisible();
    await createWizard.networkMap.waitForData();
    await createWizard.networkMap.selectNetworkMap(TEST_DATA.networkMap);
    await createWizard.clickNext();

    // STEP 4: Storage Map
    await createWizard.storageMap.verifyStepVisible();
    await createWizard.storageMap.waitForData();
    await createWizard.storageMap.selectStorageMap(TEST_DATA.storageMap);
    await createWizard.clickNext();
    await createWizard.clickSkipToReview();

    // STEP 5: Review
    await createWizard.review.verifyStepVisible();
    await createWizard.review.verifyAllSections(
      {
        planName: TEST_DATA.planName,
        planProject: TEST_DATA.planProject,
        sourceProvider: TEST_DATA.sourceProvider,
        targetProvider: TEST_DATA.targetProvider,
        targetProject: TEST_DATA.targetProject,
      },
      TEST_DATA.networkMap,
      TEST_DATA.storageMap,
    );
    await page.pause();
    // STEP 6: Create the plan and verify basic plan details
    await createWizard.clickNext();
    // await page.pause();
    await createWizard.waitForPlanCreation();
    // eslint-disable-next-line no-console
    console.log(`🚀 NAVIGATED TO URL: ${page.url()}`);
    await planDetailsPage.waitForPageLoad();
    await planDetailsPage.verifyBasicPlanDetailsPage({
      planName: TEST_DATA.planName,
      planProject: TEST_DATA.planProject,
      targetProject: TEST_DATA.targetProject,
    });
  });
});
