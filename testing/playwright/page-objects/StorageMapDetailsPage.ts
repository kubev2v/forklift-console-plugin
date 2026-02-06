import { expect, type Page } from '@playwright/test';

import { NavigationHelper } from '../utils/NavigationHelper';
import { MTV_NAMESPACE } from '../utils/resource-manager/constants';
import { isEmpty } from '../utils/utils';

import { StorageMapEditModal } from './PlanDetailsPage/modals/StorageMapEditModal';
import { YamlEditorPage } from './YamlEditorPage';

export class StorageMapDetailsPage {
  private readonly navigationHelper: NavigationHelper;
  private readonly yamlEditor: YamlEditorPage;
  protected readonly page: Page;
  public readonly storageMapEditModal: StorageMapEditModal;

  constructor(page: Page) {
    this.page = page;
    this.navigationHelper = new NavigationHelper(page);
    this.yamlEditor = new YamlEditorPage(page);
    this.storageMapEditModal = new StorageMapEditModal(page);
  }

  private storageMapEditButton() {
    return this.page.getByTestId('storage-map-edit-button');
  }

  async navigate(storageMapName: string, namespace = MTV_NAMESPACE): Promise<void> {
    await this.navigationHelper.navigateToK8sResource({
      resource: 'StorageMap',
      name: storageMapName,
      namespace,
    });
  }

  async navigateToYamlTab(): Promise<void> {
    await this.page.getByRole('tab', { name: 'YAML' }).click();
    await expect(this.page.locator('.monaco-editor')).toBeVisible();
  }

  async openEditModal(): Promise<StorageMapEditModal> {
    // Ensure we're on the StorageMap details page before trying to open modal
    await expect(this.page.getByRole('heading', { name: /Storage map details/i })).toBeVisible();
    await expect(this.storageMapEditButton()).toBeVisible();
    await this.storageMapEditButton().click();
    await this.storageMapEditModal.waitForModalToOpen();
    // Wait for modal content to be ready
    await this.page.waitForLoadState('networkidle');
    return this.storageMapEditModal;
  }

  async verifyStorageMapDetailsPage(expectedData: {
    storageMapName: string;
    sourceProvider: string;
    targetProvider: string;
    mappings?: {
      sourceStorage: string;
      targetStorage: string;
    }[];
    status?: 'Ready' | 'NotReady';
  }) {
    await expect(this.page).toHaveURL(
      new RegExp(
        `/k8s/ns/[^/]+/forklift\\.konveyor\\.io~v1beta1~StorageMap/${expectedData.storageMapName}$`,
      ),
    );

    await expect(this.page).toHaveTitle(
      new RegExp(`${expectedData.storageMapName}.*Storage Map.*Details`),
    );
    await expect(
      this.page.getByRole('heading', {
        name: new RegExp(`StorageMap.*${expectedData.storageMapName}`),
      }),
    ).toBeVisible();

    await expect(this.page.getByRole('heading', { name: 'Storage map details' })).toBeVisible();

    await expect(
      this.page.getByTestId('name-detail-item').getByText(expectedData.storageMapName),
    ).toBeVisible();

    await expect(this.page.locator('time').first()).toBeVisible();

    await expect(this.page.getByRole('heading', { name: 'Providers' })).toBeVisible();

    await expect(this.page.getByText('Source provider')).toBeVisible();
    await expect(this.page.getByRole('link', { name: expectedData.sourceProvider })).toBeVisible();

    await expect(this.page.getByText('Target provider')).toBeVisible();
    await expect(this.page.getByRole('link', { name: expectedData.targetProvider })).toBeVisible();

    await expect(this.storageMapEditButton()).toBeVisible();

    if (expectedData.mappings && !isEmpty(expectedData.mappings)) {
      const mappingList = this.page
        .locator('tbody')
        .filter({ hasText: expectedData.mappings[0].sourceStorage });

      for (let i = 0; i < expectedData.mappings.length; i += 1) {
        const mapping = expectedData.mappings[i];
        const mappingRow = mappingList.locator('tr').nth(i);

        await expect(
          mappingRow.getByRole('gridcell', { name: mapping.sourceStorage }),
        ).toBeVisible();
        await expect(
          mappingRow.getByRole('gridcell', { name: mapping.targetStorage }),
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
          this.page.getByRole('gridcell', { name: 'The storage map is ready.' }),
        ).toBeVisible();
      }
    }
  }

  get yaml(): YamlEditorPage {
    return this.yamlEditor;
  }
}
