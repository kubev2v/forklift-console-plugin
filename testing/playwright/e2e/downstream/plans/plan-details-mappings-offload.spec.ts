import { expect } from '@playwright/test';

import { sharedProviderFixtures as test } from '../../../fixtures/resourceFixtures';
import { PlanDetailsPage } from '../../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { OffloadPlugins, OffloadSecrets, StorageProducts } from '../../../types/test-data';
import { V2_11_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

test.describe('Storage Offloading - Plan Details Mappings Tab', { tag: '@downstream' }, () => {
  requireVersion(test, V2_11_0);

  test('should display storage mappings and allow editing offload from plan Mappings tab', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    if (!testPlan) throw new Error('testPlan is required');

    const planDetailsPage = new PlanDetailsPage(page);

    await test.step('Navigate to Mappings tab', async () => {
      await planDetailsPage.mappingsTab.navigateToMappingsTab();
      await planDetailsPage.mappingsTab.verifyMappingsTab();
    });

    await test.step('Verify storage map section has mappings', async () => {
      await planDetailsPage.mappingsTab.storageMapReviewTable.waitFor({ state: 'visible' });

      const storageMappingCount =
        await planDetailsPage.mappingsTab.getStorageMappingCountFromReviewTable();
      expect(storageMappingCount).toBeGreaterThan(0);

      const storageMapName = await planDetailsPage.mappingsTab.getStorageMapName();
      expect(storageMapName).toBeTruthy();
    });

    await test.step('Open storage map edit modal and verify offload options', async () => {
      const modal = await planDetailsPage.mappingsTab.openStorageMapEditModal();
      await modal.verifyModalStructure();

      const mappingCount = await modal.getMappingCount();
      expect(mappingCount).toBeGreaterThan(0);

      for (let i = 0; i < mappingCount; i += 1) {
        await modal.offload.verifyOffloadToggleVisible(i);
      }

      await modal.verifySaveButtonDisabled();
      await modal.cancel();
    });

    await test.step('Configure offload options and save', async () => {
      const modal = await planDetailsPage.mappingsTab.openStorageMapEditModal();

      await modal.offload.expandOffloadOptions(0);
      await modal.offload.verifyAllDropdownsVisible(0);

      await modal.offload.selectOffloadPlugin(0, OffloadPlugins.VSPHERE_XCOPY);
      await modal.offload.selectStorageSecret(0, OffloadSecrets.VS8_SECRET);
      await modal.offload.selectStorageProduct(0, StorageProducts.NETAPP_ONTAP);

      await modal.verifySaveButtonEnabled();
      await modal.save();
    });

    await test.step('Verify offload values persisted after save', async () => {
      await planDetailsPage.mappingsTab.verifyMappingsTab();

      const modal = await planDetailsPage.mappingsTab.openStorageMapEditModal();
      await modal.verifyModalStructure();

      const mappingCount = await modal.getMappingCount();
      expect(mappingCount).toBeGreaterThan(0);

      await modal.offload.verifyOffloadToggleVisible(0);
      await modal.offload.expandOffloadOptions(0);

      const pluginText = await modal.offload.getOffloadPluginText(0);
      expect(pluginText).toContain(OffloadPlugins.VSPHERE_XCOPY);

      const secretText = await modal.offload.getStorageSecretText(0);
      expect(secretText).toContain(OffloadSecrets.VS8_SECRET);

      const productText = await modal.offload.getStorageProductText(0);
      expect(productText).toContain(StorageProducts.NETAPP_ONTAP);

      await modal.cancel();
    });
  });
});
