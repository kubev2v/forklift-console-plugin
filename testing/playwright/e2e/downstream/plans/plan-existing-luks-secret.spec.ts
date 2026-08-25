import { expect } from '@playwright/test';

import { createSecretObject } from '../../../fixtures/helpers/resourceCreationHelpers';
import { providerOnlyFixtures as test } from '../../../fixtures/resourceFixtures';
import { CreatePlanWizardPage } from '../../../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { PlanDetailsPage } from '../../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { createPlanTestData, type PlanTestData } from '../../../types/test-data';
import { MTV_NAMESPACE } from '../../../utils/resource-manager/constants';
import { V5_0_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

const LUKS_TEST_SECRET_NAME = 'luks-test-secret';
const LUKS_TEST_TIMEOUT_MS = 300_000;

test.describe('Plan existing LUKS secret', { tag: '@downstream' }, () => {
  requireVersion(test, V5_0_0);

  test('should select existing LUKS secret in wizard and edit from details page', async ({
    page,
    resourceManager,
    testProvider,
  }) => {
    // Wizard path creates provider resources then walks General→…→Additional settings.
    test.setTimeout(LUKS_TEST_TIMEOUT_MS);
    const testData: PlanTestData = createPlanTestData({
      additionalPlanSettings: {
        existingLUKSSecretName: LUKS_TEST_SECRET_NAME,
      },
      sourceProvider: testProvider?.metadata?.name ?? '',
    });
    resourceManager.addPlan(testData.planName, testData.planProject);

    await test.step('Ensure LUKS secret exists in plan namespace', async () => {
      const secret = createSecretObject(LUKS_TEST_SECRET_NAME, MTV_NAMESPACE, {
        '0': 'test-luks-passphrase',
      });
      const created = await resourceManager.createSecret(secret, MTV_NAMESPACE);
      if (created) {
        resourceManager.addSecret(LUKS_TEST_SECRET_NAME, MTV_NAMESPACE);
      }
    });

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
      await additionalSettings.selectExistingLUKSSecret(LUKS_TEST_SECRET_NAME);
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
      // Product copies the selected secret via generateName `${planName}-`.
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

      const secretSelect = page.getByTestId('edit-luks-secret-select');
      await expect(secretSelect).toBeVisible();
      const combobox = secretSelect.getByRole('combobox');
      // Namespace secret list + source-secret watch can take a while on busy clusters.
      await expect(combobox).not.toHaveAttribute('placeholder', 'Loading secrets...', {
        timeout: 60_000,
      });
      await expect(combobox).toHaveValue(LUKS_TEST_SECRET_NAME, { timeout: 60_000 });
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
