import { expect, type Locator, type Page } from '@playwright/test';

import { AccessModeOptions } from './common/AccessModeOptions';
import { OffloadOptions } from './common/OffloadOptions';

const sourceStorageTestId = (index: number): string =>
  `source-storage-storageMap.${index}.sourceStorage`;

const targetStorageTestId = (index: number): string =>
  `target-storage-storageMap.${index}.targetStorage`;

export class StorageMapCreatePage {
  readonly accessMode: AccessModeOptions;
  readonly offload: OffloadOptions;
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.accessMode = new AccessModeOptions(page);
    this.offload = new OffloadOptions(page);
  }

  private async selectFirstAvailableOptionFromDropdown(testId: string): Promise<string> {
    const dropdown = this.page.getByTestId(testId);
    await expect(dropdown).toBeVisible();
    await expect(dropdown).toBeEnabled();
    await dropdown.click();

    const listbox = this.page.getByRole('listbox');
    await expect(listbox).toBeVisible();
    // Inventory can briefly show "No storages available" before options appear.
    const option = listbox.locator('[role="option"]:enabled').first();
    await expect(option).toBeVisible({ timeout: 30_000 });
    const value = ((await option.textContent()) ?? '').trim();
    await option.click();
    return value;
  }

  private async selectOptionFromDropdown(testId: string, optionName: string): Promise<void> {
    const OPTION_TIMEOUT = 30_000;
    const dropdown = this.page.getByTestId(testId);
    await expect(dropdown).toBeVisible();
    await expect(dropdown).toBeEnabled();
    await dropdown.click();

    const listbox = this.page.getByRole('listbox');
    await expect(listbox).toBeVisible();

    // ProviderSelect shows an empty-state until Ready providers appear in the watch.
    const option = listbox.getByRole('option', { name: optionName });
    await expect(option).toBeVisible({ timeout: OPTION_TIMEOUT });
    await option.click();
  }

  async addMapping(): Promise<void> {
    const addButton = this.page.getByTestId('add-mapping-button');
    await expect(addButton).toBeEnabled({ timeout: 30_000 });
    await addButton.click();
  }

  get createButton(): Locator {
    return this.page.getByTestId('create-storage-map-button');
  }

  async expectSourceStorageOptionEnabled(index: number, sourceName: string): Promise<void> {
    const dropdown = this.page.getByTestId(sourceStorageTestId(index));
    await expect(dropdown).toBeVisible();
    await expect(dropdown).toBeEnabled();
    await dropdown.click();
    const option = this.page.getByRole('listbox').getByRole('option', { name: sourceName });
    await expect(option).toBeVisible();
    await expect(option).toBeEnabled();
    // Close without selecting so callers can assert and then select explicitly.
    await this.page.keyboard.press('Escape');
  }

  async fillMapName(name: string): Promise<void> {
    const input = this.page.locator('[name="mapName"]');
    await input.clear();
    await input.fill(name);
  }

  async removeMapping(index: number): Promise<void> {
    const removeButton = this.page.getByTestId(`remove-row-${index}`);
    await expect(removeButton).toBeVisible();
    await expect(removeButton).toBeEnabled();
    await removeButton.click();
  }

  async selectFirstAvailableSourceAtIndex(index: number): Promise<string> {
    return this.selectFirstAvailableOptionFromDropdown(sourceStorageTestId(index));
  }

  async selectFirstAvailableTargetAtIndex(index: number): Promise<string> {
    return this.selectFirstAvailableOptionFromDropdown(targetStorageTestId(index));
  }

  async selectProject(project: string): Promise<void> {
    const projectToggle = this.page.getByTestId('project-select');
    await projectToggle.click();

    const switchElement = this.page.locator('#show-default-projects-switch');
    if (!(await switchElement.isChecked())) {
      await this.page.locator('label[for="show-default-projects-switch"]').click();
    }

    const combobox = this.page.getByTestId('project-select').getByRole('combobox');
    await combobox.fill(project);
    await this.page.getByRole('option', { name: project }).click();
  }

  async selectSourceProvider(providerName: string): Promise<void> {
    await this.selectOptionFromDropdown('source-provider-select', providerName);
  }

  async selectSourceStorageAtIndex(index: number, sourceName: string): Promise<void> {
    await this.selectOptionFromDropdown(sourceStorageTestId(index), sourceName);
  }

  async selectTargetProvider(providerName: string): Promise<void> {
    await this.selectOptionFromDropdown('target-provider-select', providerName);
  }

  async selectTargetStorageAtIndex(index: number, storageName: string): Promise<void> {
    await this.selectOptionFromDropdown(targetStorageTestId(index), storageName);
  }

  async submit(): Promise<void> {
    await expect(this.createButton).toBeEnabled();
    await this.createButton.click();
  }

  async submitForm(expectedMapName: string): Promise<void> {
    await this.submit();
    const expectedPathSuffix = `/forklift.konveyor.io~v1beta1~StorageMap/${expectedMapName}`;
    await this.page.waitForURL((url) => new URL(url).pathname.endsWith(expectedPathSuffix));
  }

  async waitForMappingTableReady(): Promise<void> {
    await this.page.getByTestId('field-row-0').waitFor({ state: 'visible' });
  }

  async waitForPageLoad(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Create storage map' })).toBeVisible();
    await expect(this.page.locator('[name="mapName"]')).toBeVisible();
  }
}
