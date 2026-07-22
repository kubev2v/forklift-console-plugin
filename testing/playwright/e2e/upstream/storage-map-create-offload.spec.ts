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
  // useFeatureFlags watches getDefaultNamespace() which returns konveyor-forklift
  // on OKD (CI) and openshift-mtv downstream. Use glob with wildcard namespace.
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

const setupSecretsIntercept = async (page: Page): Promise<void> => {
  await page.route(`**/api/v1/namespaces/${MTV_NAMESPACE}/secrets?limit=250`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        apiVersion: 'v1',
        items: [
          {
            apiVersion: 'v1',
            kind: 'Secret',
            metadata: {
              name: 'test-storage-secret',
              namespace: MTV_NAMESPACE,
              uid: 'test-secret-uid-1',
            },
            type: 'Opaque',
          },
        ],
      }),
    });
  });
};

test.describe(
  'Storage Map Create - Offload Dedicated Migration Hosts',
  { tag: '@upstream' },
  () => {
    test.beforeEach(async ({ page }) => {
      await setupForkliftIntercepts(page);
      await setupForkliftControllerIntercept(page);
      await setupSecretsIntercept(page);
    });

    test('dedicated migration hosts field appears only when offload plugin is selected', async ({
      page,
    }) => {
      const storageMapsListPage = new StorageMapsListPage(page);
      const storageMapCreatePage = new StorageMapCreatePage(page);

      await test.step('navigate to storage map create form', async () => {
        await storageMapsListPage.navigate(MTV_NAMESPACE);
        await storageMapsListPage.clickCreateWithFormButton();
        await storageMapCreatePage.waitForPageLoad();
      });

      await test.step('select providers and storage mapping', async () => {
        await storageMapCreatePage.selectProject(MTV_NAMESPACE);
        await storageMapCreatePage.selectSourceProvider(TEST_DATA.providers.source.name);
        await storageMapCreatePage.selectTargetProvider(TEST_DATA.providers.target.name);
        await storageMapCreatePage.waitForMappingTableReady();
        await storageMapCreatePage.selectSourceStorageAtIndex(0, TEST_DATA.datastores[0].name);
        await storageMapCreatePage.selectTargetStorageAtIndex(0, TEST_DATA.storageClasses[0].name);
      });

      await test.step('expand offload and verify hosts field is hidden without plugin', async () => {
        await storageMapCreatePage.offload.expandOffloadOptions(0);
        await storageMapCreatePage.offload.verifyDedicatedMigrationHostsNotVisible(0);
      });

      await test.step('select offload plugin and verify hosts field appears', async () => {
        await storageMapCreatePage.offload.selectOffloadPlugin(0, 'vSphere XCOPY');
        await storageMapCreatePage.offload.verifyDedicatedMigrationHostsVisible(0);
      });

      await test.step('select dedicated migration hosts', async () => {
        await storageMapCreatePage.offload.selectDedicatedMigrationHost(0, TEST_DATA.hosts[0].name);
      });

      await test.step('clear offload options and verify hosts field disappears', async () => {
        await storageMapCreatePage.offload.clickClearOffloadOptions(0);
        await storageMapCreatePage.offload.verifyDedicatedMigrationHostsNotVisible(0);
      });
    });

    test('dedicated migration hosts are included in submitted StorageMap CR', async ({ page }) => {
      const storageMapsListPage = new StorageMapsListPage(page);
      const storageMapCreatePage = new StorageMapCreatePage(page);
      const mapName = 'test-offload-hosts-map';
      // eslint-disable-next-line @typescript-eslint/init-declarations
      let submittedBody: Record<string, unknown> | undefined;

      await page.route(
        /\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/openshift-mtv\/storagemaps$/,
        async (route) => {
          if (route.request().method() === 'POST') {
            submittedBody = JSON.parse(route.request().postData() ?? '{}') as Record<
              string,
              unknown
            >;
            await route.fulfill({
              status: 201,
              contentType: 'application/json',
              body: JSON.stringify({
                apiVersion: 'forklift.konveyor.io/v1beta1',
                kind: 'StorageMap',
                metadata: { name: mapName, namespace: MTV_NAMESPACE, uid: 'test-uid' },
                spec: submittedBody.spec,
              }),
            });
          } else {
            await route.continue();
          }
        },
      );

      await test.step('navigate and fill form', async () => {
        await storageMapsListPage.navigate(MTV_NAMESPACE);
        await storageMapsListPage.clickCreateWithFormButton();
        await storageMapCreatePage.waitForPageLoad();
        await storageMapCreatePage.fillMapName(mapName);
        await storageMapCreatePage.selectProject(MTV_NAMESPACE);
        await storageMapCreatePage.selectSourceProvider(TEST_DATA.providers.source.name);
        await storageMapCreatePage.selectTargetProvider(TEST_DATA.providers.target.name);
        await storageMapCreatePage.waitForMappingTableReady();
        await storageMapCreatePage.selectSourceStorageAtIndex(0, TEST_DATA.datastores[0].name);
        await storageMapCreatePage.selectTargetStorageAtIndex(0, TEST_DATA.storageClasses[0].name);
      });

      await test.step('configure offload with dedicated hosts', async () => {
        await storageMapCreatePage.offload.expandOffloadOptions(0);
        await storageMapCreatePage.offload.selectOffloadPlugin(0, 'vSphere XCOPY');
        await storageMapCreatePage.offload.selectStorageSecret(0, 'test-storage-secret');
        await storageMapCreatePage.offload.selectStorageProduct(0, 'NetApp ONTAP');
        await storageMapCreatePage.offload.selectDedicatedMigrationHost(0, TEST_DATA.hosts[0].name);
      });

      await test.step('submit and verify CR contains dedicatedMigrationHosts', async () => {
        await storageMapCreatePage.submit();

        expect(submittedBody).toBeDefined();
        const spec = submittedBody!.spec as {
          map: {
            offloadPlugin?: {
              vsphereXcopyConfig?: { dedicatedMigrationHosts?: string[] };
            };
          }[];
        };
        expect(spec.map[0].offloadPlugin?.vsphereXcopyConfig?.dedicatedMigrationHosts).toEqual([
          TEST_DATA.hosts[0].id,
        ]);
      });
    });
  },
);
