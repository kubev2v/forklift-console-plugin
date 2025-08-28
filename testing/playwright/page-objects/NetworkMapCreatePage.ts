import { expect, type Page } from '@playwright/test';

export class NetworkMapCreatePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
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

  async submitForm(expectedMapName: string) {
    const createButton = this.page.getByTestId('network-map-create-button');
    await expect(createButton).not.toBeDisabled();
    await createButton.click();

    // Wait for navigation to NetworkMap details page with the expected name
    await this.page.waitForURL(
      new RegExp(`/k8s/ns/[^/]+/forklift\\.konveyor\\.io~v1beta1~NetworkMap/${expectedMapName}$`),
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
