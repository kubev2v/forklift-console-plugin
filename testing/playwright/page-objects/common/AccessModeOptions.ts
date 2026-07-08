import { expect, type Locator, type Page } from '@playwright/test';

const ACCESS_MODE_FIELD = {
  accessMode: (index: number): string => `storageMap.${index}.accessMode`,
} as const;

const EXPANDABLE_TOGGLE_TEXT = 'Advanced options (optional)';
const RWO_WARNING_TEXT = 'ReadWriteOnce may prevent Live Migration';

/**
 * Page object for interacting with the access mode expandable section
 * in storage mapping rows. Works in create form, edit modal, and plan wizard.
 */
export class AccessModeOptions {
  private readonly container: Locator;
  private readonly page: Page;

  constructor(page: Page, container?: Locator) {
    this.page = page;
    this.container = container ?? page.locator('body');
  }

  private expandableToggle(index: number): Locator {
    const allToggles = this.container.getByText(EXPANDABLE_TOGGLE_TEXT);
    return allToggles.nth(index);
  }

  private fieldToggleButton(fieldId: string): Locator {
    return this.container.getByTestId(fieldId);
  }

  private async isExpanded(mappingIndex: number): Promise<boolean> {
    return this.fieldToggleButton(ACCESS_MODE_FIELD.accessMode(mappingIndex)).isVisible();
  }

  async collapseAdvancedOptions(mappingIndex: number): Promise<void> {
    if (await this.isExpanded(mappingIndex)) {
      await this.expandableToggle(mappingIndex).click();
      await this.fieldToggleButton(ACCESS_MODE_FIELD.accessMode(mappingIndex)).waitFor({
        state: 'hidden',
      });
    }
  }

  async expandAdvancedOptions(mappingIndex: number): Promise<void> {
    if (!(await this.isExpanded(mappingIndex))) {
      const toggle = this.expandableToggle(mappingIndex);
      await expect(toggle).toBeVisible();
      await toggle.click();
    }
    await this.fieldToggleButton(ACCESS_MODE_FIELD.accessMode(mappingIndex)).waitFor({
      state: 'visible',
    });
  }

  async getAccessModeText(mappingIndex: number): Promise<string> {
    const btn = this.fieldToggleButton(ACCESS_MODE_FIELD.accessMode(mappingIndex));
    return ((await btn.textContent()) ?? '').trim();
  }

  async selectAccessMode(mappingIndex: number, optionText: string): Promise<void> {
    const toggle = this.fieldToggleButton(ACCESS_MODE_FIELD.accessMode(mappingIndex));
    await expect(toggle).toBeVisible();
    await toggle.click();

    const listbox = this.page.getByRole('listbox');
    await expect(listbox).toBeVisible();

    const option = listbox.getByRole('option', { name: optionText });
    await expect(option).toBeVisible();
    await option.click();
  }

  async verifyAdvancedOptionsToggleNotVisible(mappingIndex: number): Promise<void> {
    await expect(this.expandableToggle(mappingIndex)).not.toBeVisible();
  }

  async verifyAdvancedOptionsToggleVisible(mappingIndex: number): Promise<void> {
    const toggle = this.expandableToggle(mappingIndex);
    await expect(toggle).toBeVisible();
  }

  async verifyRwoWarningNotVisible(): Promise<void> {
    const warning = this.container.getByText(RWO_WARNING_TEXT);
    await expect(warning).not.toBeVisible();
  }

  async verifyRwoWarningVisible(): Promise<void> {
    const warning = this.container.getByText(RWO_WARNING_TEXT);
    await expect(warning).toBeVisible();
  }
}
