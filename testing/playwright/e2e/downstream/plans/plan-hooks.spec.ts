import * as fs from 'node:fs';
import * as path from 'node:path';

import { providerOnlyFixtures as test } from '../../../fixtures/resourceFixtures';
import { CreatePlanWizardPage } from '../../../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { PlanDetailsPage } from '../../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { createPlanTestData, type PlanTestData } from '../../../types/test-data';
import { disableGuidedTour } from '../../../utils/utils';
import { V2_11_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

const HOOK_RUNNER_IMAGE = 'quay.io/konveyor/hook-runner:latest';
const UPDATED_HOOK_RUNNER_IMAGE = 'quay.io/konveyor/hook-runner:v0.2.0';

const loadPlaybookFromTemplate = (templatePath: string, hookName: string): string => {
  const absolutePath = path.resolve(__dirname, '../../..', templatePath);
  const template = fs.readFileSync(absolutePath, 'utf-8');
  return template.replaceAll(/\{\{\s*hook_name\s*\}\}/g, hookName);
};

test.describe('Plan Hooks', { tag: '@downstream' }, () => {
  requireVersion(test, V2_11_0);

  test('should configure, edit, and remove hooks on plans', async ({
    page,
    testProvider,
    resourceManager,
  }) => {
    await disableGuidedTour(page);

    const testData: PlanTestData = createPlanTestData({
      sourceProvider: testProvider?.metadata?.name ?? '',
    });
    resourceManager.addPlan(testData.planName, testData.planProject);

    const preHookPlaybook = loadPlaybookFromTemplate(
      'test-assets/hook_template.yaml',
      `pre-hook-${testData.planName}`,
    );
    const postHookPlaybook = loadPlaybookFromTemplate(
      'test-assets/hook_template.yaml',
      `post-hook-${testData.planName}`,
    );

    const wizard = new CreatePlanWizardPage(page, resourceManager);
    const planDetailsPage = new PlanDetailsPage(page);

    await test.step('Navigate to Hooks step in wizard', async () => {
      await wizard.navigate();
      await wizard.waitForWizardLoad();
      await wizard.navigateToHooksStep(testData);
      await wizard.hooks.verifyStepVisible();
    });

    await test.step('Verify hook checkboxes are disabled by default', async () => {
      await wizard.hooks.verifyPreMigrationHookDisabled();
      await wizard.hooks.verifyPostMigrationHookDisabled();
    });

    await test.step('Verify pre-migration hook toggle shows/hides fields', async () => {
      await wizard.hooks.enablePreMigrationHook();
      await wizard.hooks.verifyPreMigrationHookEnabled();
      await wizard.hooks.disablePreMigrationHook();
      await wizard.hooks.verifyPreMigrationHookDisabled();
    });

    await test.step('Verify post-migration hook toggle shows/hides fields', async () => {
      await wizard.hooks.enablePostMigrationHook();
      await wizard.hooks.verifyPostMigrationHookEnabled();
      await wizard.hooks.disablePostMigrationHook();
      await wizard.hooks.verifyPostMigrationHookDisabled();
    });

    await test.step('Configure pre-migration hook', async () => {
      await wizard.hooks.configurePreMigrationHook({
        enabled: true,
        hookRunnerImage: HOOK_RUNNER_IMAGE,
        ansiblePlaybook: preHookPlaybook,
      });
    });

    await test.step('Configure post-migration hook', async () => {
      await wizard.hooks.configurePostMigrationHook({
        enabled: true,
        hookRunnerImage: HOOK_RUNNER_IMAGE,
        ansiblePlaybook: postHookPlaybook,
      });
    });

    await test.step('Verify hooks in review step', async () => {
      await wizard.clickNext();
      await wizard.review.verifyStepVisible();
      await wizard.review.verifyHooksSection();
    });

    await test.step('Create plan', async () => {
      await wizard.clickNext();
      await wizard.waitForPlanCreation();
      await disableGuidedTour(page);
    });

    await test.step('Navigate to Hooks tab and verify hooks are configured', async () => {
      await planDetailsPage.verifyPlanTitle(testData.planName);
      await planDetailsPage.hooksTab.navigateToHooksTab();
      await planDetailsPage.hooksTab.verifyPreMigrationHookEnabled(true);
      await planDetailsPage.hooksTab.verifyPostMigrationHookEnabled(true);
      await planDetailsPage.hooksTab.verifyHookRunnerImage('pre', HOOK_RUNNER_IMAGE);
      await planDetailsPage.hooksTab.verifyHookRunnerImage('post', HOOK_RUNNER_IMAGE);
    });

    await test.step('Edit pre-migration hook with new image', async () => {
      await planDetailsPage.hooksTab.openPreMigrationHookEditModal();
      await planDetailsPage.hooksTab.hookEditModal.setHookRunnerImage(UPDATED_HOOK_RUNNER_IMAGE);
      await planDetailsPage.hooksTab.hookEditModal.save();
      await planDetailsPage.hooksTab.verifyHookRunnerImage('pre', UPDATED_HOOK_RUNNER_IMAGE);
    });

    await test.step('Remove pre-migration hook', async () => {
      await planDetailsPage.hooksTab.removePreMigrationHook();
      await planDetailsPage.hooksTab.verifyPreMigrationHookEnabled(false);
    });

    await test.step('Remove post-migration hook', async () => {
      await planDetailsPage.hooksTab.removePostMigrationHook();
      await planDetailsPage.hooksTab.verifyPostMigrationHookEnabled(false);
    });

    await test.step('Re-add pre-migration hook via edit modal', async () => {
      await planDetailsPage.hooksTab.editPreMigrationHook({
        enabled: true,
        hookRunnerImage: HOOK_RUNNER_IMAGE,
      });
      await planDetailsPage.hooksTab.verifyPreMigrationHookEnabled(true);
      await planDetailsPage.hooksTab.verifyHookRunnerImage('pre', HOOK_RUNNER_IMAGE);
    });
  });
});
