import { providerOnlyFixtures as test } from '../../../fixtures/resourceFixtures';
import { CreatePlanWizardPage } from '../../../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { createPlanTestData, type PlanTestData } from '../../../types/test-data';
import { disableGuidedTour } from '../../../utils/utils';
import { V2_11_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

test.describe('Plan AAP Hooks', { tag: '@downstream' }, () => {
  requireVersion(test, V2_11_0);

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
      const noHooksRadio = page.getByTestId('hook-source-none');
      const localRadio = page.getByTestId('hook-source-local');
      const aapRadio = page.getByTestId('hook-source-aap');

      await noHooksRadio.waitFor({ state: 'visible' });
      await localRadio.waitFor({ state: 'visible' });
      await aapRadio.waitFor({ state: 'visible' });
    });

    await test.step('Verify "No hooks" is selected by default', async () => {
      const noHooksRadio = page.getByTestId('hook-source-none');
      await test.expect(noHooksRadio).toBeChecked();

      await test.expect(page.getByTestId('preMigrationHook.enableHook-checkbox')).not.toBeVisible();
    });

    await test.step('Switch to "Local playbook" and verify local fields appear', async () => {
      await page.getByTestId('hook-source-local').click();

      await test.expect(page.getByTestId('preMigrationHook.enableHook-checkbox')).toBeVisible();
      await test.expect(page.getByTestId('postMigrationHook.enableHook-checkbox')).toBeVisible();
    });

    await test.step('Switch to "AAP" and verify AAP section appears', async () => {
      await page.getByTestId('hook-source-aap').click();

      await test.expect(page.getByTestId('preMigrationHook.enableHook-checkbox')).not.toBeVisible();
    });

    await test.step('Switch back to "No hooks" and verify fields are hidden', async () => {
      await page.getByTestId('hook-source-none').click();

      await test.expect(page.getByTestId('preMigrationHook.enableHook-checkbox')).not.toBeVisible();
    });
  });
});
