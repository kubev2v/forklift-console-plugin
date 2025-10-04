import { expect, type Locator, type Page } from '@playwright/test';

import { BaseModal } from '../../common/BaseModal';

export class GuestConversionModal extends BaseModal {
  readonly skipGuestConversionCheckbox: Locator;
  readonly useCompatibilityModeCheckbox: Locator;

  constructor(page: Page) {
    super(page, 'guest-conversion-mode-modal');
    this.skipGuestConversionCheckbox = this.page.getByTestId('skip-guest-conversion-checkbox');
    this.useCompatibilityModeCheckbox = this.page.getByTestId('use-compatibility-mode-checkbox');
  }

  async toggleSkipGuestConversion(check: boolean): Promise<void> {
    if (check) {
      await this.skipGuestConversionCheckbox.check();
    } else {
      await this.skipGuestConversionCheckbox.uncheck();
    }
    await expect(this.skipGuestConversionCheckbox).toBeChecked({ checked: check });
  }

  async toggleUseCompatibilityMode(check: boolean): Promise<void> {
    if (check) {
      await this.useCompatibilityModeCheckbox.check();
    } else {
      await this.useCompatibilityModeCheckbox.uncheck();
    }
    await expect(this.useCompatibilityModeCheckbox).toBeChecked({ checked: check });
  }

  async verifyCompatibilityWarningMessage(): Promise<void> {
    const compatibilityWarningMessage = this.modal.getByText(
      /If you don't use compatibility mode, you must have VirtIO drivers already installed in the source VM./,
    );
    await expect(compatibilityWarningMessage).toBeVisible();
  }

  async verifySkipGuestConversionCheckbox(shouldBeChecked: boolean): Promise<void> {
    await expect(this.skipGuestConversionCheckbox).toBeVisible();
    if (shouldBeChecked) {
      await expect(this.skipGuestConversionCheckbox).toBeChecked();
    } else {
      await expect(this.skipGuestConversionCheckbox).not.toBeChecked();
    }
  }

  async verifySkipWarningMessage(): Promise<void> {
    const skipWarningMessage = this.modal.getByText(
      /If skipped, the VMs' disk data will be duplicated byte-for-byte, allowing for faster conversions. However, there is a risk that the VMs might not function properly and it is not recommended./,
    );
    await expect(skipWarningMessage).toBeVisible();
  }

  async verifyUseCompatibilityModeVisibleAndChecked(): Promise<void> {
    await expect(this.useCompatibilityModeCheckbox).toBeVisible();
    await expect(this.useCompatibilityModeCheckbox).toBeChecked();
  }
}
