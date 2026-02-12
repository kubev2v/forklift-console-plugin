import { expect } from '@playwright/test';

import { sharedProviderFixtures as test } from '../../../fixtures/resourceFixtures';
import { PlanDetailsPage } from '../../../page-objects/PlanDetailsPage/PlanDetailsPage';
import {
  NetworkTargets,
  SourceNetworks,
  SourceStorages,
  StorageClasses,
} from '../../../types/test-data';
import { requireVersion, V2_11_0 } from '../../../utils/version';

test.describe('Plan Details - Network Mapping Editing', { tag: '@downstream' }, () => {
  requireVersion(test, V2_11_0);
  test('should test mappings editing interactions on mappings tab', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }, testInfo) => {
    if (!testPlan) throw new Error('testPlan is required');

    const planDetailsPage = new PlanDetailsPage(page);
    await planDetailsPage.mappingsTab.navigateToMappingsTab();

    await test.step('Verify mappings tab and review tables', async () => {
      await planDetailsPage.mappingsTab.verifyMappingsTab();

      const networkMappingCount =
        await planDetailsPage.mappingsTab.getNetworkMappingCountFromReviewTable();
      expect(networkMappingCount).toBeGreaterThan(0);
      const networkMapName = await planDetailsPage.mappingsTab.getNetworkMapName();
      expect(networkMapName).toBeTruthy();

      await page.getByTestId('storage-map-review-table').waitFor({ state: 'visible' });
      const storageMappingCount =
        await planDetailsPage.mappingsTab.getStorageMappingCountFromReviewTable();
      expect(storageMappingCount).toBeGreaterThan(0);
      const storageMapName = await planDetailsPage.mappingsTab.getStorageMapName();
      expect(storageMapName).toBeTruthy();
    });

    await test.step('Verify edit modal structures', async () => {
      const networkModal = await planDetailsPage.mappingsTab.openNetworkMapEditModal();
      await networkModal.verifyModalStructure();
      const networkMappingCount = await networkModal.getMappingCount();
      expect(networkMappingCount).toBeGreaterThan(0);
      await networkModal.verifySaveButtonDisabled();
      await networkModal.cancel();

      const storageModal = await planDetailsPage.mappingsTab.openStorageMapEditModal();
      await storageModal.verifyModalStructure();
      const storageMappingCount = await storageModal.getMappingCount();
      expect(storageMappingCount).toBeGreaterThan(0);
      await storageModal.verifySaveButtonDisabled();
      await storageModal.cancel();
    });

    let originalNetworkTarget = '';

    await test.step('Edit network mapping: modify, revert, and verify cancellation', async () => {
      const modal = await planDetailsPage.mappingsTab.openNetworkMapEditModal();
      originalNetworkTarget = await modal.getTargetNetworkAtIndex(0);
      const newTarget = originalNetworkTarget.includes('Ignore')
        ? NetworkTargets.DEFAULT
        : NetworkTargets.IGNORE;

      await modal.selectTargetNetworkAtIndex(0, newTarget);
      await modal.verifySaveButtonEnabled();
      await modal.save();

      const modalAfterSave = await planDetailsPage.mappingsTab.openNetworkMapEditModal();
      const currentTarget = await modalAfterSave.getTargetNetworkAtIndex(0);
      expect(currentTarget).toContain(newTarget.split(' ')[0]);

      await modalAfterSave.selectTargetNetworkAtIndex(0, originalNetworkTarget);
      await modalAfterSave.verifySaveButtonEnabled();
      await modalAfterSave.save();

      const modalAfterRevert = await planDetailsPage.mappingsTab.openNetworkMapEditModal();
      const revertedTarget = await modalAfterRevert.getTargetNetworkAtIndex(0);
      expect(revertedTarget).toContain(originalNetworkTarget.split(' ')[0]);

      const tempTarget = revertedTarget.includes('Ignore')
        ? NetworkTargets.DEFAULT
        : NetworkTargets.IGNORE;
      await modalAfterRevert.selectTargetNetworkAtIndex(0, tempTarget);
      await modalAfterRevert.cancel();

      const modalAfterCancel = await planDetailsPage.mappingsTab.openNetworkMapEditModal();
      const targetAfterCancel = await modalAfterCancel.getTargetNetworkAtIndex(0);
      expect(targetAfterCancel).toContain(originalNetworkTarget.split(' ')[0]);
      await modalAfterCancel.cancel();
    });

    let originalStorageTarget = '';

    await test.step('Edit storage mapping: modify, revert, and verify cancellation', async () => {
      const modal = await planDetailsPage.mappingsTab.openStorageMapEditModal();
      originalStorageTarget = await modal.getTargetStorageAtIndex(0);
      await modal.selectTargetStorageAtIndex(0, StorageClasses.HOSTPATH_BASIC);
      await modal.verifySaveButtonEnabled();
      await modal.save();

      const modalAfterSave = await planDetailsPage.mappingsTab.openStorageMapEditModal();
      const currentTarget = await modalAfterSave.getTargetStorageAtIndex(0);
      expect(currentTarget).toBeTruthy();

      await modalAfterSave.selectTargetStorageAtIndex(0, originalStorageTarget);
      await modalAfterSave.verifySaveButtonEnabled();
      await modalAfterSave.save();

      const modalAfterRevert = await planDetailsPage.mappingsTab.openStorageMapEditModal();
      const revertedTarget = await modalAfterRevert.getTargetStorageAtIndex(0);
      expect(revertedTarget).toContain(originalStorageTarget.split(' ')[0]);

      await modalAfterRevert.selectTargetStorageAtIndex(0, StorageClasses.HOSTPATH_BASIC);
      await modalAfterRevert.cancel();

      const modalAfterCancel = await planDetailsPage.mappingsTab.openStorageMapEditModal();
      const targetAfterCancel = await modalAfterCancel.getTargetStorageAtIndex(0);
      expect(targetAfterCancel).toContain(originalStorageTarget.split(' ')[0]);
      await modalAfterCancel.cancel();
    });

    const addedNetworkSource = SourceNetworks.VM_NETWORK;
    const addedNetworkTarget = NetworkTargets.IGNORE;

    await test.step('Add and remove network mapping', async () => {
      const modal = await planDetailsPage.mappingsTab.openNetworkMapEditModal();
      const initialCount = await modal.getMappingCount();

      const newRowIndex = await modal.addMapping();
      expect(newRowIndex).toBe(initialCount);
      await modal.selectSourceNetworkAtIndex(newRowIndex, addedNetworkSource);
      await modal.selectTargetNetworkAtIndex(newRowIndex, addedNetworkTarget);
      await modal.verifySaveButtonEnabled();
      await modal.save();

      const modalAfterAdd = await planDetailsPage.mappingsTab.openNetworkMapEditModal();
      const countAfterAdd = await modalAfterAdd.getMappingCount();
      expect(countAfterAdd).toBe(initialCount + 1);
      const sourceValue = await modalAfterAdd.getSourceNetworkAtIndex(initialCount);
      const targetValue = await modalAfterAdd.getTargetNetworkAtIndex(initialCount);
      expect(sourceValue).toBeTruthy();
      expect(targetValue).toContain(addedNetworkTarget.split(' ')[0]);

      await modalAfterAdd.removeMapping(countAfterAdd - 1);
      const countAfterRemove = await modalAfterAdd.getMappingCount();
      expect(countAfterRemove).toBe(initialCount);
      await modalAfterAdd.verifySaveButtonEnabled();
      await modalAfterAdd.save();

      const modalAfterRemove = await planDetailsPage.mappingsTab.openNetworkMapEditModal();
      const finalCount = await modalAfterRemove.getMappingCount();
      expect(finalCount).toBe(initialCount);
      await modalAfterRemove.cancel();
    });

    const addedStorageSource = SourceStorages.NFS_US_MTV_V8;
    const addedStorageTarget = StorageClasses.HOSTPATH_BASIC;

    await test.step('Add and remove storage mapping', async () => {
      const modal = await planDetailsPage.mappingsTab.openStorageMapEditModal();
      const initialCount = await modal.getMappingCount();

      const newRowIndex = await modal.addMapping();
      expect(newRowIndex).toBe(initialCount);
      await modal.selectSourceStorageAtIndex(newRowIndex, addedStorageSource);
      await modal.selectTargetStorageAtIndex(newRowIndex, addedStorageTarget);
      await modal.verifySaveButtonEnabled();
      await modal.save();

      const modalAfterAdd = await planDetailsPage.mappingsTab.openStorageMapEditModal();
      const countAfterAdd = await modalAfterAdd.getMappingCount();
      expect(countAfterAdd).toBe(initialCount + 1);
      const sourceValue = await modalAfterAdd.getSourceStorageAtIndex(initialCount);
      const targetValue = await modalAfterAdd.getTargetStorageAtIndex(initialCount);
      expect(sourceValue).toBeTruthy();
      expect(targetValue).toBeTruthy();

      await modalAfterAdd.removeMapping(countAfterAdd - 1);
      const countAfterRemove = await modalAfterAdd.getMappingCount();
      expect(countAfterRemove).toBe(initialCount);
      await modalAfterAdd.verifySaveButtonEnabled();
      await modalAfterAdd.save();

      const modalAfterRemove = await planDetailsPage.mappingsTab.openStorageMapEditModal();
      const finalCount = await modalAfterRemove.getMappingCount();
      expect(finalCount).toBe(initialCount);
      await modalAfterRemove.cancel();
    });

    await test.step('Verify edit buttons accessible after modal interactions', async () => {
      await planDetailsPage.mappingsTab.verifyMappingsTab();
    });
  });
});
