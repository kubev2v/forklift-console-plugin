import { providerOnlyFixtures as test } from '../../../fixtures/resourceFixtures';
import { CreatePlanWizardPage } from '../../../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { HookSource } from '../../../types/enums';
import { createPlanTestData, type PlanTestData } from '../../../types/test-data';
import { disableGuidedTour } from '../../../utils/utils';
import { V2_12_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

test.describe('Plan AAP Hooks', { tag: '@downstream' }, () => {
  requireVersion(test, V2_12_0);

  test('should display hook source radio options and switch between modes', async ({
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

    await test.step('Navigate to Hooks step', async () => {
      await wizard.navigate();
      await wizard.waitForWizardLoad();
      await wizard.navigateToHooksStep(testData);
    });

    await test.step('Verify hook source radio is visible with three options', async () => {
      await wizard.hooks.verifyStepVisible();

      const noHooksRadio = page.getByTestId('hook-source-none');
      const localRadio = page.getByTestId('hook-source-local');
      const aapRadio = page.getByTestId('hook-source-aap');

      await test.expect(noHooksRadio).toBeVisible();
      await test.expect(localRadio).toBeVisible();
      await test.expect(aapRadio).toBeVisible();
    });

    await test.step('Verify "No hooks" is selected by default', async () => {
      await test.expect(page.getByTestId('hook-source-none')).toBeChecked();
      await test.expect(page.getByTestId('preMigrationHook.enableHook-checkbox')).not.toBeVisible();
    });

    await test.step('Switch to "Local playbook" and verify local fields appear', async () => {
      await wizard.hooks.selectHookSource(HookSource.LOCAL);

      await test.expect(page.getByTestId('preMigrationHook.enableHook-checkbox')).toBeVisible();
      await test.expect(page.getByTestId('postMigrationHook.enableHook-checkbox')).toBeVisible();
    });

    await test.step('Switch to "AAP" and verify AAP section appears', async () => {
      await wizard.hooks.selectHookSource(HookSource.AAP);

      await test.expect(page.getByTestId('preMigrationHook.enableHook-checkbox')).not.toBeVisible();
      await test.expect(page.getByText('AAP is not configured')).toBeVisible();
    });

    await test.step('Verify Technology Preview badge on AAP option', async () => {
      await test.expect(page.getByText('Technology Preview')).toBeVisible();
    });

    await test.step('Switch back to "No hooks" and verify fields are hidden', async () => {
      await wizard.hooks.selectHookSource(HookSource.NONE);

      await test.expect(page.getByTestId('preMigrationHook.enableHook-checkbox')).not.toBeVisible();
      await test.expect(page.getByText('AAP is not configured')).not.toBeVisible();
    });

    await test.step('Verify review step shows AAP hook source', async () => {
      await wizard.hooks.selectHookSource(HookSource.AAP);
      await wizard.clickNext();
      await wizard.review.verifyStepVisible();
      await wizard.review.verifyHooksSection(HookSource.AAP);
    });
  });
});
