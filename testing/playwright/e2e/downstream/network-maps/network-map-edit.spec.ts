import { expect } from '@playwright/test';

import { sharedProviderNetworkMapFixtures as test } from '../../../fixtures/resourceFixtures';
import { NetworkMapDetailsPage } from '../../../page-objects/NetworkMapDetailsPage';

test.describe('Network Map Details - Editing', { tag: '@downstream' }, () => {
  test('should test network map editing interactions', async ({
    page,
    testNetworkMap,
    testProvider: _testProvider,
  }) => {
    if (!testNetworkMap) throw new Error('testNetworkMap is required');

    const networkMapDetailsPage = new NetworkMapDetailsPage(page);
    await networkMapDetailsPage.navigate(testNetworkMap.name);

    await test.step('Verify network map details page loads correctly', async () => {
      await networkMapDetailsPage.verifyNetworkMapDetailsPage({
        networkMapName: testNetworkMap.name,
        sourceProvider: testNetworkMap.sourceProvider,
        targetProvider: testNetworkMap.targetProvider,
      });
    });

    await test.step('Add initial mapping', async () => {
      const modal = await networkMapDetailsPage.openEditModal();
      await modal.verifyModalStructure();

      const newRowIndex = await modal.addMapping();
      expect(newRowIndex).toBe(0);

      await modal.selectSourceNetworkAtIndex(newRowIndex, 'VM Network');
      await modal.selectTargetNetworkAtIndex(newRowIndex, 'Default network');
      await modal.verifySaveButtonEnabled();
      await modal.save();

      await networkMapDetailsPage.navigate(testNetworkMap.name);
      const modalAfterSave = await networkMapDetailsPage.openEditModal();
      const mappingCount = await modalAfterSave.getMappingCount();
      expect(mappingCount).toBe(1);
      await modalAfterSave.cancel();
    });

    await test.step('Edit network mapping and verify save', async () => {
      await networkMapDetailsPage.navigate(testNetworkMap.name);

      const modal = await networkMapDetailsPage.openEditModal();
      const originalTarget = await modal.getTargetNetworkAtIndex(0);
      const newTarget = originalTarget.toLowerCase().includes('default')
        ? 'Ignore network'
        : 'Default network';

      await modal.selectTargetNetworkAtIndex(0, newTarget);
      await modal.verifySaveButtonEnabled();
      await modal.save();

      await networkMapDetailsPage.navigate(testNetworkMap.name);
      const modalAfterSave = await networkMapDetailsPage.openEditModal();
      const currentTarget = await modalAfterSave.getTargetNetworkAtIndex(0);
      expect(currentTarget.toLowerCase()).toContain(newTarget.split(' ')[0].toLowerCase());
      await modalAfterSave.cancel();
    });

    await test.step('Add and remove additional mapping', async () => {
      await networkMapDetailsPage.navigate(testNetworkMap.name);

      const modal = await networkMapDetailsPage.openEditModal();
      const initialCount = await modal.getMappingCount();

      const newRowIndex = await modal.addMapping();
      expect(newRowIndex).toBe(initialCount);
      await modal.selectSourceNetworkAtIndex(newRowIndex, 'Mgmt Network');
      await modal.selectTargetNetworkAtIndex(newRowIndex, 'Ignore network');
      await modal.verifySaveButtonEnabled();
      await modal.save();

      await networkMapDetailsPage.navigate(testNetworkMap.name);
      const modalAfterAdd = await networkMapDetailsPage.openEditModal();
      const countAfterAdd = await modalAfterAdd.getMappingCount();
      expect(countAfterAdd).toBe(initialCount + 1);

      await modalAfterAdd.removeMapping(countAfterAdd - 1);
      expect(await modalAfterAdd.getMappingCount()).toBe(initialCount);
      await modalAfterAdd.save();
    });
  });
});
