import { expect } from '@playwright/test';

import { sharedProviderNetworkMapFixtures as test } from '../../../fixtures/resourceFixtures';
import { NetworkMapDetailsPage } from '../../../page-objects/NetworkMapDetailsPage';

test.describe('Network Map Details - Editing', { tag: '@downstream' }, () => {
  test('should test network map editing interactions', async ({
    page,
    testNetworkMap,
    testProvider: _testProvider,
  }) => {
    await page.pause();
    const networkMapDetailsPage = new NetworkMapDetailsPage(page);
    await networkMapDetailsPage.navigate(testNetworkMap.name);

    await test.step('Add initial mapping', async () => {
      const modal = await networkMapDetailsPage.openEditModal();
      await modal.verifyModalStructure();

      const newRowIndex = await modal.addMapping();
      expect(newRowIndex).toBe(0);

      await modal.selectSourceNetworkAtIndex(newRowIndex, 'VM Network');
      await modal.selectTargetNetworkAtIndex(newRowIndex, 'Default network');
      await modal.verifySaveButtonEnabled();
      await modal.save();

      const modalAfterSave = await networkMapDetailsPage.openEditModal();
      const mappingCount = await modalAfterSave.getMappingCount();
      expect(mappingCount).toBe(1);
      await modalAfterSave.cancel();
    });

    await test.step('Edit network mapping and verify save', async () => {
      const modal = await networkMapDetailsPage.openEditModal();

      // Change target from 'Default network' (set in previous step) to 'Ignore network'
      await modal.selectTargetNetworkAtIndex(0, 'Ignore network');
      await modal.verifySaveButtonEnabled();
      await modal.save();

      const modalAfterSave = await networkMapDetailsPage.openEditModal();
      const currentTarget = await modalAfterSave.getTargetNetworkAtIndex(0);
      expect(currentTarget.toLowerCase()).toContain('ignore');
      await modalAfterSave.cancel();
    });

    await test.step('Add and remove additional mapping', async () => {
      const modal = await networkMapDetailsPage.openEditModal();
      const initialCount = await modal.getMappingCount();

      const newRowIndex = await modal.addMapping();
      expect(newRowIndex).toBe(initialCount);
      await modal.selectSourceNetworkAtIndex(newRowIndex, 'Mgmt Network');
      await modal.selectTargetNetworkAtIndex(newRowIndex, 'Ignore network');
      await modal.verifySaveButtonEnabled();
      await modal.save();

      const modalAfterAdd = await networkMapDetailsPage.openEditModal();
      const countAfterAdd = await modalAfterAdd.getMappingCount();
      expect(countAfterAdd).toBe(initialCount + 1);

      await modalAfterAdd.removeMapping(countAfterAdd - 1);
      expect(await modalAfterAdd.getMappingCount()).toBe(initialCount);
      await modalAfterAdd.save();
    });
  });
});
