import { providerOnlyFixtures as test } from '../../../fixtures/resourceFixtures';
import { CreatePlanWizardPage } from '../../../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { PlanDetailsPage } from '../../../page-objects/PlanDetailsPage/PlanDetailsPage';
import {
  createPlanTestData,
  GUEST_TYPE_LABELS,
  type PlanTestData,
  SCRIPT_TYPE_LABELS,
  type ScriptConfig,
} from '../../../types/test-data';
import { disableGuidedTour } from '../../../utils/utils';
import { V2_12_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

const LINUX_FIRSTBOOT_SCRIPT: ScriptConfig = {
  content: '#!/bin/bash\necho "firstboot setup"\nsystemctl enable my-service',
  guestType: 'linux',
  name: 'linux-setup',
  scriptType: 'firstboot',
};

const WINDOWS_FIRSTBOOT_SCRIPT: ScriptConfig = {
  content: 'REM Windows firstboot\nnet user admin P@ssw0rd /add',
  guestType: 'windows',
  name: 'win-setup',
  scriptType: 'firstboot',
};

const UPDATED_SCRIPT: ScriptConfig = {
  content: '#!/bin/bash\necho "updated script"\nexit 0',
  guestType: 'linux',
  name: 'updated-script',
  scriptType: 'run',
};

test.describe('Plan Customization Scripts', { tag: '@downstream' }, () => {
  requireVersion(test, V2_12_0);

  test('should create plan with new customization scripts and verify on Automation tab', async ({
    page,
    testProvider,
    resourceManager,
  }) => {
    await disableGuidedTour(page);

    const testData: PlanTestData = createPlanTestData({
      customizationScripts: {
        mode: 'new',
        scripts: [LINUX_FIRSTBOOT_SCRIPT, WINDOWS_FIRSTBOOT_SCRIPT],
      },
      sourceProvider: testProvider?.metadata?.name ?? '',
    });
    resourceManager.addPlan(testData.planName, testData.planProject);

    const wizard = new CreatePlanWizardPage(page, resourceManager);
    const planDetailsPage = new PlanDetailsPage(page);

    await test.step('Navigate to Customization Scripts step in wizard', async () => {
      await wizard.navigate();
      await wizard.waitForWizardLoad();
      await wizard.navigateToCustomizationScriptsStep(testData);
      await wizard.customizationScripts.verifyStepVisible();
    });

    await test.step('Configure customization scripts', async () => {
      await wizard.customizationScripts.fillAndComplete({
        mode: 'new',
        scripts: [LINUX_FIRSTBOOT_SCRIPT, WINDOWS_FIRSTBOOT_SCRIPT],
      });
    });

    await test.step('Verify scripts in review step', async () => {
      await wizard.clickNext(); // Scripts -> Hooks
      await wizard.clickNext(); // Hooks -> Review
      await wizard.review.verifyStepVisible();
      await wizard.review.verifyCustomScriptsSection({
        mode: 'new',
        scripts: [LINUX_FIRSTBOOT_SCRIPT, WINDOWS_FIRSTBOOT_SCRIPT],
      });
    });

    await test.step('Create plan', async () => {
      await wizard.clickNext();
      await wizard.waitForPlanCreation();
      await disableGuidedTour(page);
    });

    await test.step('Navigate to Automation tab and verify scripts', async () => {
      await planDetailsPage.verifyPlanTitle(testData.planName);
      await planDetailsPage.automationTab.navigateToAutomationTab();
      await planDetailsPage.automationTab.verifyConfigMapLink();
      await planDetailsPage.automationTab.verifyScriptDetails(
        LINUX_FIRSTBOOT_SCRIPT.name,
        GUEST_TYPE_LABELS[LINUX_FIRSTBOOT_SCRIPT.guestType!],
        SCRIPT_TYPE_LABELS[LINUX_FIRSTBOOT_SCRIPT.scriptType!],
      );
      await planDetailsPage.automationTab.verifyScriptDetails(
        WINDOWS_FIRSTBOOT_SCRIPT.name,
        GUEST_TYPE_LABELS[WINDOWS_FIRSTBOOT_SCRIPT.guestType!],
        SCRIPT_TYPE_LABELS[WINDOWS_FIRSTBOOT_SCRIPT.scriptType!],
      );
    });

    await test.step('Edit scripts via Edit modal', async () => {
      await planDetailsPage.automationTab.verifyEditButtonVisible();
      await planDetailsPage.automationTab.replaceScripts([UPDATED_SCRIPT]);
    });

    await test.step('Verify updated scripts on Automation tab', async () => {
      await planDetailsPage.automationTab.verifyScriptDetails(
        UPDATED_SCRIPT.name,
        GUEST_TYPE_LABELS[UPDATED_SCRIPT.guestType!],
        SCRIPT_TYPE_LABELS[UPDATED_SCRIPT.scriptType!],
      );
    });
  });

  test('should create plan without scripts and show empty state on Automation tab', async ({
    page,
    testProvider,
    resourceManager,
  }) => {
    await disableGuidedTour(page);

    const testData: PlanTestData = createPlanTestData({
      sourceProvider: testProvider?.metadata?.name ?? '',
    });
    resourceManager.addPlan(testData.planName, testData.planProject);

    const wizard = new CreatePlanWizardPage(page, resourceManager);
    const planDetailsPage = new PlanDetailsPage(page);

    await test.step('Create plan without customization scripts', async () => {
      await wizard.navigate();
      await wizard.waitForWizardLoad();
      await wizard.fillAndSubmit(testData);
      await disableGuidedTour(page);
    });

    await test.step('Navigate to Automation tab and verify empty state', async () => {
      await planDetailsPage.verifyPlanTitle(testData.planName);
      await planDetailsPage.automationTab.navigateToAutomationTab();
      await planDetailsPage.automationTab.verifyNoScripts();
    });
  });

  test('should navigate back from Review to edit Customization Scripts', async ({
    page,
    testProvider,
    resourceManager,
  }) => {
    await disableGuidedTour(page);

    const testData: PlanTestData = createPlanTestData({
      customizationScripts: {
        mode: 'new',
        scripts: [LINUX_FIRSTBOOT_SCRIPT],
      },
      sourceProvider: testProvider?.metadata?.name ?? '',
    });
    resourceManager.addPlan(testData.planName, testData.planProject);

    const wizard = new CreatePlanWizardPage(page, resourceManager);

    await test.step('Navigate through wizard to Review', async () => {
      await wizard.navigate();
      await wizard.waitForWizardLoad();
      await wizard.navigateToCustomizationScriptsStep(testData);
      await wizard.customizationScripts.fillAndComplete({
        mode: 'new',
        scripts: [LINUX_FIRSTBOOT_SCRIPT],
      });
      await wizard.clickNext(); // Scripts -> Hooks
      await wizard.clickNext(); // Hooks -> Review
      await wizard.review.verifyStepVisible();
    });

    await test.step('Navigate back to Customization Scripts step', async () => {
      await wizard.clickBack(); // Review -> Hooks
      await wizard.clickBack(); // Hooks -> Automation
      await wizard.customizationScripts.verifyStepVisible();
    });

    await test.step('Modify script and return to Review', async () => {
      const nameInput = page.getByTestId('script-name-0');
      await nameInput.clear();
      await nameInput.fill('modified-script');

      await wizard.clickNext(); // Automation -> Hooks
      await wizard.clickNext(); // Hooks -> Review
      await wizard.review.verifyStepVisible();
      await wizard.review.verifyCustomScriptsSection({
        mode: 'new',
        scripts: [{ ...LINUX_FIRSTBOOT_SCRIPT, name: 'modified-script' }],
      });
    });

    await test.step('Create plan and verify', async () => {
      await wizard.clickNext();
      await wizard.waitForPlanCreation();
      await disableGuidedTour(page);

      const planDetailsPage = new PlanDetailsPage(page);
      await planDetailsPage.verifyPlanTitle(testData.planName);
      await planDetailsPage.automationTab.navigateToAutomationTab();
      await planDetailsPage.automationTab.verifyScriptVisible('modified-script');
    });
  });
});
