import { expect } from '@playwright/test';

import { providerOnlyFixtures as test } from '../../../fixtures/resourceFixtures';
import { CreatePlanWizardPage } from '../../../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { PlanDetailsPage } from '../../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { createPlanTestData, type PlanTestData } from '../../../types/test-data';
import { V5_0_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

test.describe('Plan existing LUKS secret', { tag: '@downstream' }, () => {
  requireVersion(test, V5_0_0);

  test('should select existing LUKS secret in wizard and edit from details page', async ({
    page,
    testProvider,
    resourceManager,
  }) => {
    const testData: PlanTestData = createPlanTestData({
      sourceProvider: testProvider?.metadata?.name ?? '',
      additionalPlanSettings: {
        existingLUKSSecretName: 'luks-test-secret',
      },
    });
    resourceManager.addPlan(testData.planName, testData.planProject);

    const wizard = new CreatePlanWizardPage(page, resourceManager);

    await test.step('Navigate to Additional Settings step', async () => {
      await wizard.navigate();
      await wizard.waitForWizardLoad();
      await wizard.navigateToAdditionalSettings(testData);
    });

    const { additionalSettings } = wizard;

    await test.step('Verify radio toggle is visible and select existing secret', async () => {
      await additionalSettings.verifyStepVisible();
      await expect(additionalSettings.existingSecretRadio).toBeVisible();
      await expect(additionalSettings.newPassphrasesRadio).toBeVisible();
      await additionalSettings.selectExistingLUKSSecret('luks-test-secret');
    });

    await test.step('Verify review step shows the secret name', async () => {
      await wizard.clickSkipToReview();
      await wizard.review.verifyReviewStep(testData);
    });

    await test.step('Create plan and verify details page', async () => {
      await wizard.clickNext();
      await wizard.waitForPlanCreation();

      const { detailsTab } = new PlanDetailsPage(page);
      await detailsTab.navigateToDetailsTab();
      await expect(detailsTab.diskDecryptionDetailItem()).toBeVisible();
      await expect(detailsTab.diskDecryptionDetailItem()).toContainText('luks-test-secret');
    });

    await test.step('Open edit modal and verify radio toggle', async () => {
      const { detailsTab } = new PlanDetailsPage(page);
      await detailsTab.clickEditDiskDecryption();
      await expect(detailsTab.editDiskDecryptionModal).toBeVisible();
      await expect(page.getByTestId('edit-use-existing-secret-radio')).toBeVisible();
      await expect(page.getByTestId('edit-use-passphrases-radio')).toBeVisible();
    });

    await test.step('Toggle between modes and verify state preservation', async () => {
      await page.getByTestId('edit-use-existing-secret-radio').click();
      await expect(page.getByTestId('edit-luks-secret-select')).toBeVisible();
      await page.getByTestId('edit-use-passphrases-radio').click();
      await expect(page.getByTestId('edit-luks-secret-select')).not.toBeVisible();
      await page.getByTestId('edit-use-existing-secret-radio').click();
      await expect(page.getByTestId('edit-luks-secret-select')).toBeVisible();
    });

    await test.step('Close modal without saving', async () => {
      const { detailsTab } = new PlanDetailsPage(page);
      await detailsTab.editDiskDecryptionModal.getByTestId('modal-cancel-button').click();
      await expect(detailsTab.editDiskDecryptionModal).not.toBeVisible();
    });
  });
});
