import { expect, type Page } from '@playwright/test';

export class NetworkMapCreatePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async addMapping() {
    const addMappingButton = this.page.getByRole('button', { name: 'Add mapping' });
    await expect(addMappingButton).toBeEnabled();
    await addMappingButton.click();
  }

  get createButton() {
    return this.page.getByTestId('network-map-create-button');
  }

  async fillRequiredFields(data: {
    mapName: string;
    project: string;
    sourceProvider: string;
    targetProvider: string;
    sourceNetwork: string;
    targetNetwork: string;
  }) {
    const mapNameInput = this.page.getByTestId('network-map-name-input');
    await mapNameInput.clear();
    await mapNameInput.fill(data.mapName);

    const projectSelect = this.page.getByTestId('network-map-project-select');
    await projectSelect.click();
    await this.page.getByRole('option', { name: data.project }).click();

    const sourceProviderSelect = this.page.getByTestId('network-map-source-provider-select');
    await sourceProviderSelect.click();
    await this.page.getByRole('option', { name: data.sourceProvider }).click();

    const targetProviderSelect = this.page.getByTestId('network-map-target-provider-select');
    await targetProviderSelect.click();
    await this.page.getByRole('option', { name: data.targetProvider }).click();

    const sourceNetworkSelect = this.page.getByTestId('network-map-source-network-select').first();
    await expect(sourceNetworkSelect).not.toBeDisabled();
    await sourceNetworkSelect.click();
    await this.page.getByRole('option', { name: data.sourceNetwork }).click();

    const targetNetworkSelect = this.page.getByTestId('network-map-target-network-select').first();
    await expect(targetNetworkSelect).not.toBeDisabled();
    await targetNetworkSelect.click();
    await this.page.getByRole('option', { name: data.targetNetwork }).click();
  }

  async populateMapping(index: number, sourceNetwork: string, targetNetwork: string) {
    const sourceNetworkSelects = this.page.getByTestId('network-map-source-network-select');
    const targetNetworkSelects = this.page.getByTestId('network-map-target-network-select');

    const sourceCount = await sourceNetworkSelects.count();
    const targetCount = await targetNetworkSelects.count();

    if (index >= sourceCount || index >= targetCount) {
      throw new Error(
        `Cannot populate mapping at index ${index}. Only ${Math.min(sourceCount, targetCount)} mappings available.`,
      );
    }

    const sourceSelect = sourceNetworkSelects.nth(index);
    await expect(sourceSelect).not.toBeDisabled();
    await sourceSelect.click();
    await this.page.locator('button[role="option"]').filter({ hasText: sourceNetwork }).click();

    const targetSelect = targetNetworkSelects.nth(index);
    await expect(targetSelect).not.toBeDisabled();
    await targetSelect.click();
    await this.page.locator('button[role="option"]').filter({ hasText: targetNetwork }).click();
  }

  async removeMapping(index: number) {
    const removeButtons = this.page.locator('table tbody tr td:last-child button');

    const count = await removeButtons.count();
    if (count <= index) {
      throw new Error(`Cannot remove mapping at index ${index}. Only ${count} mappings available.`);
    }

    await removeButtons.nth(index).click();
  }

  async submitForm(expectedMapName: string) {
    await expect(this.createButton).toBeVisible();
    await expect(this.createButton).not.toBeDisabled();
    await this.createButton.click();

    await this.page.waitForURL(
      new RegExp(
        `/k8s/ns/[^/]+/forklift\\.konveyor\\.io~v1beta1~NetworkMap/${expectedMapName}[^/]*$`,
      ),
    );
  }

  async waitForPageLoad() {
    const pageTitle = this.page.getByRole('heading', { name: 'Create network map' });
    const mapNameInput = this.page.getByTestId('network-map-name-input');
    const projectSelect = this.page.getByTestId('network-map-project-select');

    await expect(pageTitle).toBeVisible();
    await expect(mapNameInput).toBeVisible();
    await expect(projectSelect).toBeVisible();
  }
}
