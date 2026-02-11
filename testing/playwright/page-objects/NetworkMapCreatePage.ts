import { expect, type Page } from '@playwright/test';

export class NetworkMapCreatePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private sourceNetworkTestId(index: number): string {
    return `source-network-networkMap.${index}.sourceNetwork`;
  }

  private targetNetworkTestId(index: number): string {
    return `target-network-networkMap.${index}.targetNetwork`;
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

    const switchElement = this.page.locator('#show-default-projects-switch');
    if (!(await switchElement.isChecked())) {
      await this.page.locator('label[for="show-default-projects-switch"]').click();
    }

    const projectCombobox = projectSelect.getByRole('combobox');
    await projectCombobox.fill(data.project);
    await this.page.getByRole('option', { name: data.project }).click();

    const sourceProviderSelect = this.page.getByTestId('network-map-source-provider-select');
    await sourceProviderSelect.click();
    await this.page
      .locator('button[role="option"]')
      .filter({ hasText: data.sourceProvider })
      .click();

    const targetProviderSelect = this.page.getByTestId('network-map-target-provider-select');
    await targetProviderSelect.click();
    await this.page
      .locator('button[role="option"]')
      .filter({ hasText: data.targetProvider })
      .click();

    await this.populateMapping(0, data.sourceNetwork, data.targetNetwork);
  }

  async populateMapping(index: number, sourceNetwork: string, targetNetwork: string) {
    const sourceSelect = this.page.getByTestId(this.sourceNetworkTestId(index));
    const targetSelect = this.page.getByTestId(this.targetNetworkTestId(index));

    await expect(sourceSelect).toBeVisible({ timeout: 10000 });
    await expect(sourceSelect).toBeEnabled();
    await sourceSelect.click();
    await this.page.getByRole('option', { name: sourceNetwork }).click();

    await expect(targetSelect).toBeVisible();
    await expect(targetSelect).toBeEnabled();
    await targetSelect.click();
    await this.page.getByRole('option', { name: targetNetwork }).click();
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
