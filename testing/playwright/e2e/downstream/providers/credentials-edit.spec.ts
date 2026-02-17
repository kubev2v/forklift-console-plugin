import { expect } from '@playwright/test';

import { providerOnlyFixtures as test } from '../../../fixtures/resourceFixtures';
import { ProviderDetailsPage } from '../../../page-objects/ProviderDetailsPage/ProviderDetailsPage';
import { MTV_NAMESPACE } from '../../../utils/resource-manager/constants';
import { V2_11_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

test.describe('Provider Credentials - Editing', { tag: '@downstream' }, () => {
  requireVersion(test, V2_11_0);

  test('should test credential editing interactions', async ({ page, testProvider }) => {
    const providerDetailsPage = new ProviderDetailsPage(page);
    await providerDetailsPage.navigate(testProvider!.metadata.name, MTV_NAMESPACE);
    await providerDetailsPage.waitForReadyStatus();

    const { credentialsTab } = providerDetailsPage;

    await test.step('Navigate to credentials tab and verify masked values', async () => {
      await credentialsTab.navigateToCredentialsTab();
      await credentialsTab.verifyTabIsActive();
      await credentialsTab.verifyCredentialsAreMasked();
      await credentialsTab.verifyRevealValuesButtonVisible();
    });

    await test.step('Reveal credentials and verify displayed values', async () => {
      await credentialsTab.clickRevealValues();
      await credentialsTab.verifyCredentialsAreRevealed();
      await credentialsTab.verifyHideValuesButtonVisible();
      await credentialsTab.verifyCopyButtonsVisible();
    });

    await test.step('Hide credentials and verify masked again', async () => {
      await credentialsTab.clickHideValues();
      await credentialsTab.verifyCredentialsAreMasked();
      await credentialsTab.verifyRevealValuesButtonVisible();
    });

    await test.step('Open edit modal and verify structure', async () => {
      await credentialsTab.clickRevealValues();
      const modal = await credentialsTab.openEditModal();
      await modal.verifyModalStructure();
      await modal.verifySaveButtonDisabled();
    });

    await test.step('Test modal close with X button', async () => {
      await credentialsTab.editModal.close();
    });

    await test.step('Test modal close with Cancel button', async () => {
      const modal = await credentialsTab.openEditModal();
      await modal.verifyModalTitle();
      await modal.cancel();
    });

    await test.step('Test username field validation', async () => {
      const modal = await credentialsTab.openEditModal();
      const originalUsername = await modal.getUsernameValue();
      expect(originalUsername).toBeTruthy();

      await modal.clearUsername();
      await modal.verifyUsernameRequired();
      await modal.verifySaveButtonDisabled();

      await modal.enterUsername('test-user@vsphere.local');
      await modal.verifySaveButtonEnabled();

      await modal.enterUsername(originalUsername);
      await modal.cancel();
    });

    await test.step('Test password field show/hide toggle', async () => {
      const modal = await credentialsTab.openEditModal();
      const originalPassword = await modal.getPasswordValue();
      expect(originalPassword).toBeTruthy();

      await modal.verifyPasswordShowButton();
      await modal.togglePasswordVisibility();
      await modal.verifyPasswordHideButton();
      await modal.togglePasswordVisibility();
      await modal.verifyPasswordShowButton();

      await modal.enterPassword('new-test-password');
      await modal.verifySaveButtonEnabled();

      await modal.enterPassword(originalPassword);
      await modal.cancel();
    });

    await test.step('Test certificate validation toggle', async () => {
      const modal = await credentialsTab.openEditModal();

      const isSkipSelected = await modal.isSkipCertificateSelected();
      const isConfigureSelected = await modal.isConfigureCertificateSelected();
      expect(isSkipSelected || isConfigureSelected).toBe(true);

      await modal.selectConfigureCertificate();
      await modal.verifyCaCertificateSectionVisible();

      const clearButton = modal.caCertificateClearButton;
      if (await clearButton.isEnabled()) {
        await modal.clearCaCertificate();
      }

      await modal.selectSkipCertificate();
      await modal.verifyCaCertificateSectionHidden();

      await modal.cancel();
    });

    await test.step('Test CA certificate input and validation', async () => {
      const modal = await credentialsTab.openEditModal();

      await modal.selectConfigureCertificate();
      await modal.verifyCaCertificateSectionVisible();

      await modal.enterCaCertificate('invalid certificate content');
      await modal.verifyCaCertificateInvalid();
      await modal.verifySaveButtonDisabled();
      await modal.verifyCaCertificateClearButtonEnabled();

      await modal.cancel();
    });

    await test.step('Verify original values preserved after cancel', async () => {
      const originalUsername = await credentialsTab.getUsernameValue();
      const originalPassword = await credentialsTab.getPasswordValue();

      const modal = await credentialsTab.openEditModal();

      await modal.enterUsername('modified-user@test.local');
      await modal.enterPassword('modified-password');

      const isSkipSelected = await modal.isSkipCertificateSelected();
      if (isSkipSelected) {
        await modal.selectConfigureCertificate();
      } else {
        await modal.selectSkipCertificate();
      }

      await modal.cancel();

      const currentUsername = await credentialsTab.getUsernameValue();
      const currentPassword = await credentialsTab.getPasswordValue();

      expect(currentUsername).toContain(originalUsername.replace('Copy to clipboard', '').trim());
      expect(currentPassword).toContain(originalPassword.replace('Copy to clipboard', '').trim());
    });
  });
});
