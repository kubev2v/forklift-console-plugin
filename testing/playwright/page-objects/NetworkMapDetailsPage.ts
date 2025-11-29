import { expect, type Page } from '@playwright/test';

import { isEmpty } from '../utils/utils';

import { YamlEditorPage } from './YamlEditorPage';

export class NetworkMapDetailsPage {
  private readonly yamlEditor: YamlEditorPage;
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.yamlEditor = new YamlEditorPage(page);
  }

  async navigateToYamlTab(): Promise<void> {
    await this.page.getByRole('tab', { name: 'YAML' }).click();
    await expect(this.page.locator('.monaco-editor')).toBeVisible();
  }

  async verifyNetworkMapDetailsPage(expectedData: {
    networkMapName: string;
    sourceProvider: string;
    targetProvider: string;
    mappings?: {
      sourceNetwork: string;
      targetNetwork: string;
    }[];
    status?: 'Ready' | 'NotReady';
  }) {
    await expect(this.page).toHaveURL(
      new RegExp(
        `/k8s/ns/[^/]+/forklift\\.konveyor\\.io~v1beta1~NetworkMap/${expectedData.networkMapName}$`,
      ),
    );

    await expect(this.page).toHaveTitle(
      new RegExp(`${expectedData.networkMapName}.*Network Map.*Details`),
    );
    await expect(
      this.page.getByRole('heading', {
        name: new RegExp(`NetworkMap.*${expectedData.networkMapName}`),
      }),
    ).toBeVisible();

    await expect(this.page.getByRole('heading', { name: 'Network map details' })).toBeVisible();

    await expect(
      this.page.getByTestId('name-detail-item').getByText(expectedData.networkMapName),
    ).toBeVisible();

    await expect(this.page.locator('time').first()).toBeVisible();

    await expect(this.page.getByRole('heading', { name: 'Providers' })).toBeVisible();

    await expect(this.page.getByText('Source provider')).toBeVisible();
    await expect(this.page.getByRole('link', { name: expectedData.sourceProvider })).toBeVisible();

    await expect(this.page.getByText('Target provider')).toBeVisible();
    await expect(this.page.getByRole('link', { name: expectedData.targetProvider })).toBeVisible();

    await expect(this.page.getByTestId('network-map-edit-button')).toBeVisible();

    if (expectedData.mappings && !isEmpty(expectedData.mappings)) {
      const mappingList = this.page
        .locator('tbody')
        .filter({ hasText: expectedData.mappings[0].sourceNetwork });

      for (let i = 0; i < expectedData.mappings.length; i += 1) {
        const mapping = expectedData.mappings[i];
        const mappingRow = mappingList.locator('tr').nth(i);

        await expect(
          mappingRow.getByRole('gridcell', { name: mapping.sourceNetwork }),
        ).toBeVisible();
        await expect(
          mappingRow.getByRole('gridcell', { name: mapping.targetNetwork }),
        ).toBeVisible();
      }
    }

    await expect(this.page.getByRole('heading', { name: 'Conditions' })).toBeVisible();

    if (expectedData.status) {
      const statusText = expectedData.status === 'Ready' ? 'True' : 'False';
      await expect(this.page.getByRole('gridcell', { name: 'Ready' })).toBeVisible();
      await expect(this.page.getByRole('gridcell', { name: statusText })).toBeVisible();

      if (expectedData.status === 'Ready') {
        await expect(
          this.page.getByRole('gridcell', { name: 'The network map is ready.' }),
        ).toBeVisible();
      }
    }
  }

  get yaml(): YamlEditorPage {
    return this.yamlEditor;
  }
}
