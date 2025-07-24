/* eslint-disable */
import { test } from '@playwright/test';

import { TEST_DATA } from '../fixtures/test-data';
import { setupCreatePlanIntercepts } from '../intercepts';
import { CreatePlanWizardPage } from '../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { PlanDetailsPage } from '../page-objects/PlanDetailsPage';
import { PlansListPage } from '../page-objects/PlansListPage';

test.describe('Plans - Critical End-to-End Migration', () => {
  test.beforeEach(async ({ page }) => {
    console.log('🚀 Starting test setup...');

    // Log all console messages from the browser
    page.on('console', (msg) => {
      console.log(`🌐 BROWSER CONSOLE [${msg.type()}]:`, msg.text());
    });

    // Log all network requests
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('forklift.konveyor.io') || url.includes('providers')) {
        console.log('📡 REQUEST:', request.method(), url);
      }
    });

    // Log all network responses
    page.on('response', (response) => {
      const url = response.url();
      if (url.includes('forklift.konveyor.io') || url.includes('providers')) {
        console.log('📨 RESPONSE:', response.status(), url);
      }
    });

    console.log('🔧 Setting up API intercepts...');
    await setupCreatePlanIntercepts(page);
    console.log('✅ API intercepts setup complete');

    console.log('🧭 Navigating to Plans page...');
    const plansPage = new PlansListPage(page);
    await plansPage.navigateFromMainMenu();
    console.log('✅ Navigation complete');
  });

  test('should run plan creation wizard', async ({ page }) => {
    console.log('🎯 Starting plan creation wizard test...');

    const plansPage = new PlansListPage(page);
    const createWizard = new CreatePlanWizardPage(page);
    const planDetailsPage = new PlanDetailsPage(page);

    console.log('🔍 Checking create plan button state...');

    // Log button attributes before assertion
    const button = plansPage.createPlanButton;
    const isVisible = await button.isVisible();
    const isEnabled = await button.isEnabled();
    const ariaDisabled = await button.getAttribute('aria-disabled');

    console.log(
      '🔲 Button visible:',
      isVisible,
      'enabled:',
      isEnabled,
      'ariaDisabled:',
      ariaDisabled,
    );

    // Wait a bit to ensure all API calls have completed
    await page.waitForTimeout(2000);
    console.log('⏱️ Waited 2s for API calls to complete');

    // Check button state again after waiting
    const isEnabledAfterWait = await button.isEnabled();
    const ariaDisabledAfterWait = await button.getAttribute('aria-disabled');

    console.log(
      '🔲 Button after wait - enabled:',
      isEnabledAfterWait,
      'ariaDisabled:',
      ariaDisabledAfterWait,
    );

    console.log('🎯 Attempting to assert button is enabled...');
    await plansPage.assertCreatePlanButtonEnabled();
    console.log('✅ Create plan button is enabled!');

    console.log('🖱️ Clicking create plan button...');
    await plansPage.clickCreatePlanButton();
    console.log('✅ Create plan button clicked');

    console.log('📝 Waiting for wizard to load...');
    await createWizard.waitForWizardLoad();

    console.log('📝 Filling general information...');
    await createWizard.generalInformation.fillPlanName(TEST_DATA.planName);
    await createWizard.generalInformation.selectPlanProject(TEST_DATA.planProject);
    await createWizard.generalInformation.selectSourceProvider(TEST_DATA.sourceProvider);
    await createWizard.generalInformation.selectTargetProvider(TEST_DATA.targetProvider);
    await createWizard.generalInformation.waitForTargetProviderNamespaces();
    await createWizard.generalInformation.selectTargetProject(TEST_DATA.targetProject);
    await createWizard.clickNext();

    console.log('📝 Skipping to review...');
    await createWizard.clickSkipToReview();
    await createWizard.clickNext();

    console.log('🏁 Wizard completed, waiting for plan details page...');
    await planDetailsPage.waitForPageLoad();
    console.log('✅ Test completed successfully!');
  });
});
