import { expect, type Locator, type Page } from '@playwright/test';

import type { ScriptConfig } from '../../../types/test-data';
import { disableGuidedTour } from '../../../utils/utils';
import { ScriptEditModal } from '../modals/ScriptEditModal';

export class AutomationTab {
  readonly automationTabLink: Locator;
  protected readonly page: Page;
  readonly scriptEditModal: ScriptEditModal;

  constructor(page: Page) {
    this.page = page;
    this.automationTabLink = this.page.locator('[data-test-id="horizontal-link-Automation"]');
    this.scriptEditModal = new ScriptEditModal(page);
  }

  async editScripts(scripts: ScriptConfig[]): Promise<void> {
    await this.openScriptEditModal();

    const existingCount = await this.scriptEditModal.getScriptCount();

    for (let i = existingCount - 1; i > 0; i -= 1) {
      await this.scriptEditModal.removeScript(i);
    }

    for (let i = 0; i < scripts.length; i += 1) {
      if (i > 0) {
        await this.scriptEditModal.addScript();
      }
      await this.scriptEditModal.configureScript(i, scripts[i]);
    }

    await this.scriptEditModal.save();
  }

  async navigateToAutomationTab(): Promise<void> {
    await disableGuidedTour(this.page);
    await this.automationTabLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async openScriptEditModal(): Promise<void> {
    await this.page.getByTestId('scripts-section-edit-button').click();
    await this.scriptEditModal.waitForModalToOpen();
  }

  async verifyConfigMapLink(): Promise<void> {
    await expect(this.page.getByTestId('scripts-configmap')).toBeVisible();
  }

  async verifyEditButtonDisabled(): Promise<void> {
    await expect(this.page.getByTestId('scripts-section-edit-button')).toBeDisabled();
  }

  async verifyEditButtonVisible(): Promise<void> {
    await expect(this.page.getByTestId('scripts-section-edit-button')).toBeVisible();
  }

  async verifyNoScripts(): Promise<void> {
    await expect(this.page.getByTestId('scripts-none')).toContainText('None');
  }

  async verifyScriptDetails(
    scriptName: string,
    guestType: string,
    scriptType: string,
  ): Promise<void> {
    await expect(this.page.getByTestId(`script-name-${scriptName}`)).toContainText(scriptName);
    await expect(this.page.getByTestId(`script-guest-type-${scriptName}`)).toContainText(guestType);
    await expect(this.page.getByTestId(`script-type-${scriptName}`)).toContainText(scriptType);
  }

  async verifyScriptVisible(scriptName: string): Promise<void> {
    await expect(this.page.getByTestId(`script-name-${scriptName}`)).toBeVisible();
  }
}
