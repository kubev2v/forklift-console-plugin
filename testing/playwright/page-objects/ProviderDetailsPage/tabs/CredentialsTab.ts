import { expect, type Locator, type Page } from '@playwright/test';

import { CredentialEditModal } from '../modals/CredentialEditModal';

/** Pattern to match masked credential values (5+ asterisks) */
const MASKED_PATTERN = /\*{5,}/;

/**
 * Page object for the Provider Credentials tab.
 * Handles reveal/hide values, copy to clipboard, and opening the edit modal.
 */
export class CredentialsTab {
  readonly caCertificateField: Locator;
  readonly credentialsTab: Locator;
  readonly editButton: Locator;
  readonly editModal: CredentialEditModal;
  protected readonly page: Page;
  readonly passwordCopyButton: Locator;
  readonly passwordValue: Locator;
  readonly revealHideButton: Locator;
  readonly skipCertificateField: Locator;
  readonly usernameCopyButton: Locator;
  readonly usernameValue: Locator;

  constructor(page: Page) {
    this.page = page;
    this.editModal = new CredentialEditModal(page);

    this.credentialsTab = this.page.getByRole('tab', { name: 'Credentials' });

    this.editButton = this.page.getByTestId('credentials-edit-button');
    this.revealHideButton = this.page.getByTestId('credentials-reveal-button');

    this.caCertificateField = this.page.getByTestId('credential-cacert');
    this.skipCertificateField = this.page.getByTestId('credential-insecureSkipVerify');
    this.passwordValue = this.page.getByTestId('credential-password');
    this.usernameValue = this.page.getByTestId('credential-user');

    this.passwordCopyButton = this.passwordValue.getByRole('button', { name: 'Copy to clipboard' });
    this.usernameCopyButton = this.usernameValue.getByRole('button', { name: 'Copy to clipboard' });
  }

  async clickHideValues(): Promise<void> {
    await this.revealHideButton.click();
    await expect(this.revealHideButton).toContainText('Reveal values');
  }

  async clickRevealValues(): Promise<void> {
    await this.revealHideButton.click();
    await expect(this.revealHideButton).toContainText('Hide values');
  }

  async getCaCertificateValue(): Promise<string> {
    return (await this.caCertificateField.textContent()) ?? '';
  }

  async getPasswordValue(): Promise<string> {
    return (await this.passwordValue.textContent()) ?? '';
  }

  async getSkipCertificateValue(): Promise<string> {
    return (await this.skipCertificateField.textContent()) ?? '';
  }

  async getUsernameValue(): Promise<string> {
    return (await this.usernameValue.textContent()) ?? '';
  }

  async navigateToCredentialsTab(): Promise<void> {
    await this.credentialsTab.click();
    await expect(this.credentialsTab).toHaveAttribute('aria-selected', 'true');
    await this.page.waitForLoadState('networkidle');
  }

  async openEditModal(): Promise<CredentialEditModal> {
    await expect(this.editButton).toBeEnabled();
    await this.editButton.click();
    await this.editModal.waitForModalToOpen();
    return this.editModal;
  }

  async revealAndOpenEditModal(): Promise<CredentialEditModal> {
    const buttonText = await this.revealHideButton.textContent();
    if (buttonText?.includes('Reveal values')) {
      await this.clickRevealValues();
    }
    return this.openEditModal();
  }

  async verifyCopyButtonsHidden(): Promise<void> {
    await expect(this.passwordCopyButton).not.toBeVisible();
    await expect(this.usernameCopyButton).not.toBeVisible();
  }

  async verifyCopyButtonsVisible(): Promise<void> {
    await expect(this.passwordCopyButton).toBeVisible();
    await expect(this.usernameCopyButton).toBeVisible();
  }

  async verifyCredentialsAreMasked(): Promise<void> {
    await expect(this.caCertificateField).toHaveText(MASKED_PATTERN);
    await expect(this.skipCertificateField).toHaveText(MASKED_PATTERN);
    await expect(this.passwordValue).toHaveText(MASKED_PATTERN);
    await expect(this.usernameValue).toHaveText(MASKED_PATTERN);
  }

  async verifyCredentialsAreRevealed(): Promise<void> {
    await expect(this.passwordValue).not.toHaveText(MASKED_PATTERN);
    await expect(this.usernameValue).not.toHaveText(MASKED_PATTERN);
  }

  async verifyEditButtonDisabled(): Promise<void> {
    await expect(this.editButton).toBeDisabled();
  }

  async verifyEditButtonEnabled(): Promise<void> {
    await expect(this.editButton).toBeEnabled();
  }

  async verifyHideValuesButtonVisible(): Promise<void> {
    await expect(this.revealHideButton).toContainText('Hide values');
  }

  async verifyRevealValuesButtonVisible(): Promise<void> {
    await expect(this.revealHideButton).toContainText('Reveal values');
  }

  async verifyTabIsActive(): Promise<void> {
    await expect(this.credentialsTab).toHaveAttribute('aria-selected', 'true');
  }
}
