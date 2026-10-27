import { expect, type Locator } from '@playwright/test';

import { DetailsTab } from './DetailsTab';

/** Settings tab — plan-level settings with category side nav. */
export class SettingsTab extends DetailsTab {
  async navigateToConvertorSection(): Promise<void> {
    await this.navigateToSettingsTab();
    await this.selectSettingsSection('convertor');
  }

  async navigateToGuestSection(): Promise<void> {
    await this.navigateToSettingsTab();
    await this.selectSettingsSection('guest');
  }

  async navigateToSettingsTab(): Promise<void> {
    const settingsLink = this.page
      .locator('[data-test-id="horizontal-link-Settings"]')
      .or(this.page.getByRole('tab', { name: 'Settings' }));
    await settingsLink.click();
    await expect(this.page.getByTestId('plan-settings-page')).toBeVisible();
  }

  async navigateToTargetVmSection(): Promise<void> {
    await this.navigateToSettingsTab();
    await this.selectSettingsSection('target');
  }

  async navigateToTransferSection(): Promise<void> {
    await this.navigateToSettingsTab();
    await this.selectSettingsSection('transfer');
  }

  async selectSettingsSection(sectionId: string): Promise<void> {
    await this.page.locator(`#plan-settings-nav-${sectionId}`).click();
    await expect(this.page.getByTestId(`plan-settings-section-${sectionId}`)).toBeVisible();
  }

  targetVMPowerStateDetailItem(): Locator {
    return this.page.getByTestId('target-vm-power-state-detail-item');
  }

  async verifyTargetPowerStateSetting(targetPowerState: 'auto' | 'off' | 'on'): Promise<void> {
    const labels: Record<'auto' | 'off' | 'on', string> = {
      auto: 'Retain source VM power state',
      off: 'Powered off',
      on: 'Powered on',
    };
    await this.navigateToTargetVmSection();
    await expect(this.targetVMPowerState(labels[targetPowerState])).toBeVisible();
  }
}
