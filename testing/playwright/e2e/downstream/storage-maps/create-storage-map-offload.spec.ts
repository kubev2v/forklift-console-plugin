import { expect } from '@playwright/test';

import { providerOnlyFixtures as test } from '../../../fixtures/resourceFixtures';
import { StorageMapCreatePage } from '../../../page-objects/StorageMapCreatePage';
import { StorageMapDetailsPage } from '../../../page-objects/StorageMapDetailsPage';
import { StorageMapsListPage } from '../../../page-objects/StorageMapsListPage';
import {
  ALL_STORAGE_PRODUCTS,
  OffloadPlugins,
  OffloadSecrets,
  StorageProducts,
} from '../../../types/test-data';
import { MTV_NAMESPACE } from '../../../utils/resource-manager/constants';
import { V2_11_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

test.describe(
  'Storage Offloading - Create, Verify & Edit Storage Map',
  { tag: '@downstream' },
  () => {
    requireVersion(test, V2_11_0);

    test('should create storage map with offload, verify details, and edit offload options', async ({
      page,
      resourceManager,
      testProvider,
    }) => {
      if (!testProvider) throw new Error('testProvider is required');

      const storageMapName = `offload-sm-${crypto.randomUUID().slice(0, 8)}`;
      const listPage = new StorageMapsListPage(page);
      const createPage = new StorageMapCreatePage(page);
      const detailsPage = new StorageMapDetailsPage(page);

      await test.step('Navigate to Create Storage Map form', async () => {
        await listPage.navigate(MTV_NAMESPACE);
        await listPage.clickCreateWithFormButton();
        await createPage.waitForPageLoad();
      });

      await test.step('Fill form: name, project, providers', async () => {
        await createPage.fillMapName(storageMapName);
        await createPage.selectProject(MTV_NAMESPACE);
        await createPage.selectSourceProvider(testProvider.metadata.name);
        await createPage.selectTargetProvider('host');
        await createPage.waitForMappingTableReady();
      });

      await test.step('Verify offload toggle visible for vSphere provider', async () => {
        await createPage.offload.verifyOffloadToggleVisible(0);
      });

      await test.step('Expand offload options and verify all 3 dropdowns', async () => {
        await createPage.offload.expandOffloadOptions(0);
        await createPage.offload.verifyAllDropdownsVisible(0);
      });

      await test.step('Verify Offload plugin dropdown has vSphere XCOPY option', async () => {
        await createPage.offload.verifyDropdownOptions(0, 'offloadPlugin', [
          OffloadPlugins.VSPHERE_XCOPY,
        ]);
      });

      await test.step('Verify Storage product dropdown contains all vendor options', async () => {
        await createPage.offload.verifyDropdownOptions(0, 'storageProduct', ALL_STORAGE_PRODUCTS);
      });

      await test.step('Configure offload options on first mapping row', async () => {
        await createPage.offload.selectOffloadPlugin(0, OffloadPlugins.VSPHERE_XCOPY);
        const pluginText = await createPage.offload.getOffloadPluginText(0);
        expect(pluginText).toContain(OffloadPlugins.VSPHERE_XCOPY);

        await createPage.offload.selectStorageSecret(0, OffloadSecrets.VS8_SECRET);
        const secretText = await createPage.offload.getStorageSecretText(0);
        expect(secretText).toContain(OffloadSecrets.VS8_SECRET);

        await createPage.offload.selectStorageProduct(0, StorageProducts.NETAPP_ONTAP);
        const productText = await createPage.offload.getStorageProductText(0);
        expect(productText).toContain(StorageProducts.NETAPP_ONTAP);
      });

      await test.step('Add second mapping and verify independent offload state', async () => {
        await createPage.addMapping();
        await createPage.offload.verifyOffloadToggleVisible(1);

        await createPage.offload.expandOffloadOptions(1);
        await createPage.offload.verifyAllDropdownsVisible(1);

        const pluginText = await createPage.offload.getOffloadPluginText(1);
        expect(pluginText).not.toContain(OffloadPlugins.VSPHERE_XCOPY);
      });

      await test.step('Collapse and re-expand first row to verify preserved values', async () => {
        await createPage.offload.collapseOffloadOptions(0);
        await createPage.offload.expandOffloadOptions(0);

        const pluginText = await createPage.offload.getOffloadPluginText(0);
        expect(pluginText).toContain(OffloadPlugins.VSPHERE_XCOPY);

        const productText = await createPage.offload.getStorageProductText(0);
        expect(productText).toContain(StorageProducts.NETAPP_ONTAP);
      });

      await test.step('Select source/target storage and submit form', async () => {
        await createPage.selectFirstAvailableSourceAtIndex(0);
        await createPage.selectFirstAvailableTargetAtIndex(0);
        await createPage.submit();
        resourceManager.addStorageMap(storageMapName, MTV_NAMESPACE);
      });

      await test.step('Verify landed on storage map details page', async () => {
        await detailsPage.waitForDetailsPageReady();
        await detailsPage.verifyOnDetailsPage();
      });

      await test.step('Open edit modal and verify offload options persisted', async () => {
        const modal = await detailsPage.openEditModal();
        await modal.verifyModalStructure();

        const mappingCount = await modal.getMappingCount();
        expect(mappingCount).toBeGreaterThan(0);

        await modal.offload.verifyOffloadToggleVisible(0);
        await modal.offload.expandOffloadOptions(0);

        const pluginText = await modal.offload.getOffloadPluginText(0);
        expect(pluginText).toContain(OffloadPlugins.VSPHERE_XCOPY);

        const productText = await modal.offload.getStorageProductText(0);
        expect(productText).toContain(StorageProducts.NETAPP_ONTAP);

        await modal.cancel();
      });

      await test.step('Edit offload options and save', async () => {
        const modal = await detailsPage.openEditModal();

        await modal.offload.expandOffloadOptions(0);
        await modal.offload.selectStorageProduct(0, StorageProducts.HITACHI_VANTARA);

        await modal.verifySaveButtonEnabled();
        await modal.save();
      });

      await test.step('Verify updated offload options persisted after save', async () => {
        await detailsPage.verifyOnDetailsPage();

        const modal = await detailsPage.openEditModal();
        await modal.offload.expandOffloadOptions(0);

        const productText = await modal.offload.getStorageProductText(0);
        expect(productText).toContain(StorageProducts.HITACHI_VANTARA);

        await modal.cancel();
      });
    });
  },
);
