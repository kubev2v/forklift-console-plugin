import type { Locator, Page } from '@playwright/test';

export class DetailsTab {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get applianceManagementDetailItem(): Locator {
    return this.page.getByTestId('appliance-management-detail-item');
  }

  async clickUploadButton(): Promise<void> {
    await this.uploadButton.click();
  }

  get errorAlert(): Locator {
    return this.page.getByTestId('ova-upload-error-alert');
  }

  get fileUploadInput(): Locator {
    return this.page.getByTestId('ova-file-upload-input');
  }

  async selectOvaFile(filePath: string): Promise<void> {
    const fileInput = this.page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(filePath);
  }

  get successAlert(): Locator {
    return this.page.getByTestId('ova-upload-success-alert');
  }

  get uploadButton(): Locator {
    return this.page.getByTestId('ova-upload-button');
  }

  get uploadSectionHeading(): Locator {
    return this.page.getByTestId('ova-upload-section-heading');
  }
}
