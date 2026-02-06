import { expect, type Page } from '@playwright/test';

import { NavigationHelper } from '../utils/NavigationHelper';
import { MTV_NAMESPACE } from '../utils/resource-manager/constants';
import { isEmpty } from '../utils/utils';

import { NetworkMapEditModal } from './PlanDetailsPage/modals/NetworkMapEditModal';
import { YamlEditorPage } from './YamlEditorPage';

export class NetworkMapDetailsPage {
  private readonly navigationHelper: NavigationHelper;
  private readonly yamlEditor: YamlEditorPage;
  public readonly networkMapEditModal: NetworkMapEditModal;
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.navigationHelper = new NavigationHelper(page);
    this.yamlEditor = new YamlEditorPage(page);
    this.networkMapEditModal = new NetworkMapEditModal(page);
  }

  private networkMapEditButton() {
    return this.page.getByTestId('network-map-edit-button');
  }

  async navigate(networkMapName: string, namespace = MTV_NAMESPACE): Promise<void> {
    await this.navigationHelper.navigateToK8sResource({
      resource: 'NetworkMap',
      name: networkMapName,
      namespace,
    });
  }

  async navigateToYamlTab(): Promise<void> {
    await this.page.getByRole('tab', { name: 'YAML' }).click();
    await expect(this.page.locator('.monaco-editor')).toBeVisible();
  }

  async openEditModal(): Promise<NetworkMapEditModal> {
    // Ensure we're on the NetworkMap details page before trying to open modal
    await expect(this.page.getByRole('heading', { name: /Network Map.*details/i })).toBeVisible();
    await expect(this.networkMapEditButton()).toBeVisible();
    await this.networkMapEditButton().click();
    await this.networkMapEditModal.waitForModalToOpen();
    // Wait for modal content to be ready
    await this.page.waitForLoadState('networkidle');
    return this.networkMapEditModal;
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
