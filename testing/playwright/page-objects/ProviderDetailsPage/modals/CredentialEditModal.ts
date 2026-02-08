import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Page object for the Edit Provider Credentials modal.
 * Supports vSphere provider credential editing including username, password,
 * and certificate validation options.
 */
export class CredentialEditModal {
  readonly caCertificateClearButton: Locator;
  readonly caCertificateTextarea: Locator;
  readonly caCertificateUploadButton: Locator;
  readonly cancelButton: Locator;
  readonly closeButton: Locator;
  readonly configureCertificateRadio: Locator;
  readonly modal: Locator;
  protected readonly page: Page;
  readonly passwordInput: Locator;
  readonly passwordToggleButton: Locator;
  readonly saveButton: Locator;
  readonly skipCertificateRadio: Locator;
  readonly usernameInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = this.page.getByRole('dialog');
    this.closeButton = this.modal.getByRole('button', { name: 'Close' });
    this.saveButton = this.page.getByTestId('modal-confirm-button');
    this.cancelButton = this.page.getByTestId('modal-cancel-button');

    // Credential fields
    this.usernameInput = this.page.getByTestId('vsphere-username-input');
    this.passwordInput = this.page.getByTestId('vsphere-password-input');
    this.passwordToggleButton = this.page.getByTestId('vsphere-password-input-toggle');

    // Certificate validation
    this.configureCertificateRadio = this.page.getByTestId('certificate-validation-configure');
    this.skipCertificateRadio = this.page.getByTestId('certificate-validation-skip');

    // CA certificate upload (within the data-testid container)
    const caCertificateContainer = this.page.getByTestId('ca-certificate-upload');
    this.caCertificateTextarea = caCertificateContainer.getByRole('textbox', {
      name: 'File upload',
    });
    this.caCertificateUploadButton = caCertificateContainer.getByRole('button', { name: 'Upload' });
    this.caCertificateClearButton = caCertificateContainer.getByRole('button', { name: 'Clear' });
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
    await this.waitForModalToClose();
  }

  async clearCaCertificate(): Promise<void> {
    await expect(this.caCertificateClearButton).toBeEnabled();
    await this.caCertificateClearButton.click();
  }

  async clearPassword(): Promise<void> {
    await this.passwordInput.clear();
  }

  async clearUsername(): Promise<void> {
    await this.usernameInput.clear();
  }

  async close(): Promise<void> {
    await this.closeButton.click();
    await this.waitForModalToClose();
  }

  async enterCaCertificate(certificate: string): Promise<void> {
    await this.caCertificateTextarea.fill(certificate);
  }

  async enterPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async enterUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  async getCaCertificateValue(): Promise<string> {
    return (await this.caCertificateTextarea.inputValue()) ?? '';
  }

  async getPasswordValue(): Promise<string> {
    return (await this.passwordInput.inputValue()) ?? '';
  }

  async getUsernameValue(): Promise<string> {
    return (await this.usernameInput.inputValue()) ?? '';
  }

  async isConfigureCertificateSelected(): Promise<boolean> {
    return await this.configureCertificateRadio.isChecked();
  }

  async isPasswordVisible(): Promise<boolean> {
    const type = await this.passwordInput.getAttribute('type');
    return type === 'text';
  }

  async isSkipCertificateSelected(): Promise<boolean> {
    return await this.skipCertificateRadio.isChecked();
  }

  async save(): Promise<void> {
    await expect(this.saveButton).toBeEnabled();
    await this.saveButton.click();
    await this.waitForModalToClose();
    // Wait for backend to process the change
    await this.page.waitForTimeout(500);
  }

  async selectConfigureCertificate(): Promise<void> {
    await this.configureCertificateRadio.click();
    // Wait for CA certificate section to appear
    await expect(this.caCertificateTextarea).toBeVisible();
  }

  async selectSkipCertificate(): Promise<void> {
    await this.skipCertificateRadio.click();
  }

  async togglePasswordVisibility(): Promise<void> {
    await this.passwordToggleButton.click();
  }

  async verifyCaCertificateClearButtonDisabled(): Promise<void> {
    await expect(this.caCertificateClearButton).toBeDisabled();
  }

  async verifyCaCertificateClearButtonEnabled(): Promise<void> {
    await expect(this.caCertificateClearButton).toBeEnabled();
  }

  async verifyCaCertificateInvalid(): Promise<void> {
    const errorText = this.page.getByTestId('ca-certificate-helper-error');
    await expect(errorText).toContainText('The CA certificate is not valid.');
  }

  async verifyCaCertificateRequired(): Promise<void> {
    const errorText = this.page.getByTestId('ca-certificate-helper-error');
    await expect(errorText).toContainText(
      'CA certificate is required when certificate validation is configured',
    );
  }

  async verifyCaCertificateSectionHidden(): Promise<void> {
    await expect(this.caCertificateTextarea).not.toBeVisible();
  }

  async verifyCaCertificateSectionVisible(): Promise<void> {
    await expect(this.caCertificateTextarea).toBeVisible();
  }

  async verifyModalStructure(): Promise<void> {
    await this.verifyModalTitle();
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.configureCertificateRadio).toBeVisible();
    await expect(this.skipCertificateRadio).toBeVisible();
    await expect(this.saveButton).toBeVisible();
    await expect(this.cancelButton).toBeVisible();
  }

  async verifyModalTitle(): Promise<void> {
    await expect(
      this.modal.getByRole('heading', { name: 'Edit provider credentials' }),
    ).toBeVisible();
  }

  async verifyPasswordHideButton(): Promise<void> {
    await expect(this.passwordToggleButton).toHaveAttribute('aria-label', 'Password hide');
  }

  async verifyPasswordShowButton(): Promise<void> {
    await expect(this.passwordToggleButton).toHaveAttribute('aria-label', 'Password show');
  }

  async verifySaveButtonDisabled(): Promise<void> {
    await expect(this.saveButton).toBeDisabled();
  }

  async verifySaveButtonEnabled(): Promise<void> {
    await expect(this.saveButton).toBeEnabled();
  }

  async verifyUsernameRequired(): Promise<void> {
    const errorText = this.page.getByTestId('vsphere-username-input-helper-error');
    await expect(errorText).toContainText('Username is required');
  }

  async waitForModalToClose(): Promise<void> {
    await expect(this.modal).not.toBeVisible();
  }

  async waitForModalToOpen(): Promise<void> {
    await expect(this.modal).toBeVisible();
    await this.verifyModalTitle();
  }
}
