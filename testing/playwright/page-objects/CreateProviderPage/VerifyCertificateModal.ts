import { expect, type Locator, type Page } from '@playwright/test';

import { BaseModal } from '../common/BaseModal';

export class VerifyCertificateModal extends BaseModal {
  readonly closeButton: Locator;
  readonly expirationDate: Locator;
  readonly fingerprint: Locator;
  readonly issuer: Locator;
  readonly trustCheckbox: Locator;

  constructor(page: Page) {
    super(page, page.getByRole('dialog'));
    this.closeButton = this.modal.getByRole('button', { name: 'Close' });
    this.issuer = this.modal.locator('#issuer');
    this.fingerprint = this.modal.locator('#fingerprint');
    this.expirationDate = this.modal.locator('#expiration');
    this.trustCheckbox = this.modal.locator('#certificate-check');
  }

  async close(): Promise<void> {
    await this.closeButton.click();
    await this.waitForModalToClose();
  }

  async getExpirationDate(): Promise<string> {
    return (await this.expirationDate.textContent()) ?? '';
  }

  async getFingerprint(): Promise<string> {
    return (await this.fingerprint.textContent()) ?? '';
  }

  async getIssuer(): Promise<string> {
    return (await this.issuer.textContent()) ?? '';
  }

  async trustAndSave(): Promise<void> {
    await this.trustCheckbox.check();
    await this.save();
  }

  async verifyCertificateDetails(): Promise<void> {
    await expect(this.issuer).toBeVisible();
    await expect(this.fingerprint).toBeVisible();
    await expect(this.expirationDate).toBeVisible();
  }

  async verifyModalTitle(): Promise<void> {
    await expect(this.modal.getByRole('heading', { name: 'Verify certificate' })).toBeVisible();
  }

  override async waitForModalToOpen(): Promise<void> {
    await super.waitForModalToOpen();
    await this.verifyModalTitle();
  }
}
