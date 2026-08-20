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
      await expect(detailsTab.diskDecryptionDetailItem().getByRole('link')).toContainText(
        testData.planName,
      );
    });

    await test.step('Open edit modal and verify existing secret is pre-selected', async () => {
      const { detailsTab } = new PlanDetailsPage(page);
      await detailsTab.clickEditDiskDecryption();
      await expect(detailsTab.editDiskDecryptionModal).toBeVisible();
      await expect(page.getByTestId('edit-use-existing-secret-radio')).toBeChecked();
      await expect(page.getByTestId('edit-use-passphrases-radio')).toBeVisible();
      await expect(page.getByTestId('edit-luks-secret-select')).toBeVisible();
      await expect(page.getByTestId('edit-luks-secret-select').getByRole('combobox')).toHaveValue(
        'luks-test-secret',
      );
      await expect(detailsTab.saveDiskDecryptionButton).toBeEnabled();
    });

    await test.step('Toggle between modes and verify state preservation', async () => {
      await page.getByTestId('edit-use-existing-secret-radio').click();
      await expect(page.getByTestId('edit-luks-secret-select')).toBeVisible();
      await page.getByTestId('edit-use-passphrases-radio').click();
      await expect(page.getByTestId('edit-luks-secret-select')).not.toBeVisible();
      await page.getByTestId('edit-use-existing-secret-radio').click();
      await expect(page.getByTestId('edit-luks-secret-select')).toBeVisible();
    });

    await test.step('Save passphrases and reopen to confirm existing-secret mode is cleared', async () => {
      const { detailsTab } = new PlanDetailsPage(page);
      await page.getByTestId('edit-use-passphrases-radio').click();
      await expect(page.getByTestId('edit-luks-secret-select')).not.toBeVisible();
      await expect(detailsTab.saveDiskDecryptionButton).toBeEnabled();
      await detailsTab.saveDiskDecryptionButton.click();
      await expect(detailsTab.editDiskDecryptionModal).not.toBeVisible();

      await detailsTab.clickEditDiskDecryption();
      await expect(detailsTab.editDiskDecryptionModal).toBeVisible();
      await expect(page.getByTestId('edit-use-passphrases-radio')).toBeChecked();
      await expect(page.getByTestId('edit-luks-secret-select')).not.toBeVisible();
    });
  });
});
