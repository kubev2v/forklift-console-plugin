/* eslint-disable */
import { test } from '@playwright/test';

import { TEST_DATA } from '../fixtures/test-data';
import { setupCreatePlanIntercepts } from '../intercepts';
import { CreatePlanWizardPage } from '../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { PlanDetailsPage } from '../page-objects/PlanDetailsPage';
import { PlansListPage } from '../page-objects/PlansListPage';

test.describe('Plans - Critical End-to-End Migration', () => {
  // Track ALL API calls with enhanced logging (declare at describe scope)
  let apiCalls: any[] = [];
  let selfSubjectCalls = 0;
  let providerCalls = 0;

  test.beforeEach(async ({ page }) => {
    console.log('🚀 Starting test setup...');

    // Reset counters for each test
    apiCalls = [];
    selfSubjectCalls = 0;
    providerCalls = 0;

    // Log all console messages from the browser
    page.on('console', (msg) => {
      console.log(`🌐 BROWSER CONSOLE [${msg.type()}]:`, msg.text());
    });

    // Enhanced request tracking
    page.on('request', (request) => {
      const url = request.url();
      const method = request.method();

      // Track SelfSubjectAccessReview specifically
      if (url.includes('selfsubjectaccessreviews')) {
        selfSubjectCalls++;
        console.log(`🎯 SelfSubjectAccessReview REQUEST #${selfSubjectCalls}:`, url);
        console.log(`   📋 Method: ${method}`);
        console.log(`   📦 Body:`, request.postData());
        console.log(`   📋 Headers:`, JSON.stringify(request.headers()));

        apiCalls.push({
          type: 'SelfSubjectAccessReview',
          method,
          url,
          timestamp: new Date().toISOString(),
        });
      }

      // Track provider calls (needed for useHasSufficientProviders)
      if (url.includes('providers') && !url.includes('forklift-console-plugin')) {
        providerCalls++;
        console.log(`🔧 Provider API REQUEST #${providerCalls}:`, url);

        apiCalls.push({
          type: 'Provider',
          method,
          url,
          timestamp: new Date().toISOString(),
        });
      }

      // Log all Forklift-related network requests with detailed info
      if (url.includes('forklift') || url.includes('authorization.k8s.io')) {
        console.log(`📡 REQUEST: ${request.method()} ${url}`);
        console.log(`   📋 Headers: ${JSON.stringify(request.headers())}`);

        // EXTRA: Check if this is a provider list request
        if (url.includes('/providers') && !url.includes('/providers/test-')) {
          console.log('🏭 PROVIDER LIST REQUEST detected:', url);
        }
      }
    });

    // Enhanced response tracking
    page.on('response', (response) => {
      const url = response.url();
      const status = response.status();

      if (url.includes('selfsubjectaccessreviews')) {
        console.log(`✅ SelfSubjectAccessReview RESPONSE: ${status} ${url}`);

        // Try to get response body
        void response
          .json()
          .then((data) => {
            console.log('📨 SelfSubjectAccessReview Response data:', JSON.stringify(data, null, 2));

            if (data.status && data.status.allowed !== undefined) {
              console.log(`🔑 Permission result: allowed=${data.status.allowed}`);
            }
          })
          .catch((err) => {
            console.log(
              '❌ Could not parse SelfSubjectAccessReview response as JSON:',
              err.message,
            );
          });
      }

      if (url.includes('providers') && !url.includes('forklift-console-plugin')) {
        console.log(`📦 Provider API RESPONSE: ${status} ${url}`);

        void response
          .json()
          .then((data: any) => {
            if (data.items) {
              console.log(`🏭 Provider count: ${data.items.length}`);
              data.items.forEach((provider: any, index: number) => {
                console.log(
                  `   Provider ${index + 1}: ${provider.metadata?.name} (${provider.spec?.type})`,
                );
              });
            }
          })
          .catch(() => console.log('Could not parse provider response'));
      }

      if (url.includes('forklift') || url.includes('authorization.k8s.io')) {
        console.log(`📨 RESPONSE: ${status} ${url}`);

        // EXTRA: Check provider responses specifically
        if (url.includes('/providers') && !url.includes('/providers/test-')) {
          console.log('🏭 PROVIDER LIST RESPONSE:', response.status());

          // Try to get response body for provider list
          void response
            .json()
            .then((data: any) => {
              console.log('🏭 PROVIDER LIST DATA:', JSON.stringify(data, null, 2));
            })
            .catch(() => console.log('Could not parse provider list response'));
        }
      }
    });

    console.log('🔧 Setting up API intercepts...');
    await setupCreatePlanIntercepts(page);
    console.log('✅ API intercepts setup complete');

    console.log('🧭 Navigating to Plans page...');
    const plansPage = new PlansListPage(page);
    await plansPage.navigateFromMainMenu();
    console.log('✅ Navigation complete');

    // Immediate debugging after navigation
    console.log('🔍 IMMEDIATE POST-NAVIGATION CHECK:');
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);

    // Check if we can find the button immediately
    const immediateButtonCheck = await page.getByTestId('create-plan-button').count();
    console.log(`   Button found immediately: ${immediateButtonCheck > 0}`);

    if (immediateButtonCheck > 0) {
      const immediateButtonState = await page.getByTestId('create-plan-button').evaluate((el) => {
        const element = el as HTMLElement;
        return {
          ariaDisabled: element.getAttribute('aria-disabled'),
          className: element.className,
        };
      });
      console.log(`   Immediate button state:`, immediateButtonState);
    }

    // Wait for initial page load and API calls
    console.log('⏱️ Waiting for initial API calls...');
    await page.waitForTimeout(3000);

    // Quick API call summary
    console.log('📊 QUICK API SUMMARY AFTER 3s:');
    console.log(`   SelfSubjectAccessReview calls: ${selfSubjectCalls}`);
    console.log(`   Provider calls: ${providerCalls}`);
    console.log(`   Total API calls: ${apiCalls.length}`);

    // Quick API call summary
    console.log('📊 FINAL API SUMMARY:');
    console.log(`   SelfSubjectAccessReview calls: ${selfSubjectCalls}`);
    console.log(`   Provider calls: ${providerCalls}`);
  });

  test('should enable create plan button and complete wizard navigation', async ({ page }) => {
    console.log('🎯 Starting comprehensive plan creation test...');

    const plansPage = new PlansListPage(page);

    // Wait for the page to stabilize
    console.log('⏱️ Waiting for page stabilization...');
    await page.waitForTimeout(5000);

    // DETAILED BUTTON STATE ANALYSIS
    console.log('\n🔍 === DETAILED BUTTON ANALYSIS ===');

    const button = plansPage.createPlanButton;

    // Check if button exists at all
    const buttonExists = await button.count();
    console.log(`🔲 Button element count: ${buttonExists}`);

    if (buttonExists > 0) {
      // Get detailed button properties
      const buttonProps = await button.evaluate((el) => {
        const element = el as HTMLElement;
        return {
          disabled: (element as any).disabled,
          ariaDisabled: element.getAttribute('aria-disabled'),
          className: element.className,
          textContent: element.textContent?.trim(),
          visible: element.offsetParent !== null,
          style: (element as any).style?.cssText || '',
          parentClass: element.parentElement?.className,
        };
      });

      console.log('🔲 Button properties:', JSON.stringify(buttonProps, null, 2));

      // Check if button is in viewport
      const isVisible = await button.isVisible();
      const isEnabled = await button.isEnabled();
      console.log(`🔲 Playwright checks: visible=${isVisible}, enabled=${isEnabled}`);
    } else {
      console.log('❌ Button element not found!');

      // Look for alternative button patterns
      const alternativeButtons = await page.$$('button, [role="button"]');
      console.log(`🔍 Total buttons on page: ${alternativeButtons.length}`);

      for (let i = 0; i < Math.min(alternativeButtons.length, 5); i++) {
        const text = await alternativeButtons[i].textContent();
        const testId = await alternativeButtons[i].getAttribute('data-testid');
        console.log(`   Button ${i + 1}: "${text}" (testid: ${testId})`);
      }
    }

    // Check what page state we're in
    console.log('\n🔍 === PAGE STATE ANALYSIS ===');

    // Check for empty state vs table view
    const emptyStateElements = await page.$$('[data-test*="empty"], *:has-text("No plans found")');
    const tableElements = await page.$$('table, [role="table"]');
    const planRows = await page.$$('[data-testid*="plan-row"], tr[data-testid]');

    console.log(`🏜️ Empty state elements: ${emptyStateElements.length}`);
    console.log(`📊 Table elements: ${tableElements.length}`);
    console.log(`📋 Plan rows: ${planRows.length}`);

    // Check main content
    const mainContent = await page
      .textContent('main, [role="main"], .pf-v5-c-page__main-section')
      .catch(() => '');
    const hasNoPlansText = mainContent
      ? mainContent.includes('No plans found') || mainContent.includes('no plans')
      : false;
    console.log(`📄 Page suggests empty state: ${hasNoPlansText}`);

    // Try to click the button - simplified approach
    console.log('\n🎯 === ATTEMPTING BUTTON CLICK ===');

    try {
      // Wait for button to be enabled (with reasonable timeout)
      console.log('⏱️ Waiting for button to become enabled...');
      await plansPage.createPlanButton.waitFor({ state: 'visible', timeout: 10000 });

      // Check if button is enabled
      const isEnabled = await plansPage.createPlanButton.isEnabled();
      console.log(`🔲 Button enabled: ${isEnabled}`);

      if (isEnabled) {
        console.log('✅ Button is enabled! Clicking...');
        await plansPage.clickCreatePlanButton();
        console.log('✅ Create plan button clicked');

        console.log('📝 Waiting for wizard to load...');
        const wizardPage = new CreatePlanWizardPage(page);
        await wizardPage.waitForWizardLoad();
        console.log('✅ Test completed - button worked and wizard loaded!');
      } else {
        console.log('❌ Button is visible but not enabled');
        console.log('📊 API Summary:');
        console.log(`   SelfSubjectAccessReview calls: ${selfSubjectCalls}`);
        console.log(`   Provider calls: ${providerCalls}`);
        console.log(`   Total API calls: ${apiCalls.length}`);

        throw new Error('Button found but not enabled after waiting');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log('❌ Error during button interaction:', errorMessage);
      console.log('📊 API Summary:');
      console.log(`   SelfSubjectAccessReview calls: ${selfSubjectCalls}`);
      console.log(`   Provider calls: ${providerCalls}`);
      console.log(`   Total API calls: ${apiCalls.length}`);

      throw error;
    }
  });
});
