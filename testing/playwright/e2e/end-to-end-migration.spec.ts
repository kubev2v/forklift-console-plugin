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

    // Track ALL API calls with enhanced logging
    const apiCalls = [];
    let selfSubjectCalls = 0;
    let providerCalls = 0;

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
          void response.json().then((data: any) => {
            console.log('🏭 PROVIDER LIST DATA:', JSON.stringify(data, null, 2));
          }).catch(() => console.log('Could not parse provider list response'));
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

    // API CALLS SUMMARY
    console.log('\n📊 === API CALLS SUMMARY ===');
    console.log(`Total SelfSubjectAccessReview calls: ${selfSubjectCalls}`);
    console.log(`Total Provider calls: ${providerCalls}`);
    console.log(`Total tracked API calls: ${apiCalls.length}`);

    if (selfSubjectCalls === 0) {
      console.log('❌ NO SelfSubjectAccessReview calls - This is why canCreate might be false!');
    }

    if (providerCalls === 0) {
      console.log('❌ NO Provider calls - This is why useHasSufficientProviders might not work!');
    }

    // Wait a bit more for any delayed API calls
    console.log('\n⏱️ Waiting for potential delayed API calls...');
    await page.waitForTimeout(2000);

    // Final button state check
    console.log('\n🎯 === FINAL BUTTON STATE CHECK ===');
    if (buttonExists > 0) {
      const finalButtonState = await button.evaluate((el) => {
        const element = el as HTMLElement;
        const disabled = (element as any).disabled;
        const ariaDisabled = element.getAttribute('aria-disabled');
        return {
          disabled,
          ariaDisabled,
          enabled: !disabled && ariaDisabled !== 'true',
        };
      });

      console.log('🔲 Final button state:', finalButtonState);

      if (!finalButtonState.enabled) {
        console.log('❌ Button is still disabled - checking why...');
        console.log('   - Check SelfSubjectAccessReview calls and responses above');
        console.log('   - Check Provider calls and responses above');
        console.log(
          '   - Button might be in empty state where useHasSufficientProviders prevents rendering',
        );
      }
    }

    console.log('\n🎯 Attempting to assert button is enabled...');

    // Only proceed if button is actually enabled, otherwise show debug info
    if (buttonExists > 0) {
      const finalButtonState = await button.evaluate((el) => {
        const element = el as HTMLElement;
        const disabled = (element as any).disabled;
        const ariaDisabled = element.getAttribute('aria-disabled');
        return {
          disabled,
          ariaDisabled,
          enabled: !disabled && ariaDisabled !== 'true',
        };
      });

      if (finalButtonState.enabled) {
        await plansPage.assertCreatePlanButtonEnabled();
        console.log('✅ Create plan button is enabled!');

        console.log('🖱️ Clicking create plan button...');
        await plansPage.clickCreatePlanButton();
        console.log('✅ Create plan button clicked');

        console.log('📝 Waiting for wizard to load...');
        const wizardPage = new CreatePlanWizardPage(page);
        await wizardPage.waitForWizardLoad();
        console.log('✅ Test completed - button worked and wizard loaded!');
      } else {
        console.log('❌ BUTTON IS DISABLED - DETAILED ANALYSIS:');
        console.log('   Button state:', finalButtonState);
        console.log('   This means either:');
        console.log('   1. SelfSubjectAccessReview failed (canCreate = false)');
        console.log('   2. Provider calls failed (useHasSufficientProviders = false)');
        console.log('   3. Both hooks failed');
        console.log('\n📊 CHECK THE API CALLS SUMMARY ABOVE TO SEE WHICH FAILED');

        // Force test failure with clear message
        throw new Error(
          `Button is disabled: disabled=${finalButtonState.disabled}, aria-disabled=${finalButtonState.ariaDisabled}. Check logs above for API call details.`,
        );
      }
    } else {
      console.log('❌ BUTTON NOT FOUND');
      throw new Error('Create plan button not found on the page');
    }
  });

  test('should run plan creation wizard', async ({ page }) => {
    console.log('🎯 Starting plan creation wizard test...');

    const plansPage = new PlansListPage(page);

    console.log('🔍 Checking create plan button state...');

    // Log button attributes before assertion
    const button = plansPage.createPlanButton;
    const isVisible = await button.isVisible();
    const isEnabled = await button.isEnabled();
    const ariaDisabled = await button.getAttribute('aria-disabled');

    console.log(
      '🔲 Button visible: ' +
        isVisible +
        ' enabled: ' +
        isEnabled +
        ' ariaDisabled: ' +
        ariaDisabled,
    );

    // Wait a bit to ensure all API calls have completed
    await page.waitForTimeout(2000);
    console.log('⏱️ Waited 2s for API calls to complete');

    // Check button state again after waiting
    const isEnabledAfterWait = await button.isEnabled();
    const ariaDisabledAfterWait = await button.getAttribute('aria-disabled');

    console.log(
      '🔲 Button after wait - enabled: ' +
        isEnabledAfterWait +
        ' ariaDisabled: ' +
        ariaDisabledAfterWait,
    );

    // Add detailed debugging - check what URL patterns we're seeing
    console.log('🔍 Checking what API calls were made...');

    // Let's add a diagnostic helper - navigate to different parts to trigger more API calls
    console.log('🔍 Clicking on main navigation to see if namespace changes...');
    await page.waitForTimeout(1000);

    console.log('🎯 Attempting to assert button is enabled...');
    await plansPage.assertCreatePlanButtonEnabled();
    console.log('✅ Create plan button is enabled!');

    console.log('🖱️ Clicking create plan button...');
    await plansPage.clickCreatePlanButton();
    console.log('✅ Create plan button clicked');

    console.log('📝 Waiting for wizard to load...');
    const wizardPage = new CreatePlanWizardPage(page);
    await wizardPage.waitForWizardLoad();
    console.log('✅ Test completed - button worked and wizard loaded!');
  });
});
