import { expect, type Page, test } from '@playwright/test';

import { TEST_DATA } from '../../fixtures/test-data';
import { setupForkliftIntercepts } from '../../intercepts';
import { StorageMapCreatePage } from '../../page-objects/StorageMapCreatePage';
import { StorageMapsListPage } from '../../page-objects/StorageMapsListPage';
import { MTV_NAMESPACE } from '../../utils/resource-manager/constants';

const FORKLIFT_CONTROLLER_RESPONSE = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'ForkliftControllerList',
  metadata: { continue: '', remainingItemCount: 0, resourceVersion: '1000' },
  items: [
    {
      apiVersion: 'forklift.konveyor.io/v1beta1',
      kind: 'ForkliftController',
      metadata: {
        name: 'forklift-controller',
        namespace: 'konveyor-forklift',
        uid: 'fc-uid-1',
        resourceVersion: '999',
      },
      // eslint-disable-next-line camelcase
      spec: { feature_copy_offload: true },
    },
  ],
};

const setupForkliftControllerIntercept = async (page: Page): Promise<void> => {
  await page.route(
    '**/apis/forklift.konveyor.io/v1beta1/namespaces/*/forkliftcontrollers*',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(FORKLIFT_CONTROLLER_RESPONSE),
      });
    },
  );
};

test.describe(
  'Storage Map Create - Duplicate source storage (MTV-6324)',
  { tag: '@upstream' },
  () => {
    test.beforeEach(async ({ page }) => {
      await setupForkliftIntercepts(page);
      await setupForkliftControllerIntercept(page);
    });

    test('allows selecting the same source storage on a second mapping row', async ({ page }) => {
      const storageMapsListPage = new StorageMapsListPage(page);
      const storageMapCreatePage = new StorageMapCreatePage(page);
      const sharedSource = TEST_DATA.datastores[0].name;

      await test.step('navigate and fill providers', async () => {
        await storageMapsListPage.navigate(MTV_NAMESPACE);
        await storageMapsListPage.clickCreateWithFormButton();
        await storageMapCreatePage.waitForPageLoad();
        await storageMapCreatePage.selectProject(MTV_NAMESPACE);
        await storageMapCreatePage.selectSourceProvider(TEST_DATA.providers.source.name);
        await storageMapCreatePage.selectTargetProvider(TEST_DATA.providers.target.name);
        await storageMapCreatePage.waitForMappingTableReady();
      });

      await test.step('map first row and add a second mapping', async () => {
        await storageMapCreatePage.selectSourceStorageAtIndex(0, sharedSource);
        await storageMapCreatePage.selectTargetStorageAtIndex(0, TEST_DATA.storageClasses[0].name);
        await storageMapCreatePage.addMapping();
        await expect(page.getByTestId('field-row-1')).toBeVisible();
      });

      await test.step('same source remains enabled and selectable on second row', async () => {
        await storageMapCreatePage.expectSourceStorageOptionEnabled(1, sharedSource);
        await storageMapCreatePage.selectSourceStorageAtIndex(1, sharedSource);
        await expect(page.getByTestId('source-storage-storageMap.1.sourceStorage')).toContainText(
          sharedSource,
        );
      });
    });
  },
);
