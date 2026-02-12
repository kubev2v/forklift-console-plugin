import { expect } from '@playwright/test';

import { sharedProviderStorageMapFixtures as test } from '../../../fixtures/resourceFixtures';
import { StorageMapDetailsPage } from '../../../page-objects/StorageMapDetailsPage';
import { requireVersion, V2_11_0 } from '../../../utils/version';

test.describe('Storage Map Details - Editing', { tag: '@downstream' }, () => {
  requireVersion(test, V2_11_0);

  test('should test storage map editing interactions', async ({
    page,
    testStorageMap,
    testProvider: _testProvider,
  }) => {
    if (!testStorageMap) throw new Error('testStorageMap is required');

    const storageMapDetailsPage = new StorageMapDetailsPage(page);
    await storageMapDetailsPage.navigate(testStorageMap.name);

    await test.step('Add initial mapping', async () => {
      const modal = await storageMapDetailsPage.openEditModal();
      await modal.verifyModalStructure();

      const newRowIndex = await modal.addMapping();
      expect(newRowIndex).toBe(0);

      await modal.selectFirstAvailableSourceAtIndex(newRowIndex);
      await modal.selectFirstAvailableTargetAtIndex(newRowIndex);

      await modal.verifySaveButtonEnabled();
      await modal.save();

      const modalAfterSave = await storageMapDetailsPage.openEditModal();
      const mappingCount = await modalAfterSave.getMappingCount();
      expect(mappingCount).toBe(1);
      await modalAfterSave.cancel();
    });

    await test.step('Edit storage mapping and verify save', async () => {
      const modal = await storageMapDetailsPage.openEditModal();
      const newTarget = await modal.selectDifferentTargetAtIndex(0);

      await modal.verifySaveButtonEnabled();
      await modal.save();

      const modalAfterSave = await storageMapDetailsPage.openEditModal();
      const currentTarget = await modalAfterSave.getTargetStorageAtIndex(0);
      expect(currentTarget).toBe(newTarget);
      await modalAfterSave.cancel();
    });

    await test.step('Add and remove additional mapping', async () => {
      const modal = await storageMapDetailsPage.openEditModal();
      const initialCount = await modal.getMappingCount();

      const newRowIndex = await modal.addMapping();
      expect(newRowIndex).toBe(initialCount);

      await modal.selectFirstAvailableSourceAtIndex(newRowIndex);
      await modal.selectFirstAvailableTargetAtIndex(newRowIndex);

      await modal.verifySaveButtonEnabled();
      await modal.save();

      const modalAfterAdd = await storageMapDetailsPage.openEditModal();
      const countAfterAdd = await modalAfterAdd.getMappingCount();
      expect(countAfterAdd).toBe(initialCount + 1);

      await modalAfterAdd.removeMapping(countAfterAdd - 1);
      expect(await modalAfterAdd.getMappingCount()).toBe(initialCount);
      await modalAfterAdd.save();
    });
  });
});
