import { expect, type Locator, type Page } from '@playwright/test';

import { OffloadOptions } from './common/OffloadOptions';

export class StorageMapCreatePage {
  readonly offload: OffloadOptions;
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.offload = new OffloadOptions(page);
  }

  private async selectFirstAvailableOptionFromDropdown(testId: string): Promise<string> {
    const dropdown = this.page.getByTestId(testId);
    await expect(dropdown).toBeVisible();
    await expect(dropdown).toBeEnabled();
    await dropdown.click();

    const option = this.page.getByRole('listbox').getByRole('option').first();
    await expect(option).toBeVisible();
    const value = ((await option.textContent()) ?? '').trim();
    await option.click();
    return value;
  }

  private async selectOptionFromDropdown(testId: string, optionName: string): Promise<void> {
    const dropdown = this.page.getByTestId(testId);
    await expect(dropdown).toBeVisible();
    await expect(dropdown).toBeEnabled();
    await dropdown.click();
    await this.page.getByRole('listbox').getByRole('option', { name: optionName }).click();
  }

  private sourceStorageTestId(index: number): string {
    return `source-storage-storageMap.${index}.sourceStorage`;
  }

  private targetStorageTestId(index: number): string {
    return `target-storage-storageMap.${index}.targetStorage`;
  }

  async addMapping(): Promise<void> {
    const addButton = this.page.getByTestId('add-mapping-button');
    await expect(addButton).toBeEnabled();
    await addButton.click();
  }

  get createButton(): Locator {
    return this.page.getByTestId('create-storage-map-button');
  }

  async fillMapName(name: string): Promise<void> {
    const input = this.page.locator('[name="mapName"]');
    await input.clear();
    await input.fill(name);
  }

  async selectFirstAvailableSourceAtIndex(index: number): Promise<string> {
    return this.selectFirstAvailableOptionFromDropdown(this.sourceStorageTestId(index));
  }

  async selectFirstAvailableTargetAtIndex(index: number): Promise<string> {
    return this.selectFirstAvailableOptionFromDropdown(this.targetStorageTestId(index));
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
    await this.selectOptionFromDropdown(this.sourceStorageTestId(index), sourceName);
  }

  async selectTargetProvider(providerName: string): Promise<void> {
    await this.selectOptionFromDropdown('target-provider-select', providerName);
  }

  async selectTargetStorageAtIndex(index: number, storageName: string): Promise<void> {
    await this.selectOptionFromDropdown(this.targetStorageTestId(index), storageName);
  }

  async submit(): Promise<void> {
    await expect(this.createButton).toBeEnabled();
    await this.createButton.click();
  }

  async waitForMappingTableReady(): Promise<void> {
    await this.page.getByTestId('field-row-0').waitFor({ state: 'visible' });
  }

  async waitForPageLoad(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Create storage map' })).toBeVisible();
    await expect(this.page.locator('[name="mapName"]')).toBeVisible();
  }
}
