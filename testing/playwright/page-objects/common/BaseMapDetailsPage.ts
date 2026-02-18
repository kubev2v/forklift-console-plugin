/* eslint-disable perfectionist/sort-classes */
import { expect, type Locator, type Page } from '@playwright/test';

import { NavigationHelper } from '../../utils/NavigationHelper';
import { MTV_NAMESPACE } from '../../utils/resource-manager/constants';
import { isEmpty } from '../../utils/utils';
import { YamlEditorPage } from '../YamlEditorPage';

/**
 * Configuration for a map details page.
 */
export interface MapDetailsPageConfig {
  /** The K8s resource type (e.g., 'StorageMap', 'NetworkMap') */
  resourceType: 'StorageMap' | 'NetworkMap';
  /** The display name for the map type (e.g., 'Storage map', 'Network map') */
  mapTypeDisplay: string;
  /** The data-testid for the edit button */
  editButtonTestId: string;
  /** The ready message text */
  readyMessage: string;
}

/**
 * Expected data for verifying a map details page.
 */
export interface MapDetailsExpectedData {
  mapName: string;
  sourceProvider: string;
  targetProvider: string;
  mappings?: {
    source: string;
    target: string;
  }[];
  status?: 'Ready' | 'NotReady';
}

/**
 * Base class for map details pages (Storage and Network).
 * Contains all shared functionality for interacting with map details pages.
 */
export abstract class BaseMapDetailsPage {
  protected abstract readonly config: MapDetailsPageConfig;
  protected readonly navigationHelper: NavigationHelper;
  protected readonly page: Page;

  private readonly yamlEditor: YamlEditorPage;

  constructor(page: Page) {
    this.page = page;
    this.navigationHelper = new NavigationHelper(page);
    this.yamlEditor = new YamlEditorPage(page);
  }

  protected editButtonLocator(): Locator {
    return this.page.getByTestId(this.config.editButtonTestId);
  }

  protected detailsHeadingLocator(): Locator {
    return this.page.getByRole('heading', { name: `${this.config.mapTypeDisplay} details` });
  }

  async verifyOnDetailsPage(): Promise<void> {
    await expect(this.detailsHeadingLocator()).toBeVisible();
    await expect(this.editButtonLocator()).toBeVisible();
  }

  async waitForDetailsPageReady(timeout = 30_000): Promise<void> {
    await expect(this.detailsHeadingLocator()).toBeVisible({ timeout });
  }

  async navigate(mapName: string, namespace = MTV_NAMESPACE): Promise<void> {
    await this.navigationHelper.navigateToK8sResource({
      resource: this.config.resourceType,
      name: mapName,
      namespace,
    });
  }

  async navigateToYamlTab(): Promise<void> {
    await this.page.getByRole('tab', { name: 'YAML' }).click();
    await expect(this.page.locator('.monaco-editor')).toBeVisible();
  }

  async verifyMapDetailsPage(expectedData: MapDetailsExpectedData): Promise<void> {
    const urlPattern = new RegExp(
      String.raw`/k8s/ns/[^/]+/forklift\.konveyor\.io~v1beta1~${this.config.resourceType}/${expectedData.mapName}$`,
    );
    await expect(this.page).toHaveURL(urlPattern);

    await expect(this.page).toHaveTitle(
      new RegExp(`${expectedData.mapName}.*${this.config.mapTypeDisplay}.*Details`, 'i'),
    );
    await expect(
      this.page.getByRole('heading', {
        name: new RegExp(`${this.config.resourceType}.*${expectedData.mapName}`),
      }),
    ).toBeVisible();

    await this.verifyOnDetailsPage();

    await expect(
      this.page.getByTestId('name-detail-item').getByText(expectedData.mapName),
    ).toBeVisible();

    await expect(this.page.locator('time').first()).toBeVisible();

    await expect(this.page.getByRole('heading', { name: 'Providers' })).toBeVisible();

    await expect(this.page.getByText('Source provider')).toBeVisible();
    await expect(this.page.getByRole('link', { name: expectedData.sourceProvider })).toBeVisible();

    await expect(this.page.getByText('Target provider')).toBeVisible();
    await expect(this.page.getByRole('link', { name: expectedData.targetProvider })).toBeVisible();

    if (expectedData.mappings && !isEmpty(expectedData.mappings)) {
      const mappingList = this.page
        .locator('tbody')
        .filter({ hasText: expectedData.mappings[0].source });

      for (let i = 0; i < expectedData.mappings.length; i += 1) {
        const mapping = expectedData.mappings[i];
        const mappingRow = mappingList.locator('tr').nth(i);

        await expect(mappingRow.getByRole('gridcell', { name: mapping.source })).toBeVisible();
        await expect(mappingRow.getByRole('gridcell', { name: mapping.target })).toBeVisible();
      }
    }

    await expect(this.page.getByRole('heading', { name: 'Conditions' })).toBeVisible();

    if (expectedData.status) {
      const statusText = expectedData.status === 'Ready' ? 'True' : 'False';
      await expect(this.page.getByRole('gridcell', { name: 'Ready' })).toBeVisible();
      await expect(this.page.getByRole('gridcell', { name: statusText })).toBeVisible();

      if (expectedData.status === 'Ready') {
        await expect(
          this.page.getByRole('gridcell', { name: this.config.readyMessage }),
        ).toBeVisible();
      }
    }
  }

  get yaml(): YamlEditorPage {
    return this.yamlEditor;
  }
}
